// app/layout.tsx
//
// Root layout — bare shell. NO global Navbar or Footer.
// Each page is responsible for its own chrome based on page.layout from Sanity.
//
// FIX: next-sanity v11 moved VisualEditing out of the root package export.
// Correct import is 'next-sanity/visual-editing', not 'next-sanity'.

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { draftMode } from 'next/headers'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'
import { DraftModeVisualEditing } from '@/components/DraftModeVisualEditing'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'ContentFlow — Engineering CMS',
    template: '%s — ContentFlow',
  },
  description: 'CMS-driven publishing platform for engineering teams.',
  keywords: ['CMS', 'content management', 'engineering', 'API-first'],
  authors: [{ name: 'Weframetech' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    title: 'ContentFlow — Engineering CMS',
    description: 'CMS-driven publishing platform for engineering teams.',
    siteName: 'ContentFlow',
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

        {/* Visual editing overlays — only when draft mode is ON *and* the page
            is loaded inside the Sanity Presentation Tool iframe.
            DraftModeVisualEditing checks window.self !== window.top client-side,
            so a stale draft-mode cookie on normal browsing never mounts the
            overlay engine and never draws blue edit boundaries. */}
        {isDraftMode && <DraftModeVisualEditing />}
      </body>
    </html>
  )
}