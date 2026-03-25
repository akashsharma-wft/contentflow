// ─── app/(dashboard)/billing/page.tsx ────────────────────────────────────────
// Billing page — client component because it needs to call the checkout API
// and track PostHog events on button click.
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { CurrentPlanCard } from '@/features/billing/components/CurrentPlanCard'
import { UsageCard } from '@/features/billing/components/UsageCard'
import { PlansGrid } from '@/features/billing/components/PlansGrid'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import posthog from 'posthog-js'
import { useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { Shield } from 'lucide-react'

const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!

// Usage data — in a real app this would come from your API
// For the assignment these are representative values
const USAGE_ITEMS = [
  { label: 'Posts Published', current: 8,     max: 20,    unit: undefined },
  { label: 'API Requests',    current: 3241,   max: 10000, unit: undefined },
  { label: 'Storage Utilization', current: 1.2, max: 5,   unit: 'GB' },
  { label: 'Team Seats',      current: 2,      max: 5,    unit: undefined },
]

function BillingSuccessToast() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('You are now on the Pro plan!')
    }
    if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout was cancelled')
    }
  }, [searchParams])

  return null
}

function BillingContent() {
  const router = useRouter()
  const { user } = useUser()
  const supabase = createClient()
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)

  // Fetch profile to get current subscription tier
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier, display_name')
        .eq('id', user!.id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })

  async function handleUpgrade() {
    if (!PRO_PRICE_ID) {
      toast.error('Stripe price ID not configured')
      return
    }

    // Track upgrade intent in PostHog — required by assignment
    posthog.capture('upgrade_intent', {
      plan: 'pro',
      user_id: user?.id,
      source: 'billing_page',
      timestamp: new Date().toISOString(),
    })

    setIsCheckoutLoading(true)

    try {
      // Call our server-side API route — never call Stripe directly from client
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: PRO_PRICE_ID }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        router.push(data.url)
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Checkout failed')
      setIsCheckoutLoading(false)
    }
  }

  function handleManage() {
    // In production this would redirect to Stripe Customer Portal
    // For now, show a toast explaining
    toast.info('Stripe Customer Portal — configure in production')
  }

  const currentTier = (profile?.subscription_tier as 'free' | 'pro') ?? 'free'

  return (
    <div className="px-5 lg:px-8 py-6 max-w-[800px] space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold tracking-tight">
          Billing &amp; Plans
        </h1>
        <p className="text-white/35 text-sm mt-1">
          Manage your subscription, view usage metrics, and upgrade your workspace infrastructure.
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

          <UsageCard items={USAGE_ITEMS} />

          <PlansGrid
            currentTier={currentTier}
            proPriceId={PRO_PRICE_ID}
            onUpgrade={handleUpgrade}
            isLoading={isCheckoutLoading}
          />
        </>
      )}

      {/* Stripe footer bar — matches Figma */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#13141c] border border-white/5 rounded-xl flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Shield size={12} className="text-indigo-400" />
          <span className="text-white/30 text-[10px] uppercase tracking-widest font-mono">
            Billing Portal Powered by Stripe
          </span>
        </div>
        <span className="text-white/20 text-[10px] font-mono">
          Webhook endpoint: /api/webhooks/stripe
        </span>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="px-5 lg:px-8 py-6">
        <Skeleton className="h-8 w-48 bg-white/5 rounded mb-4" />
        <Skeleton className="h-24 w-full bg-white/5 rounded-2xl" />
      </div>
    }>
      <BillingSuccessToast />
      <BillingContent />
    </Suspense>
  )
}