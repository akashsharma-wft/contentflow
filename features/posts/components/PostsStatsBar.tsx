// features/posts/components/PostsStatsBar.tsx
import { FileText, CheckCircle, FileEdit } from 'lucide-react'

interface PostsStatsBarProps {
  total: number
  published: number
  drafts: number
  myPostsLabel?: string
  publishedLabel?: string
  draftsLabel?: string
}

export function PostsStatsBar({
  total,
  published,
  drafts,
  myPostsLabel = 'My Posts',
  publishedLabel = 'Published',
  draftsLabel = 'Drafts',
}: PostsStatsBarProps) {
  const stats = [
    {
      label: myPostsLabel,
      value: total.toLocaleString(),
      sub: undefined,
      subColor: 'text-indigo-400',
      icon: FileText,
      bar: false,
    },
    {
      label: publishedLabel,
      value: published.toString(),
      sub: 'Live',
      subColor: 'text-emerald-400',
      icon: CheckCircle,
      bar: true,
      barColor: 'bg-emerald-500',
      barWidth: `${Math.round((published / (total || 1)) * 100)}%`,
    },
    {
      label: draftsLabel,
      value: drafts.toString(),
      sub: 'Unpublished',
      subColor: 'text-white/30',
      icon: FileEdit,
      bar: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {stats.map(({ label, value, sub, subColor, icon: Icon, bar, barColor, barWidth }) => (
        <div key={label} className="bg-[#13141c] border border-white/5 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-medium">{label}</p>
            <Icon size={13} className="text-white/20" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-white text-2xl font-bold tracking-tight">{value}</span>
            {sub && <span className={`text-xs font-medium ${subColor}`}>{sub}</span>}
          </div>
          {bar && barWidth && (
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: barWidth }} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}