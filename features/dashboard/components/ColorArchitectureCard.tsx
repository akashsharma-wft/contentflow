// ─── features/dashboard/components/ColorArchitectureCard.tsx ─────────────────
// Left wide card in the Figma grid

const COLOR_SWATCHES = [
  { hex: '#111319', label: 'Surface Base' },
  { hex: '#0C0E14', label: 'Lowest Canvas' },
  { hex: '#C0C1FF', label: 'Primary Indigo', highlight: true },
  { hex: '#2F3AA3', label: 'Accent Dark', highlight: true },
]

const STATUS_ITEMS = [
  { color: '#10B981', label: 'SUCCESS',  hex: '#10B981' },
  { color: '#F59E0B', label: 'WARNING',  hex: '#F59E0B' },
  { color: '#FF4B4B', label: 'DANGER',   hex: '#FF4B4B' },
  { color: '#388DF8', label: 'INFO',     hex: '#388DF8' },
]

export function ColorArchitectureCard() {
  return (
    <div className="bg-[#13141c] border border-white/5 rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white text-base font-semibold">Color Architecture</h3>
          <p className="text-white/35 text-xs mt-0.5">Tonal shifts over explicit borders.</p>
        </div>
        <span className="text-[9px] text-white/20 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded font-mono">
          Surface Nesting Logic
        </span>
      </div>

      {/* Main swatches */}
      <div className="grid grid-cols-4 gap-2">
        {COLOR_SWATCHES.map(({ hex, label, highlight }) => (
          <div key={hex} className="space-y-1.5">
            <div
              className="h-14 rounded-lg border border-white/5 cursor-pointer hover:scale-[1.02] transition-transform"
              style={{ backgroundColor: hex }}
            />
            <p className="text-white/30 text-[10px] font-mono">{hex}</p>
            <p className="text-white/50 text-[10px] font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Status row */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        {STATUS_ITEMS.map(({ color, label, hex }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <div>
              <p className="text-white/30 text-[10px] font-mono">{hex}</p>
              <p className="text-white/20 text-[9px] uppercase tracking-widest">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}