import { Filter, Download, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

// Status badge colors matching Figma
const STATUS_STYLES: Record<string, string> = {
  OPERATIONAL:  'text-emerald-400',
  'RE-INDEXING': 'text-amber-400',
  DEGRADED:     'text-red-400',
}

const STATUS_DOT: Record<string, string> = {
  OPERATIONAL:  'bg-emerald-400',
  'RE-INDEXING': 'bg-amber-400',
  DEGRADED:     'bg-red-400',
}

// Static data — will be replaced with real API data in Phase 2
const LOGS = [
  { id: 'NODE_PX_882',   status: 'OPERATIONAL',  latency: '12ms',  lastAuth: '2023-11-24 14:02' },
  { id: 'EDGE_GATE_01',  status: 'RE-INDEXING',  latency: '420ms', lastAuth: '2023-11-24 13:58' },
  { id: 'DB_SHARD_MAIN', status: 'OPERATIONAL',  latency: '4ms',   lastAuth: '2023-11-24 14:05' },
]

export function EnvLogsTable() {
  return (
    <div className="bg-[#13141c] border border-white/5 rounded-2xl overflow-hidden">

      {/* Table header row */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h3 className="text-white text-sm font-semibold">System Environment Logs</h3>
        <div className="flex items-center gap-2">
          <button className="text-white/30 hover:text-white/60 transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <Filter size={14} />
          </button>
          <button className="text-white/30 hover:text-white/60 transition-colors p-1.5 rounded-lg hover:bg-white/5">
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-4 px-5 py-2.5 border-b border-white/5">
        {['Resource ID', 'Status', 'Latency', 'Last Auth'].map((col) => (
          <span key={col} className="text-white/25 text-[10px] uppercase tracking-widest font-medium">
            {col}
          </span>
        ))}
      </div>

      {/* Data rows */}
      {LOGS.map((log, index) => (
        <div
          key={log.id}
          className={cn(
            'grid grid-cols-4 items-center px-5 py-3.5 group',
            index < LOGS.length - 1 && 'border-b border-white/5'
          )}
        >
          {/* Resource ID with status dot */}
          <div className="flex items-center gap-2.5">
            <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', STATUS_DOT[log.status])} />
            <span className="text-white/80 text-sm font-mono">{log.id}</span>
          </div>

          {/* Status */}
          <span className={cn('text-xs font-semibold tracking-wide', STATUS_STYLES[log.status])}>
            {log.status}
          </span>

          {/* Latency */}
          <span className="text-white/50 text-sm font-mono">{log.latency}</span>

          {/* Last auth + options button */}
          <div className="flex items-center justify-between">
            <span className="text-white/35 text-xs font-mono">{log.lastAuth}</span>
            <button className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/60 transition-all p-1 rounded">
              <MoreVertical size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}