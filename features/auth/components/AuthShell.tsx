import { LayoutGrid, GitBranch, Shield, Zap } from 'lucide-react'

const features = [
  { icon: Zap,        text: 'API-first delivery architecture' },
  { icon: LayoutGrid, text: 'Visual Schema Builder v2.0' },
  { icon: Shield,     text: 'Multi-environment staging' },
]

const mobileFeatures = [
  {
    icon: LayoutGrid,
    title: 'API-First Architecture',
    description: 'Headless CMS built specifically for CI/CD pipelines and static site generators.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'RBAC, SSO integration, and audit logs come standard with every engineering seat.',
  },
]

interface AuthShellProps {
  children: React.ReactNode
  mode: 'signin' | 'signup'
  headline: string
  subheadline: string
  badge: string | null
}

export function AuthShell({
  children,
  headline,
  subheadline,
  badge,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#0d0e14] flex flex-col lg:flex-row">

      {/* ── Mobile top bar ──────────────────────────────────────── */}
      <div className="flex lg:hidden items-center gap-2.5 px-5 pt-5 pb-2">
        <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <path d="M3 9h9m0 0-3-3m3 3-3 3M12 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1"
              stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-white font-semibold text-base tracking-tight">ContentFlow</span>
      </div>

      {/* ── Left panel — desktop only ───────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 border-r border-white/5">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9h9m0 0-3-3m3 3-3 3M12 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1"
                stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">ContentFlow</span>
        </div>

        {/* Hero */}
        <div className="space-y-10">
          <h1 className="text-white text-5xl font-bold leading-tight tracking-tight">
            {headline}
          </h1>
          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-white/50" />
                </div>
                <span className="text-white/55 text-sm font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom */}
        <div className="flex items-center gap-2">
          <span className="text-white/25 text-xs uppercase tracking-widest">Backed by</span>
          <span className="text-white/50 text-xs font-semibold">Supabase Auth</span>
        </div>
      </div>

      {/* ── Right panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:justify-between lg:items-center lg:px-6 lg:py-12">

        {/* Mobile hero — shown only on small screens */}
        <div className="lg:hidden px-5 pt-4 pb-6 space-y-3">
          {badge && (
            <span className="inline-block bg-indigo-500/20 text-indigo-400 text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-500/30">
              {badge}
            </span>
          )}
          <h1 className="text-white text-3xl font-bold leading-tight tracking-tight">
            {headline}
          </h1>
          <p className="text-white/40 text-sm">{subheadline}</p>
        </div>

        {/* Desktop spacer */}
        <div className="hidden lg:block" />

        {/* Card — full width mobile, max-w on desktop */}
        <div className="w-full lg:max-w-md px-4 lg:px-0">
          {children}
        </div>

        {/* Mobile feature cards — shown below form on mobile */}
        <div className="lg:hidden px-4 pt-8 pb-4 space-y-4">
          {mobileFeatures.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={16} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{title}</p>
                <p className="text-white/40 text-xs mt-1 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div className="flex flex-col items-center gap-3 py-8 lg:py-0">
          <div className="flex items-center gap-5">
            {['Terms of Service', 'Privacy Policy', 'Security'].map((link) => (
              <a key={link} href="#"
                className="text-white/20 text-[10px] uppercase tracking-widest hover:text-white/40 transition-colors">
                {link}
              </a>
            ))}
          </div>
          <p className="text-white/15 text-[10px] uppercase tracking-widest lg:hidden">
            © 2024 ContentFlow Engineering
          </p>
        </div>
      </div>
    </div>
  )
}