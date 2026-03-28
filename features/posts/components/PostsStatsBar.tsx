import { FileText, CheckCircle, FileEdit, Eye } from 'lucide-react'

interface PostsStatsBarProps {
  total: number
  published: number
  drafts: number
}

export function PostsStatsBar({ total, published, drafts }: PostsStatsBarProps) {

  const stats = [
    {
      label: 'My Posts',
      value: total.toLocaleString(),
      subColor: 'text-indigo-400',
      icon: FileText,
    },
    {
      label: 'Published',
      value: published.toString(),
      sub: 'Live',
      subColor: 'text-emerald-400',
      icon: CheckCircle,
      bar: true,
      barColor: 'bg-emerald-500',
      barWidth: `${Math.round((published / (total || 1)) * 100)}%`,
    },
    {
      label: 'Drafts',
      value: drafts.toString(),
      sub: 'Unpublished',
      subColor: 'text-white/30',
      icon: FileEdit,
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {stats.map(({ label, value, sub, subColor, icon: Icon, bar, barColor, barWidth }) => (
        <div
          key={label}
          className="bg-[#13141c] border border-white/5 rounded-xl p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-medium">
              {label}
            </p>
            <Icon size={13} className="text-white/20" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-white text-2xl font-bold tracking-tight">{value}</span>
            <span className={`text-xs font-medium ${subColor}`}>{sub}</span>
          </div>
          {/* Progress bar — only on Published card */}
          {bar && barWidth && (
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: barWidth }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}