'use client'

import { Menu, Search } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useUser } from '@/hooks/useUser'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function MobileTopBar() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const { profile } = useUser()

  // Get initials for avatar fallback (e.g. "Akash Sharma" → "AS")
  const initials = profile?.display_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'CF'

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0d0e14] border-b border-white/5">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="text-white/50 hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <span className="text-white font-semibold text-base tracking-tight">
          ContentFlow
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button className="text-white/50 hover:text-white transition-colors" aria-label="Search">
          <Search size={18} />
        </button>
        <Avatar className="w-8 h-8">
          <AvatarImage src={profile?.avatar_url ?? ''} alt={profile?.display_name ?? ''} />
          <AvatarFallback className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}