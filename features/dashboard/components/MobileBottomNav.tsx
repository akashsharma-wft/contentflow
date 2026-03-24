'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Image, GitBranch, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Dashboard', href: '/dashboard',        icon: LayoutDashboard },
  { label: 'Content',   href: '/dashboard/posts',  icon: FileText },
  { label: 'Media',     href: '/dashboard/media',  icon: Image },
  { label: 'Schema',    href: '/dashboard/schema', icon: GitBranch },
  { label: 'Settings',  href: '/dashboard/settings', icon: Settings },
] as const

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center bg-[#0d0e14] border-t border-white/5">
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
              'flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium uppercase tracking-wider transition-colors',
              isActive ? 'text-indigo-400' : 'text-white/25 hover:text-white/50'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}