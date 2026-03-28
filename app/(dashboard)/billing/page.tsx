'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { CurrentPlanCard } from '@/features/billing/components/CurrentPlanCard'
import { UsageCard } from '@/features/billing/components/UsageCard'
import { PlansGrid } from '@/features/billing/components/PlansGrid'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { usePostHog } from 'posthog-js/react'
import { Shield } from 'lucide-react'

const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!

function BillingContent() {
  const router             = useRouter()
  const posthog            = usePostHog()
  const { user }           = useUser()
  const supabase           = createClient()
  const queryClient        = useQueryClient()           // ← was missing
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)

  const { data: profile, isLoading } = useQuery({      // ← isLoading was missing
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier, display_name, email, subscription_cancel_at')
        .eq('id', user!.id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
    refetchInterval: 10000,
  })

  const currentTier  = (profile?.subscription_tier as 'free' | 'pro') ?? 'free'
  const isPro        = currentTier === 'pro'
  const isCancelling = !!profile?.subscription_cancel_at
  const cancelAt     = profile?.subscription_cancel_at
    ? new Date(profile.subscription_cancel_at).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      })
    : null

  const { data: postStats } = useQuery({
    queryKey: ['my-post-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, published: 0 }
      const { sanityClient } = await import('@/lib/sanity/client')
      const stats = await sanityClient.fetch(`{
        "total": count(*[_type == "post" && authorId == $userId]),
        "published": count(*[_type == "post" && authorId == $userId && defined(publishedAt)])
      }`, { userId: user.id })
      return stats as { total: number; published: number }
    },
    enabled: !!user?.id,
  })

  const usageItems = [
    {
      label: 'Posts Published',
      current: postStats?.published ?? 0,
      max: isPro ? 999999 : 5,
    },
    {
      label: 'API Requests',
      current: 0,
      max: isPro ? 10000 : 1000,
    },
    {
      label: 'Storage Utilization',
      current: 0,
      max: isPro ? 5 : 1,
      unit: 'GB' as const,
    },
    {
      label: 'Team Seats',
      current: 1,
      max: isPro ? 5 : 1,
    },
  ]

  async function handleUpgrade() {
    if (!PRO_PRICE_ID) {
      toast.error('Stripe not configured')
      return
    }
    posthog?.capture('upgrade_intent', { plan: 'pro', user_id: user?.id, source: 'billing_page' })
    setIsCheckoutLoading(true)
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: PRO_PRICE_ID }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session')
      if (data.url) router.push(data.url)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Checkout failed')
      setIsCheckoutLoading(false)
    }
  }

  async function handleDowngrade() {
    try {
      const response = await fetch('/api/stripe/cancel', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      toast.success('Subscription set to cancel at period end')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Downgrade failed')
    }
  }

  return (
    <div className="py-6 space-y-5 max-w-[800px] mx-auto">
      <div>
        <h1 className="text-white text-2xl font-bold tracking-tight">Billing &amp; Plans</h1>
        <p className="text-white/35 text-sm mt-1">
          Manage your subscription, view usage metrics, and upgrade your workspace.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
          <Skeleton className="h-48 w-full rounded-2xl bg-white/5" />
          <Skeleton className="h-64 w-full rounded-2xl bg-white/5" />
        </div>
      ) : (
        <>
          <CurrentPlanCard
            tier={currentTier}
            isCancelling={isCancelling}
            cancelAt={cancelAt}
            onUpgrade={handleUpgrade}
            isLoading={isCheckoutLoading}
          />
          <UsageCard items={usageItems} />
          <PlansGrid
            currentTier={currentTier}
            proPriceId={PRO_PRICE_ID}
            onUpgrade={handleUpgrade}
            onDowngrade={handleDowngrade}
            isLoading={isCheckoutLoading}
            isCancelling={isCancelling}
          />
        </>
      )}

      <div className="flex items-center justify-between px-4 py-3 bg-[#13141c] border border-white/5 rounded-xl flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Shield size={12} className="text-indigo-400" />
          <span className="text-white/30 text-[10px] uppercase tracking-widest font-mono">
            Billing Portal Powered by Stripe
          </span>
        </div>
        <span className="text-white/20 text-[10px] font-mono">
          Webhook: /api/webhooks/stripe
        </span>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="py-6 space-y-4">
        <Skeleton className="h-8 w-48 bg-white/5 rounded" />
        <Skeleton className="h-24 w-full bg-white/5 rounded-2xl" />
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}