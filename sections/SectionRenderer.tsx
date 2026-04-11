// sections/SectionRenderer.tsx
//
// Registry pattern: maps Sanity _type strings → React components.
// This is an ASYNC SERVER COMPONENT — all section components can be async too.
//
// HOW TO ADD A NEW SECTION:
//   1. Create schema: sanity/schemaTypes/blocks/mySection.ts
//   2. Register in: sanity/schemaTypes/blocks/index.ts
//   3. Add to page.ts sections[].of array
//   4. Create component: sections/MySection.tsx
//   5. Add case below: case 'mySection': return <MySection key={key} section={s} lang={lang} />
//
// CRITICAL — lang prop:
//   Every section that renders user-facing text MUST receive lang={lang}.
//   This ensures that when the URL is /hi/posts, the PostsPageSection fetches
//   Hindi copy from postsPageConfig, and so on for all sections.
//
// NOTE:
//   navbarSection and footerSection are structural — they are controlled by the
//   page layout in app/page.tsx and app/[lang]/page.tsx, NOT rendered here.
//   SectionRenderer returns null for both types to prevent double-rendering.

import type { SanitySection, SanityCustomSection, SanityComponent } from '@/types/sanity'

// ── Public sections ────────────────────────────────────────────────────────────
import { HeroSection }           from './HeroSection'
import { CtaSection }            from './CtaSection'
import { FeaturedPostsSection }  from './FeaturedPostsSection'
import { RecentPostsSection }    from './RecentPostsSection'
import { RichTextSection }       from './RichTextSection'
import { StatsSection }          from './StatsSection'
import { FormSection }           from './FormSection'
import { GridSection }           from './GridSection'
import { ImageSection }          from './ImageSection'
import { GallerySection }        from './GallerySection'
import { VideoSection }          from './VideoSection'
import { TabsSection }           from './TabsSection'
import { CarouselSection }       from './CarouselSection'
import { TableSection }          from './TableSection'
import { AuthHeroSection }       from './AuthHeroSection'
import {
  HeadingSection,
  FeatureListSection,
  TestimonialsSection,
  FaqSection,
  PricingSection,
  BannerSection,
  ColumnsSection,
  SpacerSection,
  DividerSection,
  NewsletterSection,
  NotFoundSection,
} from './newSections'
import { TimelineSection, TeamSection, LogoBarSection } from './TimelineTeamLogoBar'

// ── Auth sections — fully multilingual via lang prop ──────────────────────────
import { LoginSection }          from './LoginSection'
import { SignupSection }         from './SignupSection'
import { AuthFormSection }       from './AuthFormSection'
import { AuthLegalSection }      from './AuthLegalSection'

// ── Post detail ───────────────────────────────────────────────────────────────
import { PostDetailPageSection } from './PostDetailPageSection'

// ── App page sections — each fetches its own singleton config ─────────────────
import { PostsPageSection }      from './PostsPageSection'
import { AnalyticsSection }      from './AnalyticsSection'
import { SettingsSection }       from './SettingsSection'
import { BillingSection }        from './BillingSection'
import { AdminSection }          from './AdminSection'

// ─────────────────────────────────────────────────────────────────────────────

interface SectionRendererProps {
  sections: SanitySection[]
  lang?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySection = any

// ── Custom section component renderer ─────────────────────────────────────────
// Renders each component document in a custom section based on its type.

function renderComponent(component: SanityComponent | undefined, idx: number) {
  if (!component) return null

  const { type, name } = component
  if (!type) return null

  const config = component.config ?? {}
  const key = component._id ?? `component-${idx}`
  const label = config.label ?? name
  const placeholder = config.placeholder ?? ''
  const className = config.className ?? ''

  switch (type) {
    case 'button':
      return (
        <button
          key={key}
          className={`inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors ${className}`}
        >
          {label}
        </button>
      )
    case 'input':
      return (
        <input
          key={key}
          type="text"
          placeholder={placeholder || label}
          className={`block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className}`}
        />
      )
    case 'select':
      return (
        <select
          key={key}
          className={`block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${className}`}
        >
          <option value="">{label || placeholder}</option>
        </select>
      )
    case 'container':
      return (
        <div
          key={key}
          className={`rounded-lg border border-white/10 bg-white/5 p-4 ${className}`}
        >
          <p className="text-white/40 text-xs">{label}</p>
        </div>
      )
    case 'form':
      return (
        <form key={key} className={`space-y-4 ${className}`}>
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{label}</p>
        </form>
      )
    case 'grid':
      return (
        <div
          key={key}
          className={`grid grid-cols-2 gap-4 ${className}`}
        >
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-white/40 text-xs">{label}</p>
          </div>
        </div>
      )
    default:
      return null
  }
}

function CustomSectionRenderer({ section }: { section: SanityCustomSection; lang?: string }) {
  if (!section) return null

  const components = (section.components ?? []).filter(Boolean)
  if (components.length === 0) return null

  return (
    <section className="py-12 px-6 max-w-5xl mx-auto space-y-6">
      {section.title && (
        <h2 className="text-2xl font-bold text-white">{section.title}</h2>
      )}
      <div className="flex flex-wrap gap-4">
        {components.map((c, i) => renderComponent(c, i))}
      </div>
    </section>
  )
}

export async function SectionRenderer({ sections, lang = 'en' }: SectionRendererProps) {
  return (
    <>
      {sections.map((section, i) => {
        // Guard: skip undefined/null entries that can appear in malformed Sanity arrays
        if (!section) return null

        const key = ('_key' in section && section._key) ? section._key : `section-${i}`
        const s = section as AnySection

        switch (section._type) {

          // ── New system sections (current schema) ─────────────────────────
          case 'heroSection':     return <HeroSection        key={key} section={s} />
          case 'featuresSection': return <FeatureListSection key={key} section={s} />
          case 'postsSection':    return <PostsPageSection   key={key} lang={lang} />
          // authSection now drives AuthFormSection (right panel) — all copy from Sanity.
          // The mode determines whether LoginForm or SignupForm is rendered inside.
          case 'authSection':     return <AuthFormSection   key={key} section={s} />

          // authHeroSection = left branding panel (sticky, desktop only)
          case 'authHeroSection': return <AuthHeroSection   key={key} section={s} />

          // authLegalSection = full-width legal links row below the 2-col layout
          case 'authLegalSection': return <AuthLegalSection key={key} section={s} />

          case 'analyticsSection': return <AnalyticsSection  key={key} lang={lang} />
          // navbarSection and footerSection are controlled by layout — see NOTE at top of file
          case 'navbarSection':
          case 'footerSection':
            return null

          // ── Custom section (dereferenced from reference in page.sections) ─
          case 'section':               return <CustomSectionRenderer key={key} section={s} lang={lang} />

          // ── Legacy public sections ───────────────────────────────────────
          case 'ctaSection':            return <CtaSection           key={key} section={s} />
          case 'featuredPostsSection':  return <FeaturedPostsSection key={key} section={s} lang={lang} />
          case 'recentPostsSection':    return <RecentPostsSection   key={key} section={s} lang={lang} />
          case 'richTextSection':       return <RichTextSection      key={key} section={s} />
          case 'statsSection':          return <StatsSection         key={key} section={s} />
          case 'formSection':           return <FormSection          key={key} section={s} />

          // ── Layout ───────────────────────────────────────────────────────
          case 'gridSection':           return <GridSection     key={key} section={s} />
          case 'columnsSection':        return <ColumnsSection  key={key} section={s} />
          case 'spacerSection':         return <SpacerSection   key={key} section={s} />
          case 'dividerSection':        return <DividerSection  key={key} section={s} />

          // ── Content ──────────────────────────────────────────────────────
          case 'headingSection':        return <HeadingSection      key={key} section={s} />
          case 'featureListSection':    return <FeatureListSection   key={key} section={s} />
          case 'testimonialsSection':   return <TestimonialsSection  key={key} section={s} />
          case 'faqSection':            return <FaqSection           key={key} section={s} />
          case 'pricingSection':        return <PricingSection       key={key} section={s} />
          case 'teamSection':           return <TeamSection          key={key} section={s} />
          case 'logoBarSection':        return <LogoBarSection       key={key} section={s} />
          case 'carouselSection':       return <CarouselSection      key={key} section={s} />
          case 'tableSection':          return <TableSection         key={key} section={s} />
          case 'timelineSection':       return <TimelineSection      key={key} section={s} />
          case 'bannerSection':         return <BannerSection        key={key} section={s} />
          case 'tabsSection':           return <TabsSection          key={key} section={s} />

          // ── Media ────────────────────────────────────────────────────────
          case 'imageSection':          return <ImageSection   key={key} section={s} />
          case 'gallerySection':        return <GallerySection key={key} section={s} />
          case 'videoSection':          return <VideoSection   key={key} section={s} />

          // ── Interactive ──────────────────────────────────────────────────
          case 'newsletterSection':     return <NewsletterSection key={key} section={s} />
          case 'notFoundSection':       return <NotFoundSection   key={key} section={s} />
          case 'contactSection':        return null  // requires server action — handled separately

          // ── Auth pages — MUST pass lang so all copy is in the right language
          case 'loginSection':          return <LoginSection  key={key} section={s} lang={lang} />
          case 'signupSection':         return <SignupSection key={key} section={s} lang={lang} />
          case 'loginPageSection':      return <LoginSection  key={key} section={s} lang={lang} />
          case 'signupPageSection':     return <SignupSection key={key} section={s} lang={lang} />

          // ── Post detail ──────────────────────────────────────────────────
          case 'postDetailPageSection': return <PostDetailPageSection key={key} section={s} />

          // ── App page sections (legacy markers) ────────────────────────────
          case 'postsPageSection':      return <PostsPageSection    key={key} lang={lang} />
          case 'analyticsPageSection':  return <AnalyticsSection    key={key} lang={lang} />
          case 'settingsPageSection':   return <SettingsSection     key={key} lang={lang} />
          case 'billingPageSection':    return <BillingSection      key={key} lang={lang} />
          case 'adminPageSection':      return <AdminSection        key={key} lang={lang} />

          default:
            if (process.env.NODE_ENV === 'development') {
              console.warn(
                `[SectionRenderer] Unknown section type: "${(section as { _type: string })._type}". ` +
                `Add it to the switch statement in sections/SectionRenderer.tsx`
              )
            }
            return null
        }
      })}
    </>
  )
}