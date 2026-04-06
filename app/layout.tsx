// app/layout.tsx
// Root layout — ONLY global providers, fonts, Toaster, VisualEditing.
// NO Navbar or Footer here. Each page/layout is responsible for its own chrome.
// - Public home page: renders Navbar/Footer inside its own layout
// - Auth pages (login/signup): no nav
// - Dashboard pages (posts/settings/billing/analytics/admin): DashboardLayout
// - Studio: no nav
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'ContentFlow — Engineering CMS',
    template: '%s — ContentFlow',
  },
  description: 'CMS-driven publishing platform for engineering teams.',
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isEnabled: isDraftMode } = await draftMode()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <Toaster richColors position="top-right" />
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  )
}