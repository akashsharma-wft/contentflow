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
import { createClient as createSupabaseServer } from '@/lib/supabase/server'
import { getSanityClient } from '@/lib/sanity/server-client'
import { sanityClient } from '@/lib/sanity/client'
import {
  PAGE_BY_SLUG_AND_LANG_QUERY,
  POST_BY_SLUG_AND_LANG_QUERY,
  ALL_PAGE_SLUGS_QUERY,
  ALL_POST_SLUGS_QUERY,
  SITE_CONFIG_QUERY,
  NAV_PAGES_QUERY,
  POST_LANG_VARIANTS_QUERY,
  POST_DETAIL_SECTIONS_QUERY,
  IS_POST_DRAFT_QUERY,
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
import { PostDetail } from '@/features/posts/components/PostDetail'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import type {
  SanityPage,
  SanityPost,
  SanitySiteConfig,
  NavPage,
  SanityPageSection,
  SectionPostDetailHeaderContent,
  SectionPostDetailMetaContent,
  SectionPostDetailBodyContent,
  SectionPostDetailTagsContent,
  SectionPostDetailBackLinkContent,
} from '@/types/sanity'

export const revalidate = 60

interface Props {
  params: Promise<{ lang: string }>
}

// ── Access control helper ──────────────────────────────────────────────────────

function getPageAccess(page: SanityPage) {
  return {
    requireAuth:  page.access === 'user' || page.access === 'admin',
    requireAdmin: page.access === 'admin',
    showSidebar:  page.layout === 'dashboard',
    showNavbar:   page.layout === 'home' || !page.layout,
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

// ── Post detail config assembler ──────────────────────────────────────────────

function assemblePostDetailConfig(sections: SanityPageSection[]) {
  const header:   SectionPostDetailHeaderContent   = {}
  const meta:     SectionPostDetailMetaContent     = {}
  const body:     SectionPostDetailBodyContent     = {}
  const tags:     SectionPostDetailTagsContent     = {}
  const backLink: SectionPostDetailBackLinkContent = {}

  for (const s of sections) {
    if (s.sectionType === 'postDetailHeader'   && s.postDetailHeader)   Object.assign(header,   s.postDetailHeader)
    if (s.sectionType === 'postDetailMeta'     && s.postDetailMeta)     Object.assign(meta,     s.postDetailMeta)
    if (s.sectionType === 'postDetailBody'     && s.postDetailBody)     Object.assign(body,     s.postDetailBody)
    if (s.sectionType === 'postDetailTags'     && s.postDetailTags)     Object.assign(tags,     s.postDetailTags)
    if (s.sectionType === 'postDetailBackLink' && s.postDetailBackLink) Object.assign(backLink, s.postDetailBackLink)
  }

  return { header, meta, body, tags, backLink }
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

  if (!post) {
    // Safety net for direct URL access to a draft post's slug.
    // The primary UX path (clicking in PostsTable) is handled client-side.
    const isDraft = await client.fetch<boolean>(IS_POST_DRAFT_QUERY, { slug, lang: 'en' })
    if (isDraft) redirect('/posts?draft=1')
    notFound()
  }

  const [variants, adjacentRaw, sectionDocs] = await Promise.all([
    sanityClient.fetch<SlugEntry[]>(POST_LANG_VARIANTS_QUERY, { slug }, { next: { revalidate: 60 } }),
    client.fetch<{ slug: string }[]>(
      `*[_type == "post" && language == "en" && defined(publishedAt) && !(_id in path("drafts.**"))] | order(publishedAt desc) { "slug": slug.current }`
    ),
    client.fetch<SanityPageSection[]>(POST_DETAIL_SECTIONS_QUERY, { lang: 'en' }),
  ])

  const orderedSlugs = adjacentRaw.map((p) => p.slug)
  const currentIndex = orderedSlugs.indexOf(slug)
  const prevSlug = currentIndex < orderedSlugs.length - 1 ? orderedSlugs[currentIndex + 1] : null
  const nextSlug = currentIndex > 0 ? orderedSlugs[currentIndex - 1] : null

  const variantMap = Object.fromEntries(variants.map((v) => [v.language, v.slug]))
  const { header, meta, body, tags, backLink } = assemblePostDetailConfig(sectionDocs ?? [])

  const postData = {
    _id:          post._id,
    title:        post.title,
    slug:         typeof post.slug === 'string' ? post.slug : (post.slug as { current: string }).current,
    body:         (post.body ?? []) as unknown[],
    tags:         post.tags ?? [],
    featured:     post.featured ?? false,
    publishedAt:  post.publishedAt ?? null,
    coverImage:   (post.coverImage as unknown as string | null | undefined) ?? null,
    authorId:     post.authorId,
    authorName:   post.authorName,
    authorEmail:  post.authorEmail,
    authorAvatar: post.authorAvatar,
  }

  return (
    <DashboardLayout lang="en">
      {variants.length > 1 && (
        <div className="flex items-center gap-2 mb-2 px-5 lg:px-8 pt-4">
          {SUPPORTED_LANGUAGES.map((l) => {
            const targetSlug = variantMap[l]
            if (!targetSlug) return null
            const url = l === 'en' ? `/${targetSlug}` : `/${l}/${targetSlug}`
            return (
              <a
                key={l}
                href={url}
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                  l === 'en'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {LANG_LABELS[l as SupportedLang]?.toUpperCase() ?? l.toUpperCase()}
              </a>
            )
          })}
        </div>
      )}
      <PostDetail
        post={postData}
        prevSlug={prevSlug}
        nextSlug={nextSlug}
        lang="en"
        headerContent={header}
        metaContent={meta}
        bodyContent={body}
        tagsContent={tags}
        backLinkContent={{ ...backLink, backHref: backLink.backHref ?? '/posts' }}
      />
    </DashboardLayout>
  )
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

  // Auth layout (no chrome) — lg:flex assembles the 2-section layout:
  // authHeroSection (left 45%) + authSection (right flex-1)
  if (access.isAuth) {
    return sections.length > 0 ? (
      <div className="min-h-screen bg-[#0d0e14] lg:flex lg:flex-wrap">
        <SectionRenderer sections={sections} lang={typedLang} />
      </div>
    ) : (
      <div className="min-h-screen bg-[#0d0e14]" />
    )
  }

  // Public layout (Navbar + Footer)
  const [siteConfig, navPages] = await Promise.all([
    sanityClient.fetch<SanitySiteConfig | null>(
      SITE_CONFIG_QUERY, { lang }, { next: { revalidate: 60 } }
    ),
    sanityClient.fetch<NavPage[]>(
      NAV_PAGES_QUERY, { lang }, { next: { revalidate: 60 } }
    ),
  ])

  return (
    <div className="min-h-screen bg-[#0d0e14]">
      <Navbar siteConfig={siteConfig} navPages={navPages} lang={typedLang} />
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

