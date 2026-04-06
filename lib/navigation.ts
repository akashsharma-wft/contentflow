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
