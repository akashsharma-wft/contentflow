// sections/SectionRenderer.tsx
/**
 * SectionRenderer — registry pattern for CMS-driven page sections.
 * Maps Sanity _type strings → React components.
 *
 * ─── HOW TO ADD A NEW SECTION ────────────────────────────────────────────────
 * 1. Create schema in sanity/schemaTypes/blocks/
 * 2. Register the _type → component mapping below
 * 3. Add the component to sections/
 * 4. Add the _type to the `of` array in sanity/schemaTypes/documents/page.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { SanitySection } from '@/types/sanity'

// ── Existing public sections ───────────────────────────────────────────────────
import { HeroSection } from './HeroSection'
import { CtaSection } from './CtaSection'
import { FeaturedPostsSection } from './FeaturedPostsSection'
import { RecentPostsSection } from './RecentPostsSection'
import { RichTextSection } from './RichTextSection'
import { StatsSection } from './StatsSection'
import { FormSection } from './FormSection'
import { GridSection } from './GridSection'
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
import { ImageSection } from './ImageSection'
import { GallerySection } from './GallerySection'
import { VideoSection } from './VideoSection'
import { TabsSection } from './TabsSection'
import { TimelineSection, TeamSection, LogoBarSection } from './TimelineTeamLogoBar'
import { CarouselSection } from './CarouselSection'
import { TableSection } from './TableSection'
import { AuthHeroSection } from './AuthHeroSection'

// ── App page sections (each is a server component that fetches its own config) ─
import { PostsPageSection } from './PostsPageSection'
import { AnalyticsSection } from './AnalyticsSection'
import { SettingsSection } from './SettingsSection'
import { BillingSection } from './BillingSection'
import { AdminSection } from './AdminSection'

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
          // ── Existing public sections ───────────────────────────────────────
          case 'heroSection':            return <HeroSection key={key} section={s} />
          case 'ctaSection':             return <CtaSection key={key} section={s} />
          case 'featuredPostsSection':   return <FeaturedPostsSection key={key} section={s} lang={lang} />
          case 'recentPostsSection':     return <RecentPostsSection key={key} section={s} lang={lang} />
          case 'richTextSection':        return <RichTextSection key={key} section={s} />
          case 'statsSection':           return <StatsSection key={key} section={s} />
          case 'formSection':            return <FormSection key={key} section={s} />

          // ── Layout ────────────────────────────────────────────────────────
          case 'gridSection':            return <GridSection key={key} section={s} />
          case 'columnsSection':         return <ColumnsSection key={key} section={s} />
          case 'spacerSection':          return <SpacerSection key={key} section={s} />
          case 'dividerSection':         return <DividerSection key={key} section={s} />

          // ── Content ───────────────────────────────────────────────────────
          case 'headingSection':         return <HeadingSection key={key} section={s} />
          case 'featureListSection':     return <FeatureListSection key={key} section={s} />
          case 'testimonialsSection':    return <TestimonialsSection key={key} section={s} />
          case 'faqSection':             return <FaqSection key={key} section={s} />
          case 'pricingSection':         return <PricingSection key={key} section={s} />
          case 'teamSection':            return <TeamSection key={key} section={s} />
          case 'logoBarSection':         return <LogoBarSection key={key} section={s} />
          case 'carouselSection':        return <CarouselSection key={key} section={s} />
          case 'tableSection':           return <TableSection key={key} section={s} />
          case 'timelineSection':        return <TimelineSection key={key} section={s} />
          case 'bannerSection':          return <BannerSection key={key} section={s} />
          case 'tabsSection':            return <TabsSection key={key} section={s} />

          // ── Media ─────────────────────────────────────────────────────────
          case 'imageSection':           return <ImageSection key={key} section={s} />
          case 'gallerySection':         return <GallerySection key={key} section={s} />
          case 'videoSection':           return <VideoSection key={key} section={s} />

          // ── Interactive / Auth ────────────────────────────────────────────
          case 'newsletterSection':      return <NewsletterSection key={key} section={s} />
          case 'contactSection':         return null
          case 'authHeroSection':        return <AuthHeroSection key={key} section={s} />
          case 'notFoundSection':        return <NotFoundSection key={key} section={s} />

          // ── App page sections ─────────────────────────────────────────────
          // Each fetches its own singleton config server-side
          case 'postsPageSection':       return <PostsPageSection key={key} />
          case 'analyticsPageSection':   return <AnalyticsSection key={key} />
          case 'settingsPageSection':    return <SettingsSection key={key} />
          case 'billingPageSection':     return <BillingSection key={key} />
          case 'adminPageSection':       return <AdminSection key={key} />

          default:
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[SectionRenderer] Unknown section type: ${(section as { _type: string })._type}`)
            }
            return null
        }
      })}
    </>
  )
}