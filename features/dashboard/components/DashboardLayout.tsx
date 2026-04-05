// features/dashboard/components/DashboardLayout.tsx
// Server component wrapper — renders sidebar (desktop) + mobile nav around page content.
// Import this in route files that need the authenticated dashboard shell.
import { Sidebar } from './Sidebar'
import { MobileTopBar } from './MobileTopBar'
import { MobileBottomNav } from './MobileBottomNav'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0d0e14] overflow-hidden">
      {/* Sidebar — hidden on mobile, visible lg+ */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar — visible below lg, hidden on desktop */}
        <MobileTopBar />

        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <div className="w-full max-w-5xl mx-auto py-6 px-4 lg:px-8">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav — visible below lg */}
        <MobileBottomNav />
      </div>
    </div>
  )
}