'use client'

import { useUIStore } from '@/stores/uiStore'
import { SidebarLogo } from './SidebarLogo'
import { SidebarNav } from './SidebarNav'
import { SidebarFooter } from './SidebarFooter'
import { cn } from '@/lib/utils'

export function Sidebar() {
  // Selector pattern — only re-renders when sidebarOpen changes
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)

  return (
    <aside
      className={cn(
        // Base styles — fixed height, dark bg, border right
        'flex flex-col h-full bg-[#0d0e14] border-r border-white/5 transition-all duration-200',
        // Desktop: always visible, fixed 160px width
        'hidden lg:flex',
        // Width controlled by Zustand state
        sidebarOpen ? 'w-[160px]' : 'w-[60px]'
      )}
    >
      <SidebarLogo />
      <SidebarNav />
      <SidebarFooter />
    </aside>
  )
}