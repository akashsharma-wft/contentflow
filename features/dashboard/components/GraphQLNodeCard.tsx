// ─── features/dashboard/components/GraphQLNodeCard.tsx ───────────────────────
// Bottom right card in Figma — Enterprise GraphQL Node

import Link from 'next/link'

export function GraphQLNodeCard() {
  return (
    <div className="bg-[#13141c] border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
              v2.4.0
            </span>
            <span className="text-white/20 text-[10px] uppercase tracking-widest font-mono">
              · Updated 2m ago
            </span>
          </div>
        </div>
        {/* Network icon */}
        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="5" r="2" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
            <circle cx="5" cy="19" r="2" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
            <circle cx="19" cy="19" r="2" stroke="white" strokeOpacity="0.5" strokeWidth="1.5"/>
            <path d="M12 7v4M12 11l-7 6M12 11l7 6" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <div>
        <h3 className="text-white text-lg font-bold">Enterprise GraphQL Node</h3>
        <p className="text-white/35 text-sm leading-relaxed mt-1">
          Scalable content delivery via high-performance mesh network. Automatic
          schema synchronization enabled across 12 global regions.
        </p>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-auto">
        {/* Avatar stack */}
        <div className="flex items-center">
          {['AP', 'JK', 'ML'].map((init, i) => (
            <div
              key={init}
              className="w-7 h-7 rounded-full bg-indigo-500/30 border-2 border-[#13141c] flex items-center justify-center text-[9px] font-semibold text-indigo-300 cursor-default"
              style={{ marginLeft: i === 0 ? 0 : -8 }}
            >
              {init}
            </div>
          ))}
          <span className="ml-2 text-white/30 text-xs">+4</span>
        </div>

        <Link
          href="#"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Configure
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  )
}