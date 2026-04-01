import Link from 'next/link'
import { sanityClient } from '@/lib/sanity/client'
import { SITE_CONFIG_QUERY } from '@/lib/sanity/queries'

interface NavLink { _key: string; label: string; href: string; openInNewTab?: boolean }
interface SiteConfig { siteName?: string; logo?: string; publicNavLinks?: NavLink[]; footerTagline?: string; footerLinks?: NavLink[]; footerCopyrightText?: string }

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const config: SiteConfig = await sanityClient.fetch(SITE_CONFIG_QUERY) ?? {}
  const siteName = config.siteName ?? 'ContentFlow'
  const navLinks = config.publicNavLinks ?? []

  return (
    <div className="min-h-screen bg-[#0d0e14] flex flex-col">
      <header className="sticky top-0 z-40 bg-[#0d0e14]/90 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer">
            {config.logo ? (
              <img src={config.logo} alt={siteName} className="h-7 w-auto" />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
                  <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
                  <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
                  <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.5"/>
                </svg>
              </div>
            )}
            <span className="text-white text-sm font-semibold tracking-tight">{siteName}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link._key} href={link.href} target={link.openInNewTab ? '_blank' : undefined} rel={link.openInNewTab ? 'noopener noreferrer' : undefined} className="px-3 py-1.5 text-white/50 hover:text-white text-sm transition-colors cursor-pointer rounded-lg hover:bg-white/5">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/5 py-8 px-5 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs font-mono uppercase tracking-widest">{config.footerTagline ?? 'Built with ContentFlow SDK'}</p>
          <div className="flex items-center gap-5">
            {(config.footerLinks ?? []).map((link) => (
              <Link key={link._key} href={link.href} className="text-white/20 text-xs uppercase tracking-widest hover:text-white/50 transition-colors cursor-pointer">{link.label}</Link>
            ))}
          </div>
          <p className="text-white/15 text-xs font-mono">{config.footerCopyrightText ?? '© 2026 ContentFlow Engineering'}</p>
        </div>
      </footer>
    </div>
  )
}
