// sanity/schemaTypes/index.ts
import { pageType }      from './documents/page'
import { postType }      from './documents/post'
import { sectionType }   from './documents/section'
import { componentType } from './documents/component'
import { siteConfig }    from './singletons/siteConfig'
import {
  heroSection,
  featuresSection,
  postsSection,
  authHeroSection,
  authSection,
  authLegalSection,
  analyticsSection,
  navbarSection,
  footerSection,
  featuredPostsSection,
  recentPostsSection,
  ctaSection,
} from './blocks/systemSections'

export const schemaTypes = [
  // ── Documents ─────────────────────────────────────────────────────────────
  pageType,
  postType,
  sectionType,
  componentType,
  siteConfig,

  // ── System section objects ─────────────────────────────────────────────────
  heroSection,
  featuresSection,
  postsSection,
  authHeroSection,
  authSection,
  authLegalSection,
  analyticsSection,
  navbarSection,
  footerSection,
  featuredPostsSection,
  recentPostsSection,
  ctaSection,
]
