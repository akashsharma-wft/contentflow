'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Settings,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard',      href: '/dashboard',           icon: LayoutDashboard },
  { label: 'Posts',          href: '/posts',     icon: FileText },
  { label: 'PostHog Events', href: '/analytics', icon: BarChart2 },
  { label: 'Settings',       href: '/settings',  icon: Settings },
  { label: 'Billing',        href: '/billing',   icon: CreditCard },
] as const

interface SidebarNavProps {
  collapsed?: boolean
}

export function SidebarNav({ collapsed = false }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive =
          href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            // title shows as tooltip when collapsed — good for accessibility
            title={collapsed ? label : undefined}
            className={cn(
              'flex items-center rounded-lg text-sm transition-all cursor-pointer select-none',
              collapsed
                ? 'justify-center px-2 py-2.5'
                : 'gap-3 px-3 py-2',
              isActive
                ? 'bg-indigo-500/15 text-white font-medium'
                : 'text-white/40 hover:text-white/80 hover:bg-white/5'
            )}
          >
            <Icon
              size={15}
              className={cn(
                'shrink-0 transition-colors',
                isActive ? 'text-indigo-400' : 'text-current'
              )}
            />
            {!collapsed && (
              <span className="truncate">{label}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}