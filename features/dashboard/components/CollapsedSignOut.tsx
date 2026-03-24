'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function CollapsedSignOut() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Failed to sign out')
      return
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      title="Sign out"
      className="text-white/25 hover:text-red-400 hover:bg-red-500/5 p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center w-full"
      aria-label="Sign out"
    >
      <LogOut size={14} />
    </button>
  )
}