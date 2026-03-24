import Link from 'next/link'

export function SidebarLogo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-5">
      {/* Logo icon — indigo square with grid icon matching Figma */}
      <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
          <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
          <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
          <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.5"/>
        </svg>
      </div>
      {/* Text stack */}
      <div className="flex flex-col">
        <span className="text-white text-sm font-semibold leading-tight tracking-tight">
          ContentFlow
        </span>
        <span className="text-white/30 text-[9px] uppercase tracking-widest font-medium">
          Engineering CMS
        </span>
      </div>
    </Link>
  )
}