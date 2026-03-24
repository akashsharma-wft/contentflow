'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, LifeBuoy, LogOut, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

export function SidebarFooter() {
  const router = useRouter()
  const supabase = createClient()
  const { profile } = useUser()

  const initials = profile?.display_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'CF'

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) { toast.error('Failed to sign out'); return }
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="px-2 pb-4 space-y-0.5">
      {/* User profile row */}
      <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
        <Avatar className="w-6 h-6 shrink-0">
          <AvatarImage src={profile?.avatar_url ?? ''} />
          <AvatarFallback className="bg-indigo-500 text-white text-[9px] font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-white/70 text-xs font-medium truncate">
            {profile?.display_name ?? 'User'}
          </span>
          <span className="text-white/25 text-[9px] uppercase tracking-wider">
            {profile?.subscription_tier === 'pro' ? 'Admin · Pro' : 'Admin · Free'}
          </span>
        </div>
      </div>

      <Link
        href="/dashboard/posts"
        className="flex items-center justify-center gap-2 w-full py-2 mb-2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
      >
        <Plus size={13} />
        New Entry
      </Link>

      <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-all cursor-pointer">
        <BookOpen size={13} className="shrink-0" />
        Documentation
      </Link>

      <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white/30 hover:text-white/60 hover:bg-white/5 transition-all cursor-pointer">
        <LifeBuoy size={13} className="shrink-0" />
        Support
      </Link>

      <button
        onClick={handleSignOut}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer text-left"
      >
        <LogOut size={13} className="shrink-0" />
        Sign out
      </button>
    </div>
  )
}