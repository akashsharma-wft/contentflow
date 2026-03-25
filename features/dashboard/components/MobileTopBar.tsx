'use client'

import { useUser } from '@/hooks/useUser'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarLogo } from './SidebarLogo'

export function MobileTopBar() {
  const { profile } = useUser()

  const initials = profile?.display_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'CF'

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#0d0e14] border-b border-white/5 shrink-0">
      {/* Logo reused from sidebar */}
      <SidebarLogo />

      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8 cursor-pointer ring-1 ring-white/10 hover:ring-indigo-500/50 transition-all">
          {profile?.avatar_url && (
            <AvatarImage src={profile.avatar_url} alt={profile.display_name ?? ''} />
          )}
          <AvatarFallback className="bg-indigo-500 text-white text-[10px] font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}