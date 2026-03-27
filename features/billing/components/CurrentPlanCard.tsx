'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useUser } from '@/hooks/useUser'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface CurrentPlanCardProps {
  tier: 'free' | 'pro'
  onUpgrade: () => void
  isLoading: boolean
}

export function CurrentPlanCard({ tier, onUpgrade, isLoading }: CurrentPlanCardProps) {
  const isPro = tier === 'pro'
  const { user, profile } = useUser()
  const queryClient = useQueryClient()
  const [isCancelling, setIsCancelling] = useState(false)

  async function handleManageSubscription() {
    // In production: redirect to Stripe Customer Portal
    // Requires creating a portal session API route
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.info('Stripe Customer Portal — add STRIPE_CUSTOMER_PORTAL_URL to configure')
      }
    } catch {
      toast.info('Stripe Customer Portal not configured yet')
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel your Pro subscription?')) return
    setIsCancelling(true)

    try {
      const response = await fetch('/api/stripe/cancel', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      // Update local state immediately
      const supabase = createClient()
      await supabase
        .from('profiles')
        .update({ subscription_tier: 'free' })
        .eq('id', user!.id)

      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      toast.success('Subscription cancelled. You will keep Pro access until the end of the billing period.')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel subscription')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="bg-[#13141c] border border-white/5 rounded-2xl p-5">
      <p className="text-white/30 text-[10px] uppercase tracking-widest font-mono mb-3">
        Current Plan
      </p>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-white text-2xl font-bold">
            {isPro ? 'Pro' : 'Free'}
          </h2>
          <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${
            isPro
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : 'text-white/40 bg-white/5 border-white/10'
          }`}>
            {isPro ? 'Active' : 'Free Tier'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isPro ? (
            <>
              <button
                onClick={handleManageSubscription}
                disabled={isLoading}
                className="px-4 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-white/60 hover:text-white text-sm rounded-lg transition-all cursor-pointer"
              >
                Manage subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling || isLoading}
                className="px-4 py-2 bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel'}
              </button>
            </>
          ) : (
            <button
              onClick={onUpgrade}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Upgrade to Pro'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}