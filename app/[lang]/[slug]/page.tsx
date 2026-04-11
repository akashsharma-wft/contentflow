// app/[lang]/[slug]/page.tsx
//
// Handles Hindi and Kannada content at /hi/slug and /kn/slug.
// English content lives at /[slug] (handled by app/[lang]/page.tsx).
//
// FIX: Was using page.isPublic and page.adminOnly which no longer exist on SanityPage.
// The schema was migrated to use page.access ('public'|'member'|'admin') and
// page.layout ('public'|'dashboard'|'auth'). Updated access checks accordingly.
// Also handles layout (dashboard/auth/public) consistently with other page files.

import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'
import { PortableText } from '@portabletext/react'
import { createClient as createSupabaseServer } from '@/lib/supabase/server'
import { sanityClient } from '@/lib/sanity/client'
import { getSanityClient } from '@/lib/sanity/server-client'
import {
  PAGE_BY_SLUG_AND_LANG_QUERY,
  ALL_PAGE_SLUGS_QUERY,
  POST_BY_SLUG_AND_LANG_QUERY,
  ALL_POST_SLUGS_QUERY,
  POST_LANG_VARIANTS_QUERY,
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
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import type { SanityPage, SanityPost, SanitySiteConfig, NavPage } from '@/types/sanity'

export const revalidate = 60

interface Props {
  params: Promise<{ lang: string; slug: string }>
}

// ── Access control helper (same as app/[lang]/page.tsx) ────────────────────────
function getPageAccess(page: SanityPage) {
  return {
    requireAuth:  page.access === 'user' || page.access === 'admin',
    requireAdmin: page.access === 'admin',
    showSidebar:  page.layout === 'dashboard',
    showNavbar:   page.layout === 'home' || !page.layout,
    isAuth:       page.layout === 'auth',
  }
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

  // 1. Try CMS page
  const page = await client.fetch<SanityPage | null>(PAGE_BY_SLUG_AND_LANG_QUERY, { slug, lang })

  if (page) {
    const access = getPageAccess(page)

    // Auth check — FIX: use access/layout instead of removed isPublic/adminOnly
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

    // Dashboard layout
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

    // Auth layout (no chrome) — flex-wrap assembles 3-section auth layout
    if (access.isAuth) {
      return sections.length > 0 ? (
        <div className="min-h-screen bg-[#0d0e14] lg:flex lg:flex-wrap">
          <SectionRenderer sections={sections} lang={lang} />
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

  // 2. Try post
  const post = await client.fetch<SanityPost | null>(POST_BY_SLUG_AND_LANG_QUERY, { slug, lang })
  if (!post) notFound()

  const variants = await sanityClient.fetch<SlugEntry[]>(POST_LANG_VARIANTS_QUERY, { slug }, { next: { revalidate: 60 } })
  const variantMap = Object.fromEntries(variants.map((v) => [v.language, v.slug]))

  const backLabel = lang === 'hi' ? '← वापस' : lang === 'kn' ? '← ಹಿಂದೆ' : '← Back'

  return (
    <main className="min-h-screen bg-[#0d0e14] text-white px-6 py-12 max-w-3xl mx-auto">
      <nav className="flex items-center justify-between mb-8 text-sm">
        <Link href={`/${lang}`} className="text-white/30 hover:text-white/70 transition-colors">
          {backLabel}
        </Link>
        <div className="flex items-center gap-2">
          {SUPPORTED_LANGUAGES.map((l) => {
            const targetSlug = variantMap[l]
            if (!targetSlug) return null
            const url = l === 'en' ? `/${targetSlug}` : `/${l}/${targetSlug}`
            return (
              <Link
                key={l}
                href={url}
                className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                  l === lang
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

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-[10px] font-medium text-white/40 bg-white/5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      <h1 className="text-3xl font-bold tracking-tight mb-3">{post.title}</h1>

      <div className="flex items-center gap-3 mb-8 text-white/30 text-sm">
        {post.authorName && <span>{post.authorName}</span>}
        {post.authorName && post.publishedAt && <span>·</span>}
        {post.publishedAt && (
          <time dateTime={post.publishedAt} className="font-mono text-xs">
            {format(new Date(post.publishedAt), 'MMMM dd, yyyy')}
          </time>
        )}
      </div>

      {post.excerpt && (
        <p className="text-white/50 text-lg leading-relaxed mb-8 border-l-2 border-indigo-500/40 pl-4 italic">
          {post.excerpt}
        </p>
      )}

      {post.body && (
        <article className="prose prose-invert prose-indigo max-w-none">
          <PortableText value={post.body as Parameters<typeof PortableText>[0]['value']} />
        </article>
      )}
    </main>
  )
}