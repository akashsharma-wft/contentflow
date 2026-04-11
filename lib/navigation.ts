// Shared navigation structure used across Navbar, Footer, and Sidebar
import { FileText, BarChart3, Settings, CreditCard, Shield, type LucideIcon } from 'lucide-react'
import type { SidebarNavLink } from '@/types/sanity'

export const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  Shield,
}

export const APP_NAV_ITEMS: SidebarNavLink[] = [
  { label: 'Posts', href: '/posts', icon: 'FileText', adminOnly: false },
  { label: 'Settings', href: '/settings', icon: 'Settings', adminOnly: false },
  { label: 'Billing', href: '/billing', icon: 'CreditCard', adminOnly: false },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3', adminOnly: true },
  { label: 'Admin', href: '/admin', icon: 'Shield', adminOnly: true },
]

/** Translations for nav item labels keyed by label → language → translated string */
const NAV_TRANSLATIONS: Record<string, Record<string, string>> = {
  Posts:     { en: 'Posts',      hi: 'पोस्ट',          kn: 'ಪೋಸ್ಟ್‌ಗಳು'     },
  Settings:  { en: 'Settings',   hi: 'सेटिंग्स',        kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು'   },
  Billing:   { en: 'Billing',    hi: 'बिलिंग',           kn: 'ಬಿಲ್ಲಿಂಗ್'       },
  Analytics: { en: 'Analytics',  hi: 'विश्लेषण',         kn: 'ವಿಶ್ಲೇಷಣೆ'       },
  Admin:     { en: 'Admin',      hi: 'एडमिन',            kn: 'ಅಡ್ಮಿನ್'          },
}

/** Returns the translated nav label for the given language, falls back to the English label. */
export function getLocalizedLabel(label: string, lang: string): string {
  return NAV_TRANSLATIONS[label]?.[lang] ?? label
}

/**
 * Filter nav items based on user role.
 * Returns all non-admin items + admin items if user is admin.
 */
export function filterNavItems(items: SidebarNavLink[], userRole?: string | null): SidebarNavLink[] {
  return items.filter((item) => {
    if (item.adminOnly && userRole !== 'admin') return false
    return true
  })
}

/**
 * Build a language-aware href.
 * /posts → /posts (en)
 * /posts → /hi/posts (hi)
 */
export function localizeHref(href: string, lang: string): string {
  if (lang === 'en' || !lang) return href
  return `/${lang}${href}`
}
