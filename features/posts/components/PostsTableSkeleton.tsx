export function PostsTableSkeleton() {
  return (
    <div className="bg-[#13141c] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-white/5">
        <div className="h-3 w-48 bg-white/5 rounded" />
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-4 py-4 border-b border-white/5 flex items-center gap-4">
          <div className="w-4 h-4 bg-white/5 rounded" />
          <div className="flex-1 h-3 bg-white/5 rounded" />
          <div className="w-20 h-5 bg-white/5 rounded-full" />
          <div className="w-32 h-3 bg-white/5 rounded" />
          <div className="w-24 h-3 bg-white/5 rounded" />
        </div>
      ))}
    </div>
  )
}