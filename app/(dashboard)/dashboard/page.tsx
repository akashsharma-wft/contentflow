// ─── app/(dashboard)/dashboard/page.tsx ──────────────────────────────────────
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'
import { EnvLogsTable }    from '@/features/dashboard/components/EnvLogsTable'
import { DashboardStats }  from '@/features/dashboard/components/DashboardStats'
import Link from 'next/link'

export const metadata = { title: 'Dashboard — ContentFlow' }

export default function DashboardPage() {
  return (
    <div className="px-5 lg:px-8 py-6 space-y-5 max-w-[1000px]">
      <DashboardHeader />
      <DashboardStats />
      <EnvLogsTable />

      <div className="hidden lg:flex items-center justify-between py-3 border-t border-white/5">
        <p className="text-white/20 text-[10px] uppercase tracking-widest font-mono">
          Built with ContentFlow SDK
          <span className="mx-2">·</span>
          <span className="text-emerald-500/50">System Status: Nominal</span>
        </p>
        <div className="flex items-center gap-4">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            className="text-white/20 text-[10px] uppercase tracking-widest hover:text-white/50 transition-colors cursor-pointer">
            Repository
          </a>
          <Link href="/dashboard/analytics"
            className="text-white/20 text-[10px] uppercase tracking-widest hover:text-white/50 transition-colors cursor-pointer">
            Changelog
          </Link>
          <Link href="/dashboard/settings"
            className="text-white/20 text-[10px] uppercase tracking-widest hover:text-white/50 transition-colors cursor-pointer">
            Security
          </Link>
        </div>
      </div>
    </div>
  )
}