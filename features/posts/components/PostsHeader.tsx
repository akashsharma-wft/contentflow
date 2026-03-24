import Link from 'next/link'
import { RefreshCw, Plus } from 'lucide-react'

export function PostsHeader() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-white text-2xl font-bold tracking-tight">Blog Posts</h1>
          {/* "via Sanity GROQ" badge matching Figma */}
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
            via Sanity GROQ
          </span>
        </div>
        <p className="text-white/35 text-sm">
          Manage your technical documentation and editorial content across all production clusters.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {/* Sync button */}
        <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-white/60 hover:text-white text-sm rounded-lg transition-all cursor-pointer">
          <RefreshCw size={13} />
          Sync
        </button>
        {/* New Post button */}
        <Link
          href="#"
          className="flex items-center gap-2 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={13} />
          New Post
        </Link>
      </div>
    </div>
  )
}