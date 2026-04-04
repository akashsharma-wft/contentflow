/**
 * lib/sanity/pageResolver.ts
 *
 * Shared logic for resolving CMS content (pages and posts) by slug + language.
 * Used by all public-facing routes:
 *   app/page.tsx          → resolveContent('home', 'en')
 *   app/[slug]/page.tsx   → resolveContent(slug, 'en')
 *   app/[lang]/[slug]/page.tsx → resolveContent(slug, lang)
 *
 * Also exports language constants used across route files.
 */
import 'server-only'
import { getSanityClient } from './server-client'
import { sanityClient } from './client'
import {
  PAGE_BY_SLUG_AND_LANG_QUERY,
  POST_BY_SLUG_AND_LANG_QUERY,
  POST_LANG_VARIANTS_QUERY,
} from './queries'
import type { SanityPage, SanityPost } from '@/types/sanity'
// Re-export from lib/seo so existing imports of buildAlternates/buildCanonicalUrl continue to work
export { buildAlternates, buildCanonicalUrl } from '@/lib/seo'

// ─── Language constants ────────────────────────────────────────────────────────

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'kn'] as const
export type SupportedLang = (typeof SUPPORTED_LANGUAGES)[number]

export const LANG_LABELS: Record<SupportedLang, string> = {
  en: 'English',
  hi: 'हिंदी',
  kn: 'ಕನ್ನಡ',
}

/** Returns true if the string is a known language code. */
export function isSupportedLang(value: string): value is SupportedLang {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
}

// ─── Content resolution ────────────────────────────────────────────────────────

export interface SlugEntry {
  slug: string
  language: string
}

export type PageResolution =
  | { kind: 'page'; page: SanityPage }
  | { kind: 'post'; post: SanityPost; variants: SlugEntry[] }
  | { kind: 'notFound' }

/**
 * Resolves a CMS page or post document by slug + language.
 * Uses the draft-aware server client (respects Next.js Draft Mode).
 * Language fallback (hi/kn → en) is handled at the GROQ query level.
 *
 * @param slug - The page/post slug (e.g. 'home', 'about', 'my-post')
 * @param lang - The requested language ('en', 'hi', or 'kn')
 */
export async function resolveContent(
  slug: string,
  lang: string
): Promise<PageResolution> {
  const client = await getSanityClient()

  // 1. Try CMS page document first
  const page = await client.fetch<SanityPage | null>(
    PAGE_BY_SLUG_AND_LANG_QUERY,
    { slug, lang }
  )
  if (page) return { kind: 'page', page }

  // 2. Fall back to post document
  const post = await client.fetch<SanityPost | null>(
    POST_BY_SLUG_AND_LANG_QUERY,
    { slug, lang }
  )
  if (!post) return { kind: 'notFound' }

  // 3. Fetch all language variants for the language switcher
  const variants = await sanityClient.fetch<SlugEntry[]>(
    POST_LANG_VARIANTS_QUERY,
    { slug }
  )

  return { kind: 'post', post, variants }
}
