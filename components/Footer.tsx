// components/Footer.tsx
//
// FIX: app/page.tsx and app/[lang]/page.tsx pass lang={...} to <Footer>.
// Props only had 'siteConfig', so TypeScript rejected 'lang'.
// Solution: add optional lang prop. Footer already reads lang from pathname
// internally, so lang prop is accepted but not required — purely a type fix.
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { APP_NAV_ITEMS, ICON_MAP, filterNavItems, localizeHref, getLocalizedLabel } from '@/lib/navigation'
import { useUser } from '@/hooks/useUser'
import type { SanitySiteConfig } from '@/types/sanity'

interface Props {
  siteConfig: SanitySiteConfig | null
  /** Optional — accepted for backwards compat but not used (lang is derived from pathname). */
  lang?: string
}

const LANG_CODES = ['en', 'hi', 'kn'] as const

function parseCurrentLang(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return 'en'
  const first = segments[0]
  if ((LANG_CODES as readonly string[]).includes(first)) return first
  return 'en'
}

export function Footer({ siteConfig }: Props) {
  const pathname = usePathname()
  const { profile } = useUser()

  // Only show footer on home page (/ or /{lang})
  const isHomePage = pathname === '/' || (LANG_CODES as readonly string[]).includes(pathname.slice(1))
  if (!isHomePage) return null

  const currentLang = parseCurrentLang(pathname)
  const siteName = siteConfig?.siteName ?? 'ContentFlow'
  const tagline = siteConfig?.footerTagline ?? 'A next-generation CMS platform dedicated to the art of storytelling and editorial excellence. Built for modern publishers.'
  const copyright = siteConfig?.copyright ?? `© ${new Date().getFullYear()} ContentFlow. All rights reserved.`
  const navItems = filterNavItems(APP_NAV_ITEMS, profile?.role)

  return (
    <footer className="w-full border-t border-white/6 bg-[#0d0e14] mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Top row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 pb-12 border-b border-white/6">

          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center shrink-0">
                <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h9m0 0-3-3m3 3-3 3M12 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm tracking-tight">{siteName}</span>
            </div>
            <p className="text-white/35 text-xs leading-relaxed max-w-[220px]">{tagline}</p>
            <div className="flex items-center gap-2 pt-1">
              {[
                {
                  label: 'Share',
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                    </svg>
                  ),
                },
                {
                  label: 'Email',
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  ),
                },
                {
                  label: 'RSS',
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 0 0-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                    </svg>
                  ),
                },
              ].map(({ label, icon }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation column */}
          <div className="sm:col-span-3">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-4">Navigation</p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2.5">
              {navItems.map((item) => {
                const url = localizeHref(item.href, currentLang)
                return (
                  <li key={item.href}>
                    <Link href={url} className="text-white/50 text-sm hover:text-white transition-colors">
                      {getLocalizedLabel(item.label, currentLang)}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/25">
          <span className="uppercase tracking-widest">{copyright}</span>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-white/60 transition-colors uppercase tracking-widest">RSS Feed</Link>
            <Link href="#" className="hover:text-white/60 transition-colors uppercase tracking-widest">Status</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}