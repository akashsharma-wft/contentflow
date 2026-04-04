import { postType } from './post'
import { pageType } from './documents/page'
import { siteConfig, authConfig } from './singletons'
import {
  heroSection,
  featuredPostsSection,
  recentPostsSection,
  ctaSection,
  statsSection,
  richTextSection,
  formSection,
} from './blocks'

// Singletons (siteConfig, authConfig) are excluded from the 'create new' menu
// via the Structure Builder in sanity.config.ts — they are singleton documents.
export const schemaTypes = [
  // ── Documents ──────────────────────────────────────────────────────
  postType,
  pageType,

  // ── Singletons ─────────────────────────────────────────────────────
  siteConfig,
  authConfig,

  // ── Block types (used inside page.sections[]) ──────────────────────
  heroSection,
  featuredPostsSection,
  recentPostsSection,
  ctaSection,
  statsSection,
  richTextSection,
  formSection,
]
