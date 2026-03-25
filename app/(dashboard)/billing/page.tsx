// ─── app/(dashboard)/billing/page.tsx ────────────────────────────────────────
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
import posthog from 'posthog-js'
import { Shield } from 'lucide-react'

const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!

function BillingContent() {
  const router = useRouter()
  const { user } = useUser()
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)

  // Fetch real profile data including subscription tier
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier, display_name, email')
        .eq('id', user!.id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
    // Refetch every 10 seconds to catch webhook updates
    refetchInterval: 10000,
  })

  // Fetch real post counts from Sanity
  const { data: postStats } = useQuery({
    queryKey: ['post-stats'],
    queryFn: async () => {
      const { sanityClient } = await import('@/lib/sanity/client')
      const stats = await sanityClient.fetch(`{
        "total": count(*[_type == "post"]),
        "published": count(*[_type == "post" && defined(publishedAt)]),
      }`)
      return stats as { total: number; published: number }
    },
    staleTime: 60000,
  })

  const currentTier = (profile?.subscription_tier as 'free' | 'pro') ?? 'free'
  const isPro = currentTier === 'pro'

  // Usage limits depend on plan
  const postLimit = isPro ? 999999 : 5
  const apiLimit  = isPro ? 10000  : 1000

  const usageItems = [
    {
      label: 'Posts Published',
      current: postStats?.published ?? 0,
      max: postLimit,
    },
    {
      label: 'API Requests',
      current: 3241, // in production, fetch this from your analytics
      max: apiLimit,
    },
    {
      label: 'Storage Utilization',
      current: 1.2,
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
      toast.error('Stripe not configured — add NEXT_PUBLIC_STRIPE_PRO_PRICE_ID to env')
      return
    }

    posthog.capture('upgrade_intent', {
      plan: 'pro',
      user_id: user?.id,
      source: 'billing_page',
    })

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

  function handleManage() {
    toast.info('Stripe Customer Portal — configure portal URL in Stripe dashboard')
  }

  return (
    <div className="px-5 lg:px-8 py-6 max-w-[800px] space-y-5">
      <div>
        <h1 className="text-white text-2xl font-bold tracking-tight">
          Billing &amp; Plans
        </h1>
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
            onManage={handleManage}
            onUpgrade={handleUpgrade}
            isLoading={isCheckoutLoading}
          />
          <UsageCard items={usageItems} />
          <PlansGrid
            currentTier={currentTier}
            proPriceId={PRO_PRICE_ID}
            onUpgrade={handleUpgrade}
            isLoading={isCheckoutLoading}
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
      <div className="px-5 lg:px-8 py-6 space-y-4">
        <Skeleton className="h-8 w-48 bg-white/5 rounded" />
        <Skeleton className="h-24 w-full bg-white/5 rounded-2xl" />
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}