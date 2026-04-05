// AuthHeroSection — the left panel of login/signup pages
// This renders ONLY the left branding panel.
// The actual form (right panel) is rendered by app/(auth)/login/page.tsx etc.
// This section is used when you want to CMS-control the auth page copy.

interface AuthHeroFeature { _key?: string; icon?: string; text: string }

interface AuthHeroSectionProps {
  section: {
    headline?: string
    badge?: string
    features?: AuthHeroFeature[]
    mode?: 'signin' | 'signup' | 'both'
  }
}

export function AuthHeroSection({ section }: AuthHeroSectionProps) {
  const {
    headline = 'CMS-driven publishing for engineering teams.',
    badge,
    features = [],
  } = section

  return (
    <div className="flex flex-col justify-center h-full px-8 py-12 max-w-sm">
      {badge && (
        <span className="inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6 w-fit">
          {badge}
        </span>
      )}
      <h1 className="text-3xl font-bold text-white leading-snug mb-8">{headline}</h1>
      {features.length > 0 && (
        <ul className="space-y-4">
          {features.map((f, i) => (
            <li key={f._key ?? i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <span className="text-white/50 text-xs">{f.icon ?? '✦'}</span>
              </div>
              <span className="text-white/55 text-sm">{f.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
