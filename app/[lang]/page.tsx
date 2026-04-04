/**
 * /[lang] — handles two distinct cases at depth 1:
 *
 *   1. Language homepages  → /hi, /kn
 *      isSupportedLang(lang) && lang !== 'en'
 *      resolveContent('home', lang)
 *
 *   2. English slug pages  → /about, /my-post
 *      !isSupportedLang(lang) (everything else)
 *      resolveContent(lang, 'en')  ← lang param IS the slug here
 *
 * WHY THIS FILE IS NAMED [lang] AND NOT [slug]:
 *   Next.js App Router requires the same dynamic segment name at the same
 *   URL depth across all branches. app/[lang]/[slug]/page.tsx already uses
 *   'lang' at depth 1, so this file must also use 'lang'. The param value
 *   is detected at runtime to determine which case applies.
 *
 * ISR: revalidates every 60 seconds.
 * /en → redirect to / (canonical English root)
 */
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'
import { PortableText } from '@portabletext/react'
import { createClient as createSupabaseServer } from '@/lib/supabase/server'
import { sanityClient } from '@/lib/sanity/client'
import {
  PAGE_BY_SLUG_AND_LANG_QUERY,
  POST_BY_SLUG_AND_LANG_QUERY,
  ALL_PAGE_SLUGS_QUERY,
  ALL_POST_SLUGS_QUERY,
} from '@/lib/sanity/queries'
import {
  resolveContent,
  isSupportedLang,
  SUPPORTED_LANGUAGES,
  LANG_LABELS,
  type SupportedLang,
  type SlugEntry,
} from '@/lib/sanity/pageResolver'
import { buildMetadata } from '@/lib/seo'
import { SectionRenderer } from '@/sections/SectionRenderer'
import { PostsListing } from '@/components/PostsListing'
import type { SanityPage, SanityPost } from '@/types/sanity'

export const revalidate = 60

interface Props {
  params: Promise<{ lang: string }>
}

// ─── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const [pageSlugs, postSlugs] = await Promise.all([
    sanityClient.fetch<SlugEntry[]>(ALL_PAGE_SLUGS_QUERY, {}, { next: { revalidate: 60 } }),
    sanityClient.fetch<SlugEntry[]>(ALL_POST_SLUGS_QUERY, {}, { next: { revalidate: 60 } }),
  ])

  const seen = new Set<string>()
  seen.add('hi')
  seen.add('kn')

  for (const { slug, language } of [...pageSlugs, ...postSlugs]) {
    if (language === 'en' && slug !== 'home') seen.add(slug)
  }

  return Array.from(seen).map((lang) => ({ lang }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params

  if (lang === 'en') return {}

  // Language homepage (hi / kn)
  if (isSupportedLang(lang)) {
    const page = await sanityClient.fetch<SanityPage | null>(
      PAGE_BY_SLUG_AND_LANG_QUERY,
      { slug: 'home', lang },
      { next: { revalidate: 60 } }
    )
    return buildMetadata({
      slug: 'home',
      lang,
      title: page?.seoTitle ?? page?.title,
      description: page?.seoDescription,
      ogImage: (page?.ogImage as { url?: string } | undefined)?.url,
    })
  }

  // English slug page — lang param IS the content slug
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LangOrSlugPage({ params }: Props) {
  const { lang } = await params

  if (lang === 'en') redirect('/')

  if (isSupportedLang(lang)) {
    return <LanguageHomePage lang={lang as SupportedLang} />
  }

  return <EnglishContentPage slug={lang} />
}

// ─── Language homepage ─────────────────────────────────────────────────────────

async function LanguageHomePage({ lang }: { lang: SupportedLang }) {
  const resolution = await resolveContent('home', lang)

  if (resolution.kind === 'page') {
    const { page } = resolution

    if (!page.isPublic || page.adminOnly) {
      const supabase = await createSupabaseServer()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) redirect(`/login?redirectTo=/${lang}`)

      if (page.adminOnly) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (profile?.role !== 'admin') redirect('/')
      }
    }

    return (
      <div className="min-h-screen bg-[#0d0e14]">
        {page.sections && page.sections.length > 0 ? (
          <SectionRenderer sections={page.sections} lang={lang} />
        ) : (
          <PostsListing lang={lang} />
        )}
      </div>
    )
  }

  return <PostsListing lang={lang} />
}

// ─── English content page / post ───────────────────────────────────────────────

async function EnglishContentPage({ slug }: { slug: string }) {
  const resolution = await resolveContent(slug, 'en')

  if (resolution.kind === 'notFound') notFound()

  if (resolution.kind === 'page') {
    const { page } = resolution

    if (!page.isPublic || page.adminOnly) {
      const supabase = await createSupabaseServer()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) redirect(`/login?redirectTo=/${slug}`)

      if (page.adminOnly) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (profile?.role !== 'admin') redirect('/')
      }
    }

    return (
      <div className="min-h-screen bg-[#0d0e14]">
        {page.sections && page.sections.length > 0 ? (
          <SectionRenderer sections={page.sections} lang="en" />
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-white/30 text-sm">This page has no sections yet.</p>
          </div>
        )}
      </div>
    )
  }

  // Post
  const { post, variants } = resolution
  const variantMap = Object.fromEntries(variants.map((v) => [v.language, v.slug]))

  return (
    <main className="min-h-screen bg-[#0d0e14] text-white px-6 py-12 max-w-3xl mx-auto">
      <nav className="flex items-center justify-between mb-8 text-sm">
        <Link href="/" className="text-white/30 hover:text-white/70 transition-colors">
          ← Back
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
                  l === 'en'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {LANG_LABELS[l as SupportedLang] ? l.toUpperCase() : l.toUpperCase()}
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
