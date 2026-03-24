// ─── features/dashboard/components/DashboardHeader.tsx ───────────────────────
export function DashboardHeader() {
  return (
    <div className="space-y-2">
      <p className="text-white/25 text-[10px] uppercase tracking-widest font-medium">
        Specification V1.0.4
      </p>
      <h1 className="text-white text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
        The Engineering Editorial
      </h1>
      <p className="text-white/40 text-sm leading-relaxed max-w-2xl">
        A high-performance design system for technical architects. Precise,
        layered, and built for complex information density without the visual noise.
      </p>
    </div>
  )
}