// ─── features/billing/components/PlansGrid.tsx ───────────────────────────────
// Free vs Pro plan comparison — matches Figma billing page exactly.
// "Current Plan" button shown on active plan, "Upgrade" on inactive.
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlansGridProps {
  currentTier: 'free' | 'pro'
  proPriceId: string
  onUpgrade: () => void
  isLoading: boolean
}

const FREE_FEATURES = [
  '5 Published Posts',
  '1,000 API calls',
  'Community Support',
]

const PRO_FEATURES = [
  'Unlimited Posts',
  '10,000 API calls',
  'Priority Email Support',
  'Team Collaboration (5 seats)',
]

export function PlansGrid({
  currentTier,
  onUpgrade,
  isLoading,
}: PlansGridProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-white text-sm font-semibold">Plans</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Free plan */}
        <div className="bg-[#13141c] border border-white/5 rounded-2xl p-5 space-y-4">
          <div>
            <h4 className="text-white text-lg font-bold">Free</h4>
            <p className="text-white/35 text-xs mt-1">
              For individual developers starting their editorial journey.
            </p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-white text-3xl font-bold">$0</span>
            <span className="text-white/30 text-sm">/mo</span>
          </div>
          <ul className="space-y-2">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check size={13} className="text-white/30 shrink-0" />
                <span className="text-white/45 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <button
            disabled={currentTier === 'free' || isLoading}
            className={cn(
              'w-full py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer',
              currentTier === 'free'
                ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                : 'bg-white/5 border border-white/15 text-white/60 hover:text-white hover:bg-white/8'
            )}
          >
            {currentTier === 'free' ? 'Current Plan' : 'Downgrade'}
          </button>
        </div>

        {/* Pro plan — highlighted with indigo border + "Most Popular" badge */}
        <div className={cn(
          'bg-[#13141c] border rounded-2xl p-5 space-y-4 relative',
          currentTier === 'pro'
            ? 'border-indigo-500/40'
            : 'border-indigo-500/20'
        )}>
          {/* Most Popular badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="px-3 py-0.5 bg-indigo-500 text-white text-[10px] font-semibold uppercase tracking-widest rounded-full">
              Most Popular
            </span>
          </div>

          <div>
            <h4 className="text-white text-lg font-bold">Pro</h4>
            <p className="text-white/35 text-xs mt-1">
              Unleash the full potential of high-performance content delivery.
            </p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-white text-3xl font-bold">$29</span>
            <span className="text-white/30 text-sm">/mo</span>
          </div>
          <ul className="space-y-2">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check size={13} className="text-indigo-400 shrink-0" />
                <span className="text-white/60 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={currentTier !== 'pro' ? onUpgrade : undefined}
            disabled={isLoading}
            className={cn(
              'w-full py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer',
              currentTier === 'pro'
                ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            )}
          >
            {isLoading
              ? 'Loading...'
              : currentTier === 'pro'
              ? 'Current Plan'
              : 'Upgrade to Pro'}
          </button>
        </div>
      </div>
    </div>
  )
}