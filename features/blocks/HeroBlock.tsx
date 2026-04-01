import Link from 'next/link'
import { cn } from '@/lib/utils'

interface HeroBlockProps {
  block: {
    heading: string
    subheading?: string
    badge?: string
    theme?: 'dark' | 'light' | 'gradient'
    primaryCta?: { label: string; href: string }
    secondaryCta?: { label: string; href: string }
    backgroundImage?: string
  }
}

export function HeroBlock({ block }: HeroBlockProps) {
  const { heading, subheading, badge, theme = 'dark', primaryCta, secondaryCta, backgroundImage } = block

  const themeClasses = {
    dark: 'bg-[#0d0e14]',
    light: 'bg-white',
    gradient: 'bg-gradient-to-br from-indigo-900 via-[#0d0e14] to-[#0d0e14]',
  }

  const headingColor = theme === 'light' ? 'text-gray-900' : 'text-white'
  const subColor = theme === 'light' ? 'text-gray-600' : 'text-white/50'
  const badgeColor = theme === 'light'
    ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'

  return (
    <section
      className={cn('relative w-full px-5 lg:px-8 py-20 lg:py-32', themeClasses[theme])}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {backgroundImage && <div className="absolute inset-0 bg-[#0d0e14]/80" />}
      <div className="relative max-w-4xl mx-auto text-center space-y-6">
        {badge && (
          <span className={cn('inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full border', badgeColor)}>
            {badge}
          </span>
        )}
        <h1 className={cn('text-4xl lg:text-6xl font-bold tracking-tight leading-tight', headingColor)}>
          {heading}
        </h1>
        {subheading && (
          <p className={cn('text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto', subColor)}>
            {subheading}
          </p>
        )}
        {(primaryCta || secondaryCta) && (
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            {primaryCta?.href && primaryCta?.label && (
              <Link href={primaryCta.href} className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors cursor-pointer">
                {primaryCta.label}
              </Link>
            )}
            {secondaryCta?.href && secondaryCta?.label && (
              <Link href={secondaryCta.href} className={cn('px-6 py-3 font-semibold rounded-xl transition-all cursor-pointer border', theme === 'light' ? 'border-gray-300 text-gray-700 hover:border-gray-400' : 'border-white/15 text-white/70 hover:text-white hover:border-white/30')}>
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
