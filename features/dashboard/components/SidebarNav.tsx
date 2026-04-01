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
import { useQuery } from '@tanstack/react-query'
import { sanityClient } from '@/lib/sanity/client'
import { SITE_CONFIG_QUERY } from '@/lib/sanity/queries'

const FALLBACK_NAV = [
  { label: 'Dashboard', href: '/', icon: 'LayoutDashboard', adminOnly: false },
  { label: 'Posts', href: '/posts', icon: 'FileText', adminOnly: false },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3', adminOnly: false },
  { label: 'Settings', href: '/settings', icon: 'Settings', adminOnly: false },
  { label: 'Billing', href: '/billing', icon: 'CreditCard', adminOnly: false },
  { label: 'Admin', href: '/admin', icon: 'Shield', adminOnly: true },
]

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  Shield,
}

interface SidebarNavProps {
  collapsed: boolean
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const pathname = usePathname()
  const { profile } = useUser()

  const { data: siteConfig } = useQuery({
    queryKey: ['siteConfig'],
    queryFn: () => sanityClient.fetch(SITE_CONFIG_QUERY),
    staleTime: 5 * 60 * 1000,
  })

  const rawNavItems = siteConfig?.sidebarNavLinks ?? FALLBACK_NAV

  const navItems = rawNavItems.filter(
    (item: { adminOnly?: boolean }) => !item.adminOnly || profile?.role === 'admin'
  )

  return (
    <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
      {navItems.map((item: { href: string; label: string; icon: string; _key?: string }) => {
        const Icon = ICON_MAP[item.icon] ?? LayoutDashboard
        const isActive = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(item.href + '/')

        return (
          <Link
            key={item._key ?? item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group',
              collapsed ? 'justify-center' : '',
              isActive
                ? 'bg-indigo-500/15 text-white border border-indigo-500/20'
                : 'text-white/40 hover:text-white/80 hover:bg-white/5'
            )}
            title={collapsed ? item.label : undefined}
          >
            <Icon size={16} className={cn('shrink-0 transition-colors', isActive ? 'text-indigo-400' : 'text-white/30 group-hover:text-white/60')} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        )
      })}
    </nav>
  )
}
