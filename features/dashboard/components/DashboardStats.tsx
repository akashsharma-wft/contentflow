// ─── features/dashboard/components/DashboardStats.tsx ────────────────────────
'use client'

import { useQuery } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { sanityClient } from '@/lib/sanity/client'
import { ALL_POSTS_QUERY } from '@/lib/sanity/queries'
import { FileText, Users, CreditCard, Activity, Loader2 } from 'lucide-react'
import Link from 'next/link'

export function DashboardStats() {
  const { user, profile } = useUser()
  const supabase = createClient()

  // Real post count from Sanity
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => sanityClient.fetch(ALL_POSTS_QUERY),
    staleTime: 60000,
  })

  const postCount     = posts?.length ?? 0
  const publishedCount = posts?.filter((p: { publishedAt: string | null }) => p.publishedAt).length ?? 0

  const stats = [
    {
      label: 'Total Posts',
      value: postsLoading ? null : postCount.toString(),
      sub: postsLoading ? '' : `${publishedCount} published`,
      icon: FileText,
      href: '/dashboard/posts',
    },
    {
      label: 'Current Plan',
      value: profile?.subscription_tier?.toUpperCase() ?? null,
      sub: profile?.subscription_tier === 'pro' ? 'Active subscription' : 'Free tier',
      icon: CreditCard,
      href: '/dashboard/billing',
    },
    {
      label: 'Account',
      value: profile?.role?.toUpperCase() ?? null,
      sub: profile?.email ?? '—',
      icon: Users,
      href: '/dashboard/settings',
    },
    {
      label: 'Analytics',
      value: 'Live',
      sub: 'PostHog connected',
      icon: Activity,
      href: '/dashboard/analytics',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ label, value, sub, icon: Icon, href }) => (
        <Link key={label} href={href}
          className="bg-[#13141c] border border-white/5 rounded-xl p-4 space-y-2 hover:border-white/10 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-medium">{label}</p>
            <Icon size={13} className="text-white/20 group-hover:text-white/40 transition-colors" />
          </div>
          {value === null ? (
            <Loader2 size={18} className="animate-spin text-white/20" />
          ) : (
            <>
              <p className="text-white text-xl font-bold tracking-tight">{value}</p>
              <p className="text-white/30 text-xs truncate">{sub}</p>
            </>
          )}
        </Link>
      ))}
    </div>
  )
}