import { Sidebar } from '@/features/dashboard/components/Sidebar'
import { MobileTopBar } from '@/features/dashboard/components/MobileTopBar'
import { MobileBottomNav } from '@/features/dashboard/components/MobileBottomNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-[#0d0e14] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileTopBar />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
            <div className="w-full max-w-5xl mx-auto py-6 px-6 lg:px-8">
              {children}
            </div>
          </main>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  )
}