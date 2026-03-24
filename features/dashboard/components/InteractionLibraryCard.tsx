// ─── features/dashboard/components/InteractionLibraryCard.tsx ────────────────
// Bottom left card in Figma

export function InteractionLibraryCard() {
  return (
    <div className="bg-[#13141c] border border-white/5 rounded-2xl p-5 space-y-4">
      <h3 className="text-white text-base font-semibold">Interaction Library</h3>

      {/* Button states */}
      <div className="space-y-2">
        <p className="text-white/20 text-[9px] uppercase tracking-widest font-mono">
          Button States
        </p>
        <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">
          Primary Action
        </button>
        <div className="mt-2">
          <button className="px-4 py-2 bg-transparent border border-white/15 hover:border-white/30 text-white/60 hover:text-white text-sm rounded-lg transition-all cursor-pointer">
            Secondary Ghost
          </button>
        </div>
      </div>

      {/* Input fields */}
      <div className="space-y-2">
        <p className="text-white/20 text-[9px] uppercase tracking-widest font-mono">
          Input Fields
        </p>
        <input
          readOnly
          defaultValue=""
          placeholder="Default state..."
          className="w-full px-3 py-2 bg-[#0d0e14] border border-white/10 rounded-lg text-white/40 text-sm placeholder:text-white/20 outline-none cursor-text"
        />
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0d0e14] border border-indigo-500/40 rounded-lg">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="#6366f1" strokeWidth="1.5"/>
            <path d="m21 21-4.35-4.35" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-white/60 text-sm">Active interaction</span>
        </div>
      </div>

      {/* System tags */}
      <div className="space-y-2">
        <p className="text-white/20 text-[9px] uppercase tracking-widest font-mono">
          System Tags
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'SUCCESS', color: 'text-emerald-400 border-emerald-500/30' },
            { label: 'PENDING', color: 'text-amber-400 border-amber-500/30' },
            { label: 'CRITICAL', color: 'text-white bg-red-500 border-red-500' },
            { label: 'STABLE', color: 'text-white/50 border-white/15' },
          ].map(({ label, color }) => (
            <span
              key={label}
              className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border cursor-default ${color}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}