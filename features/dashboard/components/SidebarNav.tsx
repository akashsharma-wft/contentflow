// features/dashboard/components/SidebarNav.tsx
// Client component — receives nav items as props (fetched server-side by
// DashboardLayout or Sidebar's parent). Uses pathname for active state.
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, BarChart3,
  Settings, CreditCard, Shield,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'

// Map of Lucide icon name strings → components
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  Shield,
}

interface NavItem {
  label: string
  href: string
  icon?: string
  adminOnly?: boolean
}

interface SidebarNavProps {
  collapsed: boolean
  navItems?: NavItem[]
}

// Fallback nav if siteConfig hasn't loaded yet or seed hasn't run
const FALLBACK_NAV: NavItem[] = [
  { label: 'Posts',     href: '/posts',     icon: 'FileText',     adminOnly: false },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3',    adminOnly: false },
  { label: 'Settings',  href: '/settings',  icon: 'Settings',     adminOnly: false },
  { label: 'Billing',   href: '/billing',   icon: 'CreditCard',   adminOnly: false },
  { label: 'Admin',     href: '/admin',     icon: 'Shield',       adminOnly: true  },
]

export function SidebarNav({ collapsed, navItems }: SidebarNavProps) {
  const pathname = usePathname()
  const { profile } = useUser()

  const items = (navItems ?? FALLBACK_NAV).filter((item) => {
    if (item.adminOnly && profile?.role !== 'admin') return false
    return true
  })

  return (
    <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
      {items.map(({ label, href, icon }) => {
        const Icon = (icon && ICON_MAP[icon]) ? ICON_MAP[icon] : FileText
        const isActive = pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={href}
            href={href}
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