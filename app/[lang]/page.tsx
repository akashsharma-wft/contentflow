// app/[lang]/page.tsx
//
// Handles ALL routes at depth 1:
//
//   LANGUAGE HOMEPAGES:
//     /hi  → LanguageHomePage lang='hi'  → resolves 'home' page in Hindi
//     /kn  → LanguageHomePage lang='kn'  → resolves 'home' page in Kannada
//
//   ENGLISH SLUG PAGES (lang param IS the slug):
//     /login    → resolves 'login' page   → loginSection renders auth form
//     /signup   → resolves 'signup' page  → signupSection renders auth form
//     /posts    → resolves 'posts' page   → postsPageSection renders posts UI
//     /settings → resolves 'settings' page → settingsPageSection renders settings
//     /billing  → resolves 'billing' page  → billingPageSection renders billing
//     /admin    → resolves 'admin' page    → adminPageSection renders admin
//     /analytics → resolves 'analytics' page → analyticsPageSection renders analytics
//     /any-post-slug → falls through to post lookup
//
//   LOCALIZED SLUG PAGES (both lang AND slug present):
//     /hi/login    → login page in Hindi
//     /kn/posts    → posts page in Kannada  (sidebar + translated labels)
//     /hi/about    → about page in Hindi
//
// MULTILINGUAL RULE:
//   Every section receives lang={lang} and uses it to pick translated text from Sanity.
//   If a page document doesn't exist in the requested language, it falls back to English.
//
// LIVE PREVIEW:
//   Uses getSanityClient() which switches to draft perspective when Draft Mode is enabled.
//   This makes the Presentation Tool work — edits in Studio instantly update the preview.

import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'
import { PortableText } from '@portabletext/react'
import { createClient as createSupabaseServer } from '@/lib/supabase/server'
import { getSanityClient } from '@/lib/sanity/server-client'
import { sanityClient } from '@/lib/sanity/client'
import {
  PAGE_BY_SLUG_AND_LANG_QUERY,
  POST_BY_SLUG_AND_LANG_QUERY,
  ALL_PAGE_SLUGS_QUERY,
  ALL_POST_SLUGS_QUERY,
  SITE_CONFIG_QUERY,
  POST_LANG_VARIANTS_QUERY,
} from '@/lib/sanity/queries'
import {
  isSupportedLang,
  SUPPORTED_LANGUAGES,
  LANG_LABELS,
  type SupportedLang,
  type SlugEntry,
} from '@/lib/sanity/pageResolver'
import { buildMetadata } from '@/lib/seo'
import { SectionRenderer } from '@/sections/SectionRenderer'
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import type { SanityPage, SanityPost, SanitySiteConfig } from '@/types/sanity'

export const revalidate = 60

interface Props {
  params: Promise<{ lang: string }>
}

// ── Access control helper ──────────────────────────────────────────────────────

function getPageAccess(page: SanityPage) {
  return {
    requireAuth:  page.access === 'member' || page.access === 'admin',
    requireAdmin: page.access === 'admin',
    showSidebar:  page.layout === 'dashboard',
    showNavbar:   page.layout === 'public' || !page.layout,
    isAuth:       page.layout === 'auth',
  }
}

// ── Static params ─────────────────────────────────────────────────────────────
// Pre-generate params for all known page slugs and lang codes.
// This prevents 404 on first load of ISR pages.

export async function generateStaticParams() {
  const [pageSlugs, postSlugs] = await Promise.all([
    sanityClient.fetch<SlugEntry[]>(ALL_PAGE_SLUGS_QUERY, {}, { next: { revalidate: 60 } }),
    sanityClient.fetch<SlugEntry[]>(ALL_POST_SLUGS_QUERY, {}, { next: { revalidate: 60 } }),
  ])

  const seen = new Set<string>()

  // Always include language codes (for /hi and /kn homepages)
  seen.add('hi')
  seen.add('kn')

  // Include all English page slugs (handled as /[slug] at this route)
  for (const { slug, language } of [...pageSlugs, ...postSlugs]) {
    if (language === 'en' && slug !== 'home') seen.add(slug)
  }

  return Array.from(seen).map((lang) => ({ lang }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params

  if (lang === 'en') return {}

  // Language homepages (/hi, /kn)
  if (isSupportedLang(lang)) {
    const page = await sanityClient.fetch<SanityPage | null>(
      PAGE_BY_SLUG_AND_LANG_QUERY,
      { slug: 'home', lang },
      { next: { revalidate: 60 } }
    )
    return buildMetadata({
      slug: 'home', lang,
      title: page?.seoTitle ?? page?.title,
      description: page?.seoDescription,
      ogImage: (page?.ogImage as { url?: string } | undefined)?.url,
    })
  }

  // English slug page — fetch whichever is found (page or post)
  const slug = lang
  const [page, post] = await Promise.all([
    sanityClient.fetch<SanityPage | null>(PAGE_BY_SLUG_AND_LANG_QUERY, { slug, lang: 'en' }, { next: { revalidate: 60 } }),
    sanityClient.fetch<SanityPost | null>(POST_BY_SLUG_AND_LANG_QUERY, { slug, lang: 'en' }, { next: { revalidate: 60 } }),
  ])

  const doc = page ?? post
  if (!doc) return {}

  const title = ('seoTitle' in doc && doc.seoTitle) ? doc.seoTitle : doc.title
  const description = ('seoDescription' in doc && doc.seoDescription)
    ? doc.seoDescription
    : ('excerpt' in doc ? doc.excerpt : undefined)
  const ogImage = ('ogImage' in doc ? (doc.ogImage as { url?: string } | undefined)?.url : undefined)

  return buildMetadata({ slug, lang: 'en', title, description, ogImage })
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default async function LangOrSlugPage({ params }: Props) {
  const { lang } = await params

  // /en/* → always redirect to canonical English URL (no prefix)
  if (lang === 'en') redirect('/')

  // /hi or /kn → language homepage
  if (isSupportedLang(lang)) {
    return <LanguageHomePage lang={lang as SupportedLang} />
  }

  // /login, /signup, /posts, /settings, /billing, /admin, /analytics, /[post-slug]
  // lang param IS the slug here (English routes don't have a lang prefix)
  return <EnglishSlugPage slug={lang} />
}

// ── Language homepage (/hi or /kn) ────────────────────────────────────────────

async function LanguageHomePage({ lang }: { lang: SupportedLang }) {
  const client = await getSanityClient()
  const page = await client.fetch<SanityPage | null>(
    PAGE_BY_SLUG_AND_LANG_QUERY,
    { slug: 'home', lang }
  )

  if (!page) notFound()

  return <RenderPage page={page} lang={lang} />
}

// ── English slug page (/login, /signup, /posts, etc.) ─────────────────────────

async function EnglishSlugPage({ slug }: { slug: string }) {
  const client = await getSanityClient()

  // Try page first
  const page = await client.fetch<SanityPage | null>(
    PAGE_BY_SLUG_AND_LANG_QUERY,
    { slug, lang: 'en' }
  )

  if (page) {
    return <RenderPage page={page} lang="en" />
  }

  // Try post
  const post = await client.fetch<SanityPost | null>(
    POST_BY_SLUG_AND_LANG_QUERY,
    { slug, lang: 'en' }
  )

  if (post) {
    const variants = await sanityClient.fetch<SlugEntry[]>(
      POST_LANG_VARIANTS_QUERY,
      { slug },
      { next: { revalidate: 60 } }
    )
    return <PostDetail post={post} lang="en" variants={variants} />
  }

  notFound()
}

// ── Render page — shared by all page types ─────────────────────────────────────
// Handles access control, picks layout (public/dashboard/auth), renders sections.

async function RenderPage({
  page,
  lang,
}: {
  page: SanityPage
  lang: string
}) {
  const access = getPageAccess(page)

  // Auth check
  if (access.requireAuth) {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect(`/login?redirectTo=${lang === 'en' ? `/${page.slug?.current ?? ''}` : `/${lang}/${page.slug?.current ?? ''}`}`)

    if (access.requireAdmin) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'admin') redirect('/')
    }
  }

  const sections = page.sections ?? []
  const typedLang = lang as SupportedLang

  // Dashboard layout
  if (access.showSidebar) {
    return (
      <DashboardLayout lang={typedLang}>
        {sections.length > 0 ? (
          <SectionRenderer sections={sections} lang={typedLang} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-white/30 text-sm">This page has no sections yet.</p>
          </div>
        )}
      </DashboardLayout>
    )
  }

  // Auth layout (no chrome — used for login/signup)
  if (access.isAuth) {
    return sections.length > 0 ? (
      <SectionRenderer sections={sections} lang={typedLang} />
    ) : (
      <div className="min-h-screen bg-[#0d0e14]" />
    )
  }

  // Public layout (Navbar + Footer)
  const siteConfig = await sanityClient.fetch<SanitySiteConfig | null>(
    SITE_CONFIG_QUERY,
    {},
    { next: { revalidate: 60 } }
  )

  return (
    <div className="min-h-screen bg-[#0d0e14]">
      <Navbar siteConfig={siteConfig} lang={typedLang} />
      {sections.length > 0 ? (
        <SectionRenderer sections={sections} lang={typedLang} />
      ) : (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-white/30 text-sm">No sections configured for this page.</p>
        </div>
      )}
      <Footer siteConfig={siteConfig} lang={typedLang} />
    </div>
  )
}

// ── Post detail ───────────────────────────────────────────────────────────────

async function PostDetail({
  post,
  lang,
  variants,
}: {
  post: SanityPost
  lang: string
  variants: SlugEntry[]
}) {
  const variantMap = Object.fromEntries(variants.map((v) => [v.language, v.slug]))

  // Back label in the right language
  const backLabel = lang === 'hi' ? '← वापस' : lang === 'kn' ? '← ಹಿಂದೆ' : '← Back'

  return (
    <main className="min-h-screen bg-[#0d0e14] text-white px-6 py-12 max-w-3xl mx-auto">
      {/* Nav row */}
      <nav className="flex items-center justify-between mb-8 text-sm">
        <Link
          href={lang === 'en' ? '/' : `/${lang}`}
          className="text-white/30 hover:text-white/70 transition-colors"
        >
          {backLabel}
        </Link>
        {/* Language switcher — links to other language variants of this post */}
        <div className="flex items-center gap-2">
          {SUPPORTED_LANGUAGES.map((l) => {
            const targetSlug = variantMap[l]
            if (!targetSlug) return null
            const url = l === 'en' ? `/${targetSlug}` : `/${l}/${targetSlug}`
            const isActive = l === lang
            return (
              <Link
                key={l}
                href={url}
                className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {LANG_LABELS[l as SupportedLang]?.toUpperCase() ?? l.toUpperCase()}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Cover image */}
      {post.coverImage && (post.coverImage as { url?: string }).url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={(post.coverImage as { url?: string }).url!}
          alt={post.title}
          className="w-full h-56 object-cover rounded-2xl mb-8"
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[10px] font-medium text-white/40 bg-white/5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Heading */}
      <h1 className="text-3xl font-bold tracking-tight mb-3">{post.title}</h1>

      {/* Meta */}
      <div className="flex items-center gap-3 mb-8 text-white/30 text-sm">
        {post.authorName && <span>{post.authorName}</span>}
        {post.authorName && post.publishedAt && <span>·</span>}
        {post.publishedAt && (
          <time dateTime={post.publishedAt} className="font-mono text-xs">
            {format(new Date(post.publishedAt), 'MMMM dd, yyyy')}
          </time>
        )}
      </div>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="text-white/50 text-lg leading-relaxed mb-8 border-l-2 border-indigo-500/40 pl-4 italic">
          {post.excerpt}
        </p>
      )}

      {/* Body */}
      {post.body && (
        <article className="prose prose-invert prose-indigo max-w-none">
          <PortableText value={post.body as Parameters<typeof PortableText>[0]['value']} />
        </article>
      )}
    </main>
  )
}