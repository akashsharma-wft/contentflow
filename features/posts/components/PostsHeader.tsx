// ─── features/posts/components/PostsHeader.tsx ───────────────────────────────
'use client'

import { RefreshCw, Plus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export function PostsHeader() {
  const queryClient = useQueryClient()
  const [isSyncing, setIsSyncing] = useState(false)

  // Invalidates the ['posts'] cache — forces TanStack Query to refetch from Sanity
  async function handleSync() {
    setIsSyncing(true)
    await queryClient.invalidateQueries({ queryKey: ['posts'] })
    setTimeout(() => setIsSyncing(false), 800)
  }

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h1 className="text-white text-2xl font-bold tracking-tight">Blog Posts</h1>
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
            via Sanity GROQ
          </span>
        </div>
        <p className="text-white/35 text-sm">
          Manage your technical documentation and editorial content.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Sync — invalidates TanStack Query cache, triggers real refetch */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-white/60 hover:text-white text-sm rounded-lg transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync'}
        </button>

        {/* Opens Sanity Studio to create a new post */}
        <a
          href="http://localhost:3333/studio/desk/post"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={13} />
          New Post
        </a>
      </div>
    </div>
  )
}