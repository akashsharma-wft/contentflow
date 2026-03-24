import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader'
import { EnvLogsTable } from '@/features/dashboard/components/EnvLogsTable'

export const metadata = { title: 'Dashboard — ContentFlow' }

export default function DashboardPage() {
  return (
    <div className="px-6 lg:px-8 py-6 space-y-6 max-w-[900px]">
      <DashboardHeader />
      <EnvLogsTable />
    </div>
  )
}