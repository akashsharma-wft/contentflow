import { DashboardHeader }           from '@/features/dashboard/components/DashboardHeader'
import { DashboardStats }            from '@/features/dashboard/components/DashboardStats'
import { ColorArchitectureCard }     from '@/features/dashboard/components/ColorArchitectureCard'
import { EditorialTypographyCard }   from '@/features/dashboard/components/EditorialTypographyCard'
import { InteractionLibraryCard }    from '@/features/dashboard/components/InteractionLibraryCard'
import { GraphQLNodeCard }           from '@/features/dashboard/components/GraphQLNodeCard'
import { EnvLogsTable }              from '@/features/dashboard/components/EnvLogsTable'
import Link from 'next/link'

export const metadata = { title: 'Dashboard — ContentFlow' }

export default function DashboardPage() {
  return (
    <div className="py-6 space-y-5">
      <DashboardHeader />
      {/* Real data stats */}
      <DashboardStats />
      {/* Design system showcase cards — these are UI demos, not data */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
        <ColorArchitectureCard />
        <EditorialTypographyCard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InteractionLibraryCard />
        <GraphQLNodeCard />
      </div>
      <EnvLogsTable />
      <div className="hidden lg:flex items-center justify-between py-3 border-t border-white/5">
        <p className="text-white/20 text-[10px] uppercase tracking-widest font-mono">
          Built with ContentFlow SDK
          <span className="mx-2">·</span>
          <span className="text-emerald-500/50">System Status: Nominal</span>
        </p>
        <div className="flex items-center gap-4">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            className="text-white/20 text-[10px] uppercase tracking-widest hover:text-white/50 transition-colors">
            Repository
          </a>
          <Link href="/dashboard/analytics"
            className="text-white/20 text-[10px] uppercase tracking-widest hover:text-white/50 transition-colors">
            Changelog
          </Link>
          <Link href="/dashboard/settings"
            className="text-white/20 text-[10px] uppercase tracking-widest hover:text-white/50 transition-colors">
            Security
          </Link>
        </div>
      </div>
    </div>
  )
}