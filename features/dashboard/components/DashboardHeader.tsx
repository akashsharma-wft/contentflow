export function DashboardHeader() {
  return (
    <div className="space-y-3">
      {/* Spec version badge — matches Figma "SPECIFICATION V1.0.4" */}
      <p className="text-white/30 text-[11px] uppercase tracking-widest font-medium">
        Specification V1.0.4
      </p>
      <h1 className="text-white text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
        The Engineering Editorial
      </h1>
      <p className="text-white/45 text-sm leading-relaxed max-w-xl">
        A high-performance design system for technical architects. Precise,
        layered, and built for complex information density without the visual noise.
      </p>
    </div>
  )
}