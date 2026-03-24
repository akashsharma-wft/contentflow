'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Image,
  GitBranch,
  KeyRound,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Each nav item — add more here as needed, component handles rendering
const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard',          icon: LayoutDashboard },
  { label: 'Content',   href: '/dashboard/posts',    icon: FileText },
  { label: 'Media',     href: '/dashboard/media',    icon: Image },
  { label: 'Schema',    href: '/dashboard/schema',   icon: GitBranch },
  { label: 'API Keys',  href: '/dashboard/api-keys', icon: KeyRound },
  { label: 'Settings',  href: '/dashboard/settings', icon: Settings },
] as const

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-2 py-2 space-y-0.5">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        // Active if pathname exactly matches or starts with href (for nested routes)
        const isActive =
          href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
              isActive
                ? 'bg-indigo-500/15 text-white font-medium'
                : 'text-white/45 hover:text-white/80 hover:bg-white/5'
            )}
          >
            <Icon
              size={15}
              className={isActive ? 'text-indigo-400' : 'text-current'}
            />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}