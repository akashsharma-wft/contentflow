// app/page.tsx — English homepage at /
//
// Uses getSanityClient() (draft-mode-aware) so that when the Presentation Tool
// is active, it fetches draft documents and live-updates the preview.
//
// ROUTING LOGIC:
//   - Reads the 'home' page document from Sanity for language='en'
//   - Checks page.access: public / member / admin
//   - Renders with page.layout: public (Navbar+Footer) / dashboard (Sidebar) / auth (no chrome)
//   - Passes the page's sections[] to SectionRenderer which maps _type → React component
//
// MULTILINGUAL:
//   - This file handles English only. Hindi is at /hi, Kannada at /kn
//   - Each language has its own 'home' page document in Sanity with translated content

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseServer } from '@/lib/supabase/server'
import { getSanityClient } from '@/lib/sanity/server-client'
import { sanityClient } from '@/lib/sanity/client'
import { PAGE_BY_SLUG_AND_LANG_QUERY, SITE_CONFIG_QUERY } from '@/lib/sanity/queries'
import { buildMetadata } from '@/lib/seo'
import { SectionRenderer } from '@/sections/SectionRenderer'
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import type { SanityPage, SanitySiteConfig } from '@/types/sanity'

export const revalidate = 60

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

// ── Metadata ──────────────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  // Use draft-mode aware client so Presentation tool gets live updates
  const client = await getSanityClient()
  const page = await client.fetch<SanityPage | null>(
    PAGE_BY_SLUG_AND_LANG_QUERY,
    { slug: 'home', lang: 'en' }
  )

  if (!page) {
    return (
      <div className="min-h-screen bg-[#0d0e14] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-white/30 text-sm">Home page not found in Sanity.</p>
          <p className="text-white/20 text-xs">Run <code className="bg-white/5 px-2 py-0.5 rounded">npm run seed</code> to create it.</p>
        </div>
      </div>
    )
  }

  const access = getPageAccess(page)

  // ── Auth check ──────────────────────────────────────────────────────────────
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

  const sections = page.sections ?? []

  // ── Dashboard layout (sidebar) ─────────────────────────────────────────────
  if (access.showSidebar) {
    return (
      <DashboardLayout lang="en">
        {sections.length > 0 ? (
          <SectionRenderer sections={sections} lang="en" />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-white/30 text-sm">This page has no sections yet.</p>
          </div>
        )}
      </DashboardLayout>
    )
  }

  // ── Auth layout (no chrome) ────────────────────────────────────────────────
  if (access.isAuth) {
    return sections.length > 0 ? (
      <SectionRenderer sections={sections} lang="en" />
    ) : (
      <div className="min-h-screen bg-[#0d0e14]" />
    )
  }

  // ── Public layout (Navbar + Footer) ───────────────────────────────────────
  // Fetch siteConfig for Navbar/Footer content (nav links, site name, footer copy)
  const siteConfig = await sanityClient.fetch<SanitySiteConfig | null>(
    SITE_CONFIG_QUERY,
    {},
    { next: { revalidate: 60 } }
  )

  return (
    <div className="min-h-screen bg-[#0d0e14]">
      <Navbar siteConfig={siteConfig} lang="en" />
      {sections.length > 0 ? (
        <SectionRenderer sections={sections} lang="en" />
      ) : (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-white/30 text-sm">No sections configured for this page.</p>
        </div>
      )}
      <Footer siteConfig={siteConfig} lang="en" />
    </div>
  )
}