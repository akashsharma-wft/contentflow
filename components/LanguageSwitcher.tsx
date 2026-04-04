'use client'

/**
 * LanguageSwitcher — client component
 *
 * Reads the current pathname, parses the active language and slug,
 * and renders links to all language variants of the current page.
 *
 * URL conventions:
 *   English (default): /slug  or  /  (homepage)
 *   Hindi:             /hi/slug  or  /hi
 *   Kannada:           /kn/slug  or  /kn
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LANG_CODES = ['en', 'hi', 'kn'] as const
type LangCode = (typeof LANG_CODES)[number]

const LANG_LABELS: Record<LangCode, string> = {
  en: 'EN',
  hi: 'हिं',
  kn: 'ಕನ್',
}

interface ParsedRoute {
  lang: LangCode
  slug: string | null
}

function parseRoute(pathname: string): ParsedRoute {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return { lang: 'en', slug: null }

  const first = segments[0]
  if ((LANG_CODES as readonly string[]).includes(first)) {
    return {
      lang: first as LangCode,
      slug: segments[1] ?? null,
    }
  }
  // No language prefix — English with slug
  return { lang: 'en', slug: segments[0] }
}

function buildUrl(lang: LangCode, slug: string | null): string {
  if (lang === 'en') {
    return slug ? `/${slug}` : '/'
  }
  return slug ? `/${lang}/${slug}` : `/${lang}`
}

export function LanguageSwitcher() {
  const pathname = usePathname()
  const { lang: currentLang, slug } = parseRoute(pathname)

  return (
    <div className="flex items-center gap-1">
      {LANG_CODES.map((lang) => {
        const isActive = lang === currentLang
        const url = buildUrl(lang, slug)
        return (
          <Link
            key={lang}
            href={url}
            className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-wider rounded transition-colors ${
              isActive
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-white/30 hover:text-white/70 hover:bg-white/5'
            }`}
            aria-label={`Switch to ${lang === 'en' ? 'English' : lang === 'hi' ? 'Hindi' : 'Kannada'}`}
          >
            {LANG_LABELS[lang]}
          </Link>
        )
      })}
    </div>
  )
}
