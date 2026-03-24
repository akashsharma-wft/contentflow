import { FileText, CheckCircle, FileEdit, Eye } from 'lucide-react'

interface PostsStatsBarProps {
  total: number
  published: number
  drafts: number
  views: number
}

export function PostsStatsBar({ total, published, drafts, views }: PostsStatsBarProps) {
  const stats = [
    {
      label: 'Total Posts',
      value: total.toLocaleString(),
      sub: '+2 vs last week',
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
      sub: 'No change',
      subColor: 'text-white/30',
      icon: FileEdit,
    },
    {
      label: 'Total Views',
      value: views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views.toString(),
      sub: '+12%',
      subColor: 'text-indigo-400',
      icon: Eye,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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