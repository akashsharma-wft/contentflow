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
          {/* Center all content with consistent max-width */}
          <div className="mx-auto w-full max-w-[1100px] px-4 lg:px-8">
            {children}
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </div>
  )
}