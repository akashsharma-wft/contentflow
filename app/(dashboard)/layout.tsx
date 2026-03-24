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

      {/* ── Desktop sidebar — hidden on mobile ── */}
      <Sidebar />

      {/* ── Right side: top bar (mobile) + main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar — hidden on desktop */}
        <MobileTopBar />

        {/* Main scrollable content area */}
        {/* pb-16 on mobile makes room for the fixed bottom nav */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          {children}
        </main>

        {/* Mobile bottom nav — fixed, hidden on desktop */}
        <MobileBottomNav />
      </div>
    </div>
  )
}