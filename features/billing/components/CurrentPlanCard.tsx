// ─── features/billing/components/CurrentPlanCard.tsx ─────────────────────────
// Shows the user's current plan with Manage/Cancel buttons.
// Reads subscription_tier from Supabase profile via useUser hook.
import { Shield } from 'lucide-react'

interface CurrentPlanCardProps {
  tier: 'free' | 'pro'
  onManage: () => void
  onUpgrade: () => void
  isLoading: boolean
}

export function CurrentPlanCard({
  tier,
  onManage,
  onUpgrade,
  isLoading,
}: CurrentPlanCardProps) {
  const isPro = tier === 'pro'

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
          <span className={`
            px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border
            ${isPro
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : 'text-white/40 bg-white/5 border-white/10'
            }
          `}>
            {isPro ? 'Active' : 'Free Tier'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isPro ? (
            <>
              <button
                onClick={onManage}
                disabled={isLoading}
                className="px-4 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-white/60 hover:text-white text-sm rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                Manage subscription
              </button>
              <button
                disabled={isLoading}
                className="px-4 py-2 bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={onUpgrade}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? 'Loading...' : 'Upgrade to Pro'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}