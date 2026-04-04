import Link from 'next/link'
import type { SanitySiteConfig } from '@/types/sanity'

interface Props {
  siteConfig: SanitySiteConfig | null
}

export function Footer({ siteConfig }: Props) {
  const siteName = siteConfig?.siteName ?? 'ContentFlow'
  const tagline = siteConfig?.footerTagline ?? 'A next-generation CMS platform dedicated to the art of storytelling and editorial excellence. Built for modern publishers.'
  const footerLinks = siteConfig?.footerLinks ?? []
  const copyright = siteConfig?.copyright ?? `© ${new Date().getFullYear()} ContentFlow. All rights reserved.`

  return (
    <footer className="w-full border-t border-white/6 bg-[#0d0e14] mt-10 mb-16 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* Top row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 pb-12 border-b border-white/6">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center shrink-0">
                <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h9m0 0-3-3m3 3-3 3M12 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm tracking-tight">{siteName}</span>
            </div>
            <p className="text-white/35 text-xs leading-relaxed max-w-[220px]">{tagline}</p>
            {/* Social icons */}
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

          {/* Platform column */}
          <div className="space-y-4">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Platform</p>
            <ul className="space-y-2.5">
              {['Home', 'Features', 'Pricing'].map((label) => (
                <li key={label}>
                  <Link href="/" className="text-white/50 text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div className="space-y-4">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Company</p>
            <ul className="space-y-2.5">
              {['About', 'Careers', 'Contact'].map((label) => (
                <li key={label}>
                  <Link href="/" className="text-white/50 text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column — uses footerLinks from Sanity, falls back to defaults */}
          <div className="space-y-4">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Legal</p>
            <ul className="space-y-2.5">
              {footerLinks.length > 0 ? (
                footerLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href ?? '#'} className="text-white/50 text-sm hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))
              ) : (
                ['Privacy Policy', 'Terms of Service'].map((label) => (
                  <li key={label}>
                    <Link href="#" className="text-white/50 text-sm hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))
              )}
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
