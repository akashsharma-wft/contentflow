// features/dashboard/components/SidebarNav.tsx
// Client component — receives nav items as props from server component.
// Builds language-aware hrefs so /hi/posts, /kn/billing etc work correctly.
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { APP_NAV_ITEMS, ICON_MAP, filterNavItems, localizeHref } from '@/lib/navigation'
import type { SidebarNavLink } from '@/types/sanity'

const FALLBACK_NAV: SidebarNavLink[] = APP_NAV_ITEMS

interface SidebarNavProps {
  collapsed: boolean
  navItems?: SidebarNavLink[]
  lang?: string
}

/** Check if a path is active, accounting for language prefix */
function isPathActive(pathname: string, localizedHref: string): boolean {
  return pathname === localizedHref || pathname.startsWith(`${localizedHref}/`)
}

export function SidebarNav({ collapsed, navItems, lang = 'en' }: SidebarNavProps) {
  const pathname = usePathname()
  const { profile } = useUser()

  const items = filterNavItems(navItems ?? FALLBACK_NAV, profile?.role)

  return (
    <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
      {items.map(({ label, href, icon }) => {
        const Icon = (icon && ICON_MAP[icon]) ? ICON_MAP[icon] : ICON_MAP.FileText
        const localizedHref = localizeHref(href, lang)
        const isActive = isPathActive(pathname, localizedHref)

        return (
          <Link
            key={href}
            href={localizedHref}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group',
              isActive
                ? 'bg-indigo-500/15 text-white border border-indigo-500/20'
                : 'text-white/40 hover:text-white/80 hover:bg-white/5'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon size={16} className={cn(
              'shrink-0 transition-colors',
              isActive ? 'text-indigo-400' : 'text-white/30 group-hover:text-white/60'
            )} />
            {!collapsed && <span>{label}</span>}
          </Link>
        )
      })}
    </nav>
  )
}