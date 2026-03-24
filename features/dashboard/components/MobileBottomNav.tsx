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

const TABS = [
  { label: 'Dashboard', href: '/dashboard',           icon: LayoutDashboard },
  { label: 'Posts',     href: '/dashboard/posts',     icon: FileText },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
  { label: 'Settings',  href: '/dashboard/settings',  icon: Settings },
  { label: 'Billing',   href: '/dashboard/billing',   icon: CreditCard },
] as const

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch bg-[#0d0e14] border-t border-white/5">
      {TABS.map(({ label, href, icon: Icon }) => {
        const isActive =
          href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
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