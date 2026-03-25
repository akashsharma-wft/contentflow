// ─── features/billing/components/UsageCard.tsx ───────────────────────────────
// Usage this month section with progress bars — matches Figma exactly.
import { cn } from '@/lib/utils'

interface UsageItem {
  label: string
  current: number
  max: number
  unit?: string
}

interface UsageCardProps {
  items: UsageItem[]
}

function UsageBar({ item }: { item: UsageItem }) {
  const percentage = Math.min((item.current / item.max) * 100, 100)
  const isWarning = percentage > 75
  const isDanger = percentage > 90

  const formatValue = (val: number, unit?: string) => {
    if (unit === 'GB') return `${val}GB`
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`
    return val.toString()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-sm">{item.label}</span>
        <span className="text-white/40 text-xs font-mono">
          {formatValue(item.current, item.unit)} / {formatValue(item.max, item.unit)}
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function UsageCard({ items }: UsageCardProps) {
  return (
    <div className="bg-[#13141c] border border-white/5 rounded-2xl p-5 space-y-4">
      <h3 className="text-white text-sm font-semibold">Usage this month</h3>
      <div className="space-y-4">
        {items.map((item) => (
          <UsageBar key={item.label} item={item} />
        ))}
      </div>
    </div>
  )
}