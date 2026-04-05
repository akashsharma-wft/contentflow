// app/layout.tsx
// Root layout. Navbar + Footer are shown for public pages only.
// Sidebar-layout pages (posts, settings, billing, admin, analytics) render
// their own navigation via DashboardLayout, so Navbar/Footer must not appear.
// We detect this by checking the pathname via a client component wrapper.
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { sanityClient } from '@/lib/sanity/client'
import { SITE_CONFIG_QUERY } from '@/lib/sanity/queries'
import type { SanitySiteConfig } from '@/types/sanity'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'ContentFlow — Engineering CMS',
    template: '%s — ContentFlow',
  },
  description: 'CMS-driven publishing platform for engineering teams. API-first, high-performance content delivery.',
  keywords: ['CMS', 'content management', 'engineering', 'API-first'],
  authors: [{ name: 'Weframetech' }],
  creator: 'Weframetech',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    title: 'ContentFlow — Engineering CMS',
    description: 'CMS-driven publishing platform for engineering teams.',
    siteName: 'ContentFlow',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
}

// These path prefixes use DashboardLayout which has its own nav — suppress root Navbar/Footer
const DASHBOARD_PATHS = ['/posts', '/analytics', '/settings', '/billing', '/admin']

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [{ isEnabled: isDraftMode }, siteConfig] = await Promise.all([
    draftMode(),
    sanityClient.fetch<SanitySiteConfig | null>(SITE_CONFIG_QUERY),
  ])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/*
          Navbar and Footer are rendered via a client wrapper that checks the pathname.
          This avoids showing them on dashboard pages while keeping them on public pages.
        */}
        <PublicShell siteConfig={siteConfig}>
          <Providers>{children}</Providers>
        </PublicShell>
        <Toaster richColors position="top-right" />
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  )
}

// ── PublicShell — conditionally renders Navbar + Footer ──────────────────────
// This is a server component. We use the fact that layout.tsx has access to
// the headers to determine the pathname at request time.
import { headers } from 'next/headers'

async function PublicShell({
  children,
  siteConfig,
}: {
  children: React.ReactNode
  siteConfig: SanitySiteConfig | null
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? headersList.get('x-invoke-path') ?? ''

  // Check if this is a dashboard (sidebar) page
  const isDashboardPage = DASHBOARD_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  // Also hide for auth pages and studio
  const hidePublicNav = isDashboardPage ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/auth')

  return (
    <>
      {!hidePublicNav && <Navbar siteConfig={siteConfig} />}
      {children}
      {!hidePublicNav && <Footer siteConfig={siteConfig} />}
    </>
  )
}