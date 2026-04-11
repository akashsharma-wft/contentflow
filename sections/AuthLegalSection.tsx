// sections/AuthLegalSection.tsx
//
// Legal link strip at the bottom of auth pages.
// Renders a full-width row of links (Terms, Privacy Policy, Security …).
// On desktop, this wraps to a new row below the 2-column hero+form layout
// because the parent wrapper uses `lg:flex lg:flex-wrap` and this div is `w-full`.
//
// All link labels and hrefs come from Sanity — no hardcoded strings.

import type { AuthLegalSection as AuthLegalSectionType } from '@/types/sanity'

interface Props {
  section: AuthLegalSectionType
}

const DEFAULT_LINKS: { label: string; href: string }[] = [
  { label: 'Terms of Service', href: '#' },
  { label: 'Privacy Policy',   href: '#' },
  { label: 'Security',         href: '#' },
]

export function AuthLegalSection({ section }: Props) {
  if (!section) return null

  const links = section.links?.length ? section.links : DEFAULT_LINKS

  return (
    <div className="w-full flex items-center justify-center gap-5 py-5 px-4 border-t border-white/5">
      {links.map((link, i) => (
        <a
          key={('_key' in link && link._key) ? link._key : i}
          href={link.href ?? '#'}
          className="text-white/20 text-[10px] uppercase tracking-widest hover:text-white/40 transition-colors"
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}
