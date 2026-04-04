/**
 * SectionRenderer — registry pattern for CMS-driven page sections.
 *
 * Maps Sanity _type strings → React components.
 * Adding a new section type requires:
 *   1. Define schema in sanity/schemaTypes/blocks/
 *   2. Register it in SECTION_REGISTRY below
 *   3. Add the component to sections/
 *
 * Server async sections (FeaturedPostsSection, RecentPostsSection, StatsSection)
 * fetch their own data independently — no prop drilling needed.
 */
import type { SanitySection } from '@/types/sanity'
import { HeroSection } from './HeroSection'
import { CtaSection } from './CtaSection'
import { FeaturedPostsSection } from './FeaturedPostsSection'
import { RecentPostsSection } from './RecentPostsSection'
import { RichTextSection } from './RichTextSection'
import { StatsSection } from './StatsSection'
import { FormSection } from './FormSection'

interface SectionRendererProps {
  sections: SanitySection[]
  lang?: string
}

export async function SectionRenderer({ sections, lang = 'en' }: SectionRendererProps) {
  return (
    <>
      {sections.map((section, i) => {
        const key = ('_key' in section && section._key) ? section._key : `section-${i}`

        switch (section._type) {
          case 'heroSection':
            return <HeroSection key={key} section={section} />

          case 'ctaSection':
            return <CtaSection key={key} section={section} />

          case 'featuredPostsSection':
            return <FeaturedPostsSection key={key} section={section} lang={lang} />

          case 'recentPostsSection':
            return <RecentPostsSection key={key} section={section} lang={lang} />

          case 'richTextSection':
            return <RichTextSection key={key} section={section} />

          case 'statsSection':
            return <StatsSection key={key} section={section} />

          case 'formSection':
            return <FormSection key={key} section={section} />

          default:
            // Unknown section — skip silently in production, warn in dev
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[SectionRenderer] Unknown section type: ${(section as { _type: string })._type}`)
            }
            return null
        }
      })}
    </>
  )
}
