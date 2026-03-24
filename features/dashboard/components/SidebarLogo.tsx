import Link from 'next/link'

export function SidebarLogo() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
    >
      <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
          <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
          <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
          <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.5"/>
        </svg>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-white text-xs font-semibold leading-tight truncate">
          ContentFlow
        </span>
        <span className="text-white/30 text-[9px] uppercase tracking-widest">
          Engineering CMS
        </span>
      </div>
    </Link>
  )
}