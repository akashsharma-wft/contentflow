import { postType } from './post'
import { pageType } from './documents/page'
import { siteConfig, authConfig } from './singletons'
import {
  // EXISTING
  heroSection,
  featuredPostsSection,
  recentPostsSection,
  ctaSection,
  statsSection,
  richTextSection,
  formSection,
  // NEW LAYOUT & STRUCTURE
  gridSection,
  columnsSection,
  spacerSection,
  dividerSection,
  // NEW CONTENT
  headingSection,
  featureListSection,
  testimonialsSection,
  faqSection,
  pricingSection,
  teamSection,
  logoBarSection,
  carouselSection,
  tableSection,
  timelineSection,
  bannerSection,
  tabsSection,
  // NEW MEDIA & INTERACTIVE
  imageSection,
  gallerySection,
  videoSection,
  newsletterSection,
  contactSection,
  authHeroSection,
  notFoundSection,
} from './blocks'

// PRIMITIVE FIELD TYPES (used inside blocks)
export {
  buttonSchema,
  badgeSchema,
  linkSchema,
  imageBlockSchema,
  videoEmbedSchema,
} from './primitives'

// Singletons (siteConfig, authConfig) are excluded from the 'create new' menu
// via the Structure Builder in sanity.config.ts — they are singleton documents.
export const schemaTypes = [
  // ── Documents ──────────────────────────────────────────────────────
  postType,
  pageType,

  // ── Singletons ─────────────────────────────────────────────────────
  siteConfig,
  authConfig,

  // ── EXISTING BLOCK TYPES ───────────────────────────────────────────
  heroSection,
  featuredPostsSection,
  recentPostsSection,
  ctaSection,
  statsSection,
  richTextSection,
  formSection,

  // ── NEW BLOCK TYPES: Layout ────────────────────────────────────────
  gridSection,
  columnsSection,
  spacerSection,
  dividerSection,

  // ── NEW BLOCK TYPES: Content ───────────────────────────────────────
  headingSection,
  featureListSection,
  testimonialsSection,
  faqSection,
  pricingSection,
  teamSection,
  logoBarSection,
  carouselSection,
  tableSection,
  timelineSection,
  bannerSection,
  tabsSection,

  // ── NEW BLOCK TYPES: Media & Interactive ──────────────────────────
  imageSection,
  gallerySection,
  videoSection,
  newsletterSection,
  contactSection,
  authHeroSection,
  notFoundSection,
]
