// features/dashboard/components/MobileBottomNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, BarChart3, Settings, CreditCard, Shield, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import type { SidebarNavLink } from '@/types/sanity'

const ICON_MAP: Record<string, LucideIcon> = {
  FileText, BarChart3, Settings, CreditCard, Shield,
}

const FALLBACK_NAV: SidebarNavLink[] = [
  { label: 'Posts',     href: '/posts',     icon: 'FileText',   adminOnly: false },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3',  adminOnly: false },
  { label: 'Settings',  href: '/settings',  icon: 'Settings',   adminOnly: false },
  { label: 'Billing',   href: '/billing',   icon: 'CreditCard', adminOnly: false },
]

interface MobileBottomNavProps {
  navItems?: SidebarNavLink[]
  lang?: string
}

function localizeHref(href: string, lang: string): string {
  if (lang === 'en' || !lang) return href
  return `/${lang}${href}`
}

export function MobileBottomNav({ navItems, lang = 'en' }: MobileBottomNavProps) {
  const pathname = usePathname()
  const { profile } = useUser()

  // Take first 4 non-admin items for mobile nav
  const items = (navItems ?? FALLBACK_NAV)
    .filter((item) => {
      if (item.adminOnly && profile?.role !== 'admin') return false
      return true
    })
    .slice(0, 4)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch bg-[#0d0e14] border-t border-white/5">
      {items.map(({ label, href, icon }) => {
        const Icon = (icon && ICON_MAP[icon]) ? ICON_MAP[icon] : FileText
        const localizedHref = localizeHref(href, lang)
        const isActive = pathname === localizedHref || pathname.startsWith(`${localizedHref}/`)

        return (
          <Link
            key={href}
            href={localizedHref}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all cursor-pointer',
              isActive ? 'text-indigo-400' : 'text-white/25 hover:text-white/50'
            )}
          >
            <Icon size={17} className="shrink-0" />
            <span className={cn(
              'text-[9px] uppercase tracking-wider font-medium',
              isActive ? 'text-indigo-400' : 'text-current'
            )}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}