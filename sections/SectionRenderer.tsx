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

import type { SanitySection } from '@/types/sanity'

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

export async function SectionRenderer({ sections, lang = 'en' }: SectionRendererProps) {
  return (
    <>
      {sections.map((section, i) => {
        const key = ('_key' in section && section._key) ? section._key : `section-${i}`
        const s = section as AnySection

        switch (section._type) {

          // ── Core public sections ─────────────────────────────────────────
          case 'heroSection':           return <HeroSection          key={key} section={s} />
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
          case 'authHeroSection':       return <AuthHeroSection   key={key} section={s} />
          case 'notFoundSection':       return <NotFoundSection   key={key} section={s} />
          case 'contactSection':        return null  // requires server action — handled separately

          // ── Auth pages — MUST pass lang so all copy is in the right language
          case 'loginSection':          return <LoginSection  key={key} section={s} lang={lang} />
          case 'signupSection':         return <SignupSection key={key} section={s} lang={lang} />
          // These are the marker blocks used in page documents
          // They render the same components (loginSection = loginPageSection)
          case 'loginPageSection':      return <LoginSection  key={key} section={s} lang={lang} />
          case 'signupPageSection':     return <SignupSection key={key} section={s} lang={lang} />

          // ── Post detail ──────────────────────────────────────────────────
          case 'postDetailPageSection': return <PostDetailPageSection key={key} section={s} />

          // ── App page sections ─────────────────────────────────────────────
          // Each fetches its own singleton config (postsPageConfig, analyticsConfig, etc.)
          // and passes lang so the copy is in the right language.
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