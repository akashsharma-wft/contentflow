import Link from 'next/link'
import { BookOpen, LifeBuoy } from 'lucide-react'

export function SidebarFooter() {
  return (
    <div className="px-2 pb-4 space-y-1">
      {/* New Entry CTA button — indigo, full width */}
      <Link
        href="/dashboard/posts/new"
        className="flex items-center justify-center w-full py-2.5 mb-3 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        New Entry
      </Link>

      {/* Secondary links */}
      {[
        { label: 'Documentation', href: '#', icon: BookOpen },
        { label: 'Support',       href: '#', icon: LifeBuoy },
      ].map(({ label, href, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
        >
          <Icon size={14} />
          {label}
        </Link>
      ))}
    </div>
  )
}