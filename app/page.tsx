/**
 * / — English homepage
 *
 * ISR: revalidates every 60 seconds.
 * If page.layout = 'dashboard', wraps content in DashboardLayout (requires auth).
 * If page.layout = 'public', wraps with Navbar + Footer.
 * If page.layout = 'auth', renders content only (no chrome).
 */
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseServer } from '@/lib/supabase/server'
import { resolveContent } from '@/lib/sanity/pageResolver'
import { sanityClient } from '@/lib/sanity/client'
import { PAGE_BY_SLUG_AND_LANG_QUERY, SITE_CONFIG_QUERY } from '@/lib/sanity/queries'
import { buildMetadata } from '@/lib/seo'
import { SectionRenderer } from '@/sections/SectionRenderer'
import { PostsListing } from '@/components/PostsListing'
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import type { SanityPage, SanitySiteConfig } from '@/types/sanity'

export const revalidate = 60

// ── Access control helper ──────────────────────────────────────────
function getPageAccess(page: SanityPage) {
  return {
    isPublic: page.access === 'public' || page.access === undefined,
    requireAuth: page.access === 'member' || page.access === 'admin',
    requireAdmin: page.access === 'admin',
    showSidebar: page.layout === 'dashboard',
    showNavbar: page.layout === 'public' || page.layout === undefined,
    isAuth: page.layout === 'auth',
  }
}

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
    const access = getPageAccess(page)

    // ── Access control checks ──────────────────────────────────────
    if (access.requireAuth) {
      const supabase = await createSupabaseServer()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) redirect('/login?redirectTo=/')

      if (access.requireAdmin) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (profile?.role !== 'admin') redirect('/')
      }
    }

    // ── Render based on layout ─────────────────────────────────────
    const siteConfig = await sanityClient.fetch<SanitySiteConfig | null>(SITE_CONFIG_QUERY)

    // Dashboard layout (sidebar)
    if (access.showSidebar) {
      return (
        <DashboardLayout lang="en">
          {page.sections && page.sections.length > 0 ? (
            <SectionRenderer sections={page.sections} lang="en" />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-white/30 text-sm">This page has no sections yet.</p>
            </div>
          )}
        </DashboardLayout>
      )
    }

    // Public layout (navbar + footer)
    if (access.showNavbar) {
      return (
        <div className="min-h-screen bg-[#0d0e14]">
          <Navbar siteConfig={siteConfig} />
          {page.sections && page.sections.length > 0 ? (
            <SectionRenderer sections={page.sections} lang="en" />
          ) : (
            <PostsListing lang="en" />
          )}
          <Footer siteConfig={siteConfig} />
        </div>
      )
    }

    // Auth layout (no chrome)
    return (
      page.sections && page.sections.length > 0 ? (
        <SectionRenderer sections={page.sections} lang="en" />
      ) : (
        <PostsListing lang="en" />
      )
    )
  }

  return <PostsListing lang="en" />
}