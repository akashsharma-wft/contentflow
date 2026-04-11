// components/Navbar.tsx
//
// Public navbar — appears on layout==='home' pages only.
// Nav links are driven by Sanity: the server fetches NAV_PAGES_QUERY and passes
// the result as `navPages`. The client then filters them by the user's access
// level so protected links are hidden from unauthenticated visitors.
//
// Access rules:
//   guest (unauthenticated) → pages with access 'guest'
//   user  (authenticated)   → pages with access 'guest' | 'user'
//   admin                   → all pages
//
// Layout rules:
//   layout === 'home'      → show Navbar + Footer  ← this component is rendered
//   layout === 'dashboard' → sidebar (not this Navbar)
//   layout === 'auth'      → no Navbar
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { localizeHref } from '@/lib/navigation'
import { useUser } from '@/hooks/useUser'
import type { SanitySiteConfig, NavPage } from '@/types/sanity'

const LANG_CODES = ['en', 'hi', 'kn'] as const
type LangCode = (typeof LANG_CODES)[number]

const SUPPRESS_ROUTES = ['/studio', '/login', '/signup']

function parseCurrentLang(pathname: string): LangCode {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return 'en'
  const first = segments[0]
  if ((LANG_CODES as readonly string[]).includes(first)) return first as LangCode
  return 'en'
}

/** Filter nav pages based on the user's role. */
function filterByAccess(pages: NavPage[], role: string | null | undefined): NavPage[] {
  if (!pages.length) return []
  return pages.filter((page) => {
    if (page.access === 'admin') return role === 'admin'
    if (page.access === 'user')  return role === 'admin' || (role != null && role !== '')
    return true // 'guest' — visible to everyone
  })
}

interface Props {
  siteConfig: SanitySiteConfig | null
  navPages?:  NavPage[]
  /** Optional — accepted for compat; lang is derived from pathname internally. */
  lang?: string
}

export function Navbar({ siteConfig, navPages = [] }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile } = useUser()

  // Don't render on studio / login / signup routes
  if (SUPPRESS_ROUTES.some((route) => pathname.startsWith(route))) return null

  // Only render on home page (/ or /{lang})
  const isHomePage =
    pathname === '/' || (LANG_CODES as readonly string[]).includes(pathname.slice(1))
  if (!isHomePage) return null

  const currentLang  = parseCurrentLang(pathname)
  const siteName     = siteConfig?.siteName ?? 'ContentFlow'
  const visiblePages = filterByAccess(navPages, profile?.role)

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      {/* ── Desktop + Mobile header ───────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0d0e14]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden flex flex-col gap-1.5 p-1 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-px bg-white/70 transition-transform duration-200 ${mobileOpen ? 'translate-y-2.5 rotate-45' : ''}`} />
              <span className={`block w-5 h-px bg-white/70 transition-opacity duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-px bg-white/70 transition-transform duration-200 ${mobileOpen ? '-translate-y-2.5 -rotate-45' : ''}`} />
            </button>

            <Link
              href={currentLang === 'en' ? '/' : `/${currentLang}`}
              className="flex items-center gap-2 shrink-0"
              onClick={closeMobile}
            >
              <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center shrink-0">
                <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h9m0 0-3-3m3 3-3 3M12 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm tracking-tight">{siteName}</span>
            </Link>
          </div>

          {/* Center: dynamic nav links from Sanity — desktop only */}
          {visiblePages.length > 0 && (
            <nav className="hidden md:flex items-center gap-1">
              {visiblePages.map((page) => {
                const href     = localizeHref(`/${page.slug}`, currentLang)
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
                return (
                  <Link
                    key={page._id}
                    href={href}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      isActive
                        ? 'text-white bg-white/8'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {page.title}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Right: language switcher + sign in */}
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
            </button>

            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <Link
              href={localizeHref('/login', currentLang)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 transition-colors"
              aria-label="Sign in"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={closeMobile}
          />
          <div className="fixed top-14 left-0 bottom-0 z-50 w-72 bg-[#0d0e14] border-r border-white/8 flex flex-col md:hidden">
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <div className="px-2 py-3 mb-2 border-b border-white/6">
                <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest mb-2">Language</p>
                <LanguageSwitcher />
              </div>

              {/* Dynamic nav pages */}
              {visiblePages.map((page) => {
                const href     = localizeHref(`/${page.slug}`, currentLang)
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
                return (
                  <Link
                    key={page._id}
                    href={href}
                    onClick={closeMobile}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      isActive
                        ? 'text-white bg-white/8'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {page.title}
                  </Link>
                )
              })}

              <Link
                href={localizeHref('/login', currentLang)}
                onClick={closeMobile}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sign in
              </Link>
            </nav>
          </div>
        </>
      )}

      {/* ── Mobile bottom nav bar ─────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0d0e14]/95 backdrop-blur-md border-t border-white/8 pb-safe">
        <div className="grid grid-cols-4 h-16">
          {[
            {
              href:  currentLang === 'en' ? '/' : `/${currentLang}`,
              label: 'Home',
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              ),
            },
            {
              href:  localizeHref('/posts', currentLang),
              label: 'Posts',
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              ),
            },
            {
              href:  '/studio',
              label: 'Studio',
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                </svg>
              ),
            },
            {
              href:  localizeHref('/login', currentLang),
              label: 'Profile',
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              ),
            },
          ].map(({ href, label, icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={label}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-indigo-400' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {icon}
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom nav spacer on mobile */}
      <div className="h-16 md:hidden" />
    </>
  )
}
