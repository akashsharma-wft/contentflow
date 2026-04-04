/**
 * / — English homepage
 *
 * ISR: revalidates every 60 seconds.
 * SEO: fetches seoTitle/seoDescription from Sanity home page document.
 */
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseServer } from '@/lib/supabase/server'
import { resolveContent } from '@/lib/sanity/pageResolver'
import { sanityClient } from '@/lib/sanity/client'
import { PAGE_BY_SLUG_AND_LANG_QUERY } from '@/lib/sanity/queries'
import { buildMetadata } from '@/lib/seo'
import { SectionRenderer } from '@/sections/SectionRenderer'
import { PostsListing } from '@/components/PostsListing'
import type { SanityPage } from '@/types/sanity'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityClient.fetch<SanityPage | null>(
    PAGE_BY_SLUG_AND_LANG_QUERY,
    { slug: 'home', lang: 'en' },
    { next: { revalidate: 60 } }
  )

  return buildMetadata({
    slug: 'home',
    lang: 'en',
    title: page?.seoTitle ?? page?.title,
    description: page?.seoDescription,
    ogImage: (page?.ogImage as { url?: string } | undefined)?.url,
  })
}

export default async function HomePage() {
  const resolution = await resolveContent('home', 'en')

  if (resolution.kind === 'page') {
    const { page } = resolution

    if (!page.isPublic || page.adminOnly) {
      const supabase = await createSupabaseServer()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) redirect('/login?redirectTo=/')

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
          <PostsListing lang="en" />
        )}
      </div>
    )
  }

  return <PostsListing lang="en" />
}
