// app/[lang]/[slug]/page.tsx
//
// Handles Hindi and Kannada content at /hi/slug and /kn/slug.
// English content lives at /[slug] (handled by app/[lang]/page.tsx).
//
// For CMS pages → SectionRenderer inside the appropriate layout.
// For posts     → DashboardLayout + PostDetail with CMS-sourced labels.

import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient as createSupabaseServer } from '@/lib/supabase/server'
import { sanityClient } from '@/lib/sanity/client'
import { getSanityClient } from '@/lib/sanity/server-client'
import {
  PAGE_BY_SLUG_AND_LANG_QUERY,
  ALL_PAGE_SLUGS_QUERY,
  POST_BY_SLUG_AND_LANG_QUERY,
  ALL_POST_SLUGS_QUERY,
  POST_LANG_VARIANTS_QUERY,
  POST_DETAIL_SECTIONS_QUERY,
  SITE_CONFIG_QUERY,
  NAV_PAGES_QUERY,
} from '@/lib/sanity/queries'
import {
  SUPPORTED_LANGUAGES,
  LANG_LABELS,
  type SlugEntry,
  type SupportedLang,
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
  params: Promise<{ lang: string; slug: string }>
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

// ── Assemble post detail section config from fetched section docs ──────────────
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

// ── Static params ──────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const [pageSlugs, postSlugs] = await Promise.all([
    sanityClient.fetch<SlugEntry[]>(ALL_PAGE_SLUGS_QUERY, {}, { next: { revalidate: 60 } }),
    sanityClient.fetch<SlugEntry[]>(ALL_POST_SLUGS_QUERY, {}, { next: { revalidate: 60 } }),
  ])

  return [...pageSlugs, ...postSlugs]
    .filter((s) => s.language === 'hi' || s.language === 'kn')
    .map((s) => ({ lang: s.language, slug: s.slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  if (lang !== 'hi' && lang !== 'kn') return {}

  const [page, post] = await Promise.all([
    sanityClient.fetch<SanityPage | null>(PAGE_BY_SLUG_AND_LANG_QUERY, { slug, lang }, { next: { revalidate: 60 } }),
    sanityClient.fetch<SanityPost | null>(POST_BY_SLUG_AND_LANG_QUERY, { slug, lang }, { next: { revalidate: 60 } }),
  ])

  const doc = page ?? post
  if (!doc) return {}

  const title = ('seoTitle' in doc && doc.seoTitle) ? doc.seoTitle : doc.title
  const description = ('seoDescription' in doc && doc.seoDescription)
    ? doc.seoDescription
    : ('excerpt' in doc ? doc.excerpt : undefined)
  const ogImage = ('ogImage' in doc ? (doc.ogImage as { url?: string } | undefined)?.url : undefined)

  return buildMetadata({ slug, lang, title, description, ogImage })
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LocalizedPage({ params }: Props) {
  const { lang, slug } = await params

  if (lang === 'en') redirect(`/${slug}`)
  if (lang !== 'hi' && lang !== 'kn') notFound()

  const client = await getSanityClient()

  // 1. Try CMS page first
  const page = await client.fetch<SanityPage | null>(PAGE_BY_SLUG_AND_LANG_QUERY, { slug, lang })

  if (page) {
    const access = getPageAccess(page)

    if (access.requireAuth) {
      const supabase = await createSupabaseServer()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) redirect(`/login?redirectTo=/${lang}/${slug}`)

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

    if (access.showSidebar) {
      return (
        <DashboardLayout lang={lang}>
          {sections.length > 0 ? (
            <SectionRenderer sections={sections} lang={lang} />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-white/30 text-sm">This page has no sections yet.</p>
            </div>
          )}
        </DashboardLayout>
      )
    }

    if (access.isAuth) {
      return sections.length > 0 ? (
        <div className="min-h-screen bg-[#0d0e14] lg:flex lg:flex-wrap">
          <SectionRenderer sections={sections} lang={lang} />
        </div>
      ) : (
        <div className="min-h-screen bg-[#0d0e14]" />
      )
    }

    const [siteConfig, navPages] = await Promise.all([
      sanityClient.fetch<SanitySiteConfig | null>(SITE_CONFIG_QUERY, { lang }, { next: { revalidate: 60 } }),
      sanityClient.fetch<NavPage[]>(NAV_PAGES_QUERY, { lang }, { next: { revalidate: 60 } }),
    ])
    return (
      <div className="min-h-screen bg-[#0d0e14]">
        <Navbar siteConfig={siteConfig} navPages={navPages} lang={lang} />
        {sections.length > 0 ? (
          <SectionRenderer sections={sections} lang={lang} />
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-white/30 text-sm">No sections configured for this page.</p>
          </div>
        )}
        <Footer siteConfig={siteConfig} />
      </div>
    )
  }

  // 2. Try post — use DashboardLayout + PostDetail
  const post = await client.fetch<SanityPost | null>(POST_BY_SLUG_AND_LANG_QUERY, { slug, lang })
  if (!post) notFound()

  // Fetch adjacent posts for prev/next navigation
  const [variants, adjacentRaw, sectionDocs] = await Promise.all([
    sanityClient.fetch<SlugEntry[]>(POST_LANG_VARIANTS_QUERY, { slug }, { next: { revalidate: 60 } }),
    client.fetch<{ slug: string }[]>(
      `*[_type == "post" && language == $lang && defined(publishedAt) && !(_id in path("drafts.**"))] | order(publishedAt desc) { "slug": slug.current }`,
      { lang }
    ),
    client.fetch<SanityPageSection[]>(POST_DETAIL_SECTIONS_QUERY, { lang }),
  ])

  // Build prev/next slugs from ordered list
  const orderedSlugs = adjacentRaw.map((p) => p.slug)
  const currentIndex = orderedSlugs.indexOf(slug)
  const prevSlug = currentIndex < orderedSlugs.length - 1 ? orderedSlugs[currentIndex + 1] : null
  const nextSlug = currentIndex > 0 ? orderedSlugs[currentIndex - 1] : null

  // Build language-switcher variant map
  const variantMap = Object.fromEntries(variants.map((v) => [v.language, v.slug]))

  // Assemble CMS label config from section docs
  const { header, meta, body, tags, backLink } = assemblePostDetailConfig(sectionDocs ?? [])

  // Build language-aware back href (lang is hi|kn here — no en prefix needed for /posts)
  const resolvedBackHref = backLink.backHref ?? `/${lang}/posts`

  const postData = {
    _id:         post._id,
    title:       post.title,
    slug:        typeof post.slug === 'string' ? post.slug : (post.slug as { current: string }).current,
    body:        (post.body ?? []) as unknown[],
    tags:        post.tags ?? [],
    featured:    post.featured ?? false,
    publishedAt: post.publishedAt ?? null,
    coverImage:  (post.coverImage as unknown as string | null | undefined) ?? null,
    authorId:    post.authorId,
    authorName:  post.authorName,
    authorEmail: post.authorEmail,
    authorAvatar: post.authorAvatar,
  }

  return (
    <DashboardLayout lang={lang}>
      {/* Language switcher row */}
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
                  l === lang
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
        lang={lang}
        headerContent={header}
        metaContent={meta}
        bodyContent={body}
        tagsContent={tags}
        backLinkContent={{ ...backLink, backHref: resolvedBackHref }}
      />
    </DashboardLayout>
  )
}
