// features/dashboard/components/DashboardLayout.tsx
// Server component — fetches siteConfig to get CMS-driven nav items,
// then passes them (with lang) to Sidebar + MobileBottomNav.
// The lang prop ensures sidebar labels come in the right language.
import { sanityClient } from '@/lib/sanity/client'
import { SITE_CONFIG_QUERY } from '@/lib/sanity/queries'
import type { SanitySiteConfig } from '@/types/sanity'
import { Sidebar } from './Sidebar'
import { MobileTopBar } from './MobileTopBar'
import { MobileBottomNav } from './MobileBottomNav'

interface DashboardLayoutProps {
  children: React.ReactNode
  lang?: string
}

export async function DashboardLayout({ children, lang = 'en' }: DashboardLayoutProps) {
  // Fetch siteConfig to get sidebar nav items from CMS
  const siteConfig = await sanityClient.fetch<SanitySiteConfig | null>(SITE_CONFIG_QUERY)
  const navItems = siteConfig?.sidebarNav ?? []

  return (
    <div className="flex h-screen bg-[#0d0e14] overflow-hidden">
      {/* Sidebar — desktop only */}
      <Sidebar navItems={navItems} lang={lang} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar — shows logo + avatar, no nav links */}
        <MobileTopBar />

        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <div className="w-full max-w-5xl mx-auto py-6 px-4 lg:px-8">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav — tabs for quick navigation */}
        <MobileBottomNav navItems={navItems} lang={lang} />
      </div>
    </div>
  )
}