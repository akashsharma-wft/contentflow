'use client'

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { SidebarLogo } from './SidebarLogo'
import { SidebarNav } from './SidebarNav'
import { SidebarFooter } from './SidebarFooter'
import { CollapsedSignOut } from './CollapsedSignOut'
import { cn } from '@/lib/utils'

function StatusBar() {
  return (
    <div className="px-4 py-2 border-t border-white/5">
      <p className="text-white/15 text-[9px] uppercase tracking-widest leading-relaxed">
        Built with ContentFlow SDK
        <span className="mx-1.5">·</span>
        <span className="text-emerald-500/60">System Status: Nominal</span>
      </p>
    </div>
  )
}

export function Sidebar() {
  const sidebarOpen   = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-full shrink-0 bg-[#0d0e14] border-r border-white/5',
        'transition-all duration-200 overflow-hidden',
        sidebarOpen ? 'w-[220px]' : 'w-[56px]'
      )}
    >
      {/* ── Logo + collapse toggle ── */}
      <div className={cn(
        'flex items-center py-4 px-3 shrink-0',
        sidebarOpen ? 'justify-between' : 'justify-center'
      )}>
        {sidebarOpen && <SidebarLogo />}

        <button
          onClick={toggleSidebar}
          className="text-white/30 hover:text-white/70 hover:bg-white/5 p-1.5 rounded-lg transition-all cursor-pointer shrink-0"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen
            ? <PanelLeftClose size={15} />
            : <PanelLeftOpen  size={15} />
          }
        </button>
      </div>

      {/* ── Nav items — icons only when collapsed ── */}
      <SidebarNav collapsed={!sidebarOpen} />

      {/* ── Footer: full when open, icon-only when collapsed ── */}
      {sidebarOpen ? (
        <>
          <SidebarFooter />
          <StatusBar />
        </>
      ) : (
        <div className="mt-auto pb-4 flex flex-col items-center gap-1 px-2">
          <div className="w-full h-px bg-white/5 mb-2" />
          <CollapsedSignOut />
        </div>
      )}
    </aside>
  )
}