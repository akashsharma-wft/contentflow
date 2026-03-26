'use client'

import { useQuery } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { Filter, Download, MoreVertical, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const STATUS_STYLES: Record<string, string> = {
  active:     'text-emerald-400',
  inactive:   'text-amber-400',
  error:      'text-red-400',
}

const STATUS_DOT: Record<string, string> = {
  active:     'bg-emerald-400',
  inactive:   'bg-amber-400',
  error:      'bg-red-400',
}

export function EnvLogsTable() {
  const { user } = useUser()
  const supabase = createClient()

  // Fetch real profile data to show in the table
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['env-logs', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email, subscription_tier, created_at, updated_at')
        .eq('id', user!.id) // only current user's data
        .single()
      if (error) throw error
      return data ? [data] : []
    },
    enabled: !!user?.id,
  })

  const logs = (profiles ?? []).map((p) => ({
    id: `USER_${p.id.slice(0, 8).toUpperCase()}`,
    status: 'active',
    latency: '—',
    lastAuth: p.updated_at
      ? format(new Date(p.updated_at), 'yyyy-MM-dd HH:mm')
      : '—',
  }))

  return (
    <div className="bg-[#13141c] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h3 className="text-white text-sm font-semibold">System Environment Logs</h3>
        <div className="flex items-center gap-2">
          <button className="text-white/30 hover:text-white/60 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
            <Filter size={14} />
          </button>
          <button className="text-white/30 hover:text-white/60 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
            <Download size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 px-5 py-2.5 border-b border-white/5">
        {['Resource ID', 'Status', 'Latency', 'Last Auth'].map((col) => (
          <span key={col} className="text-white/25 text-[10px] uppercase tracking-widest font-medium">
            {col}
          </span>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={16} className="animate-spin text-white/20" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-white/20 text-sm">No data available</p>
        </div>
      ) : (
        logs.map((log, index) => (
          <div
            key={log.id}
            className={cn(
              'grid grid-cols-4 items-center px-5 py-3.5 group',
              index < logs.length - 1 && 'border-b border-white/5'
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', STATUS_DOT[log.status])} />
              <span className="text-white/80 text-sm font-mono">{log.id}</span>
            </div>
            <span className={cn('text-xs font-semibold tracking-wide', STATUS_STYLES[log.status])}>
              {log.status.toUpperCase()}
            </span>
            <span className="text-white/50 text-sm font-mono">{log.latency}</span>
            <div className="flex items-center justify-between">
              <span className="text-white/35 text-xs font-mono">{log.lastAuth}</span>
              <button className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/60 p-1 rounded cursor-pointer transition-all">
                <MoreVertical size={13} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}