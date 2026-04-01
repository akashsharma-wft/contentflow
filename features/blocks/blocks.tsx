import Link from 'next/link'
import { cn } from '@/lib/utils'

// CtaBlock
export function CtaBlock({ block }: { block: { heading: string; body?: string; theme?: string; centered?: boolean; primaryButton?: { label: string; href: string }; secondaryButton?: { label: string; href: string } } }) {
  const { heading, body, theme = 'indigo', centered = true, primaryButton, secondaryButton } = block
  const themeClasses: Record<string, string> = {
    dark: 'bg-[#13141c] border border-white/5',
    indigo: 'bg-indigo-500/10 border border-indigo-500/20',
    subtle: 'bg-transparent border border-white/10',
  }
  return (
    <section className="w-full px-5 lg:px-8 py-16 bg-[#0d0e14]">
      <div className="max-w-3xl mx-auto">
        <div className={cn('rounded-2xl p-10', themeClasses[theme] ?? themeClasses.indigo, centered && 'text-center')}>
          <h2 className="text-white text-3xl font-bold tracking-tight">{heading}</h2>
          {body && <p className="text-white/50 text-base leading-relaxed mt-3 max-w-xl mx-auto">{body}</p>}
          {(primaryButton || secondaryButton) && (
            <div className={cn('flex gap-3 flex-wrap mt-6', centered && 'justify-center')}>
              {primaryButton?.href && primaryButton?.label && (
                <Link href={primaryButton.href} className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors cursor-pointer text-sm">{primaryButton.label}</Link>
              )}
              {secondaryButton?.href && secondaryButton?.label && (
                <Link href={secondaryButton.href} className="px-6 py-3 border border-white/15 text-white/60 hover:text-white hover:border-white/30 font-semibold rounded-xl transition-all cursor-pointer text-sm">{secondaryButton.label}</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// StatsBlock
interface Stat { _key: string; value: string; label: string; description?: string }
export function StatsBlock({ block }: { block: { heading?: string; stats?: Stat[]; useLivePostCount?: boolean; livePostCount?: number } }) {
  const { heading, stats, useLivePostCount, livePostCount } = block
  if (!stats?.length) return null
  const displayStats = stats.map((stat, i) => ({
    ...stat,
    value: i === 0 && useLivePostCount && livePostCount !== undefined ? `${livePostCount}+` : stat.value,
  }))
  return (
    <section className="w-full px-5 lg:px-8 py-16 bg-[#0d0e14]">
      <div className="max-w-5xl mx-auto space-y-8">
        {heading && <h2 className="text-white text-2xl font-bold tracking-tight text-center">{heading}</h2>}
        <div className={cn('grid gap-4', displayStats.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : displayStats.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4')}>
          {displayStats.map((stat) => (
            <div key={stat._key} className="bg-[#13141c] border border-white/5 rounded-2xl p-6 text-center space-y-1">
              <p className="text-white text-4xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-white/60 text-sm font-medium">{stat.label}</p>
              {stat.description && <p className="text-white/30 text-xs">{stat.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// RichTextBlock
export function RichTextBlock({ block }: { block: { heading?: string; content?: unknown[]; maxWidth?: string } }) {
  const { heading, maxWidth = 'medium' } = block
  const widthClass: Record<string, string> = { narrow: 'max-w-[680px]', medium: 'max-w-[800px]', full: 'max-w-full' }
  const { PortableText } = require('@portabletext/react')
  return (
    <section className="w-full px-5 lg:px-8 py-16 bg-[#0d0e14]">
      <div className={cn('mx-auto', widthClass[maxWidth] ?? widthClass.medium)}>
        {heading && <h2 className="text-white text-2xl font-bold tracking-tight mb-6">{heading}</h2>}
        {block.content && <div className="prose prose-invert max-w-none"><PortableText value={block.content} /></div>}
      </div>
    </section>
  )
}
