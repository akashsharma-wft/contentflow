// ─── app/(dashboard)/billing/success/page.tsx ────────────────────────────────
// Shown after successful Stripe Checkout.
// Refetches profile from DB to confirm the tier was updated by the webhook.
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function BillingSuccessPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useUser()
  const [tier, setTier] = useState<'free' | 'pro' | null>(null)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!user?.id) return

    // Poll Supabase for the updated tier — webhook may take a few seconds
    // Try up to 8 times with 1.5s intervals (12 seconds total)
    const poll = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      const currentTier = data?.subscription_tier as 'free' | 'pro' | null
      setTier(currentTier)

      if (currentTier === 'pro') {
        // Tier confirmed — invalidate cache so billing page shows updated state
        queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
        return true
      }
      return false
    }

    const interval = setInterval(async () => {
      setAttempts((prev) => {
        if (prev >= 8) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })

      const confirmed = await poll()
      if (confirmed) clearInterval(interval)
    }, 1500)

    // Run immediately on mount too
    poll()

    return () => clearInterval(interval)
  }, [user?.id, queryClient])

  const isConfirmed = tier === 'pro'
  const isTimedOut = attempts >= 8 && !isConfirmed

  return (
    <div className="min-h-screen bg-[#0d0e14] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#13141c] border border-white/5 rounded-2xl p-8 text-center space-y-5">

        {/* Icon */}
        <div className="flex justify-center">
          {isConfirmed ? (
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-500/15 flex items-center justify-center">
              <Loader2 size={32} className="text-indigo-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-white text-xl font-bold">
            {isConfirmed
              ? 'Welcome to Pro!'
              : isTimedOut
              ? 'Payment Received'
              : 'Confirming your upgrade...'}
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            {isConfirmed
              ? 'Your account has been upgraded to ContentFlow Pro. All features are now unlocked.'
              : isTimedOut
              ? 'Your payment was received. Your account will be upgraded shortly — refresh the billing page in a moment.'
              : 'We\'re confirming your payment with Stripe. This usually takes a few seconds.'}
          </p>
        </div>

        {/* Features unlocked */}
        {isConfirmed && (
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 text-left space-y-2">
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">
              Now unlocked
            </p>
            {['Unlimited Posts', '10,000 API calls/month', 'Priority Email Support', 'Team Collaboration (5 seats)'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                <span className="text-white/60 text-sm">{f}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Link
            href="/dashboard/billing"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Go to Billing
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/dashboard"
            className="w-full py-2.5 text-white/40 hover:text-white/70 text-sm transition-colors cursor-pointer"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}