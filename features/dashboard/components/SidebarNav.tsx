'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, BarChart3,
  Settings, CreditCard, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'

const BASE_NAV_ITEMS = [
  { label: 'Dashboard',     href: '/dashboard',  icon: LayoutDashboard },
  { label: 'Posts',         href: '/posts',      icon: FileText },
  { label: 'Analytics',     href: '/analytics',  icon: BarChart3 },
  { label: 'Settings',      href: '/settings',   icon: Settings },
  { label: 'Billing',       href: '/billing',    icon: CreditCard },
] as const

interface SidebarNavProps {
  collapsed: boolean
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const pathname = usePathname()
  const { profile } = useUser()

  // Build nav items — add Admin only for admins
  const navItems = [
    ...BASE_NAV_ITEMS,
    ...(profile?.role === 'admin'
      ? [{ label: 'Admin', href: '/admin', icon: Shield }]
      : []),
  ]

  return (
    <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
      {navItems.map(({ label, href, icon: Icon }) => {
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