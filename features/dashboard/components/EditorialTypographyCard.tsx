// ─── features/dashboard/components/EditorialTypographyCard.tsx ───────────────
// Right card in top row of Figma

export function EditorialTypographyCard() {
  return (
    <div className="bg-[#13141c] border border-white/5 rounded-2xl p-5 space-y-4">
      <h3 className="text-white text-base font-semibold">Editorial Typography</h3>

      {/* Headline sample */}
      <div className="space-y-1">
        <p className="text-white/20 text-[9px] uppercase tracking-widest font-mono">
          Headline-Large (32px)
        </p>
        <p className="text-white text-2xl font-bold tracking-tight leading-tight">
          Dynamic Schema
        </p>
      </div>

      {/* Body sample */}
      <div className="space-y-1">
        <p className="text-white/20 text-[9px] uppercase tracking-widest font-mono">
          Body-Medium (14px)
        </p>
        <p className="text-white/45 text-sm leading-relaxed">
          The architecture is designed to handle high-density technical data
          across distributed systems with zero latency.
        </p>
      </div>

      {/* Data layer mono */}
      <div className="space-y-1">
        <p className="text-white/20 text-[9px] uppercase tracking-widest font-mono">
          Data Layer (DM Mono)
        </p>
        <div className="bg-[#0d0e14] rounded-lg border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
            <span className="text-white/40 text-[11px] font-mono">API_REQUEST_ID</span>
            <span className="text-white/60 text-[11px] font-mono">cf_9x22_jk1</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-white/40 text-[11px] font-mono">UPTIME_METRIC</span>
            <span className="text-emerald-400 text-[11px] font-mono">99.098%</span>
          </div>
        </div>
      </div>
    </div>
  )
}