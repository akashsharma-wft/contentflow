'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Star, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface Post {
  _id: string
  title: string
  slug: string
  tags: string[]
  featured: boolean
  publishedAt: string | null
  status: 'published' | 'draft'
}

interface PostsTableProps {
  posts: Post[]
}

const STATUS_STYLES = {
  published: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  draft:     'text-amber-400  bg-amber-500/10  border-amber-500/20',
}

export function PostsTable({ posts }: PostsTableProps) {
  const [starredIds, setStarredIds] = useState<Set<string>>(
    new Set(posts.filter((p) => p.featured).map((p) => p._id))
  )

  function toggleStar(id: string) {
    setStarredIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="bg-[#13141c] border border-white/5 rounded-2xl overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-[32px_1fr_120px_160px_140px_48px] items-center px-4 py-3 border-b border-white/5">
        {['', 'Post Title', 'Status', 'Tags', 'Last Modified', ''].map((col) => (
          <span key={col} className="text-white/25 text-[10px] uppercase tracking-widest font-medium">
            {col}
          </span>
        ))}
      </div>

      {/* Rows */}
      {posts.map((post, index) => (
        <div
          key={post._id}
          className={cn(
            'grid grid-cols-[32px_1fr_120px_160px_140px_48px] items-center px-4 py-3.5 group transition-colors hover:bg-white/2',
            index < posts.length - 1 && 'border-b border-white/5'
          )}
        >
          {/* Star */}
          <button
            onClick={() => toggleStar(post._id)}
            className="cursor-pointer text-white/20 hover:text-amber-400 transition-colors"
            aria-label="Toggle featured"
          >
            <Star
              size={13}
              className={starredIds.has(post._id) ? 'fill-amber-400 text-amber-400' : ''}
            />
          </button>

          {/* Title */}
          <Link
            href={`/dashboard/posts/${post.slug}`}
            className="text-white/80 text-sm font-medium hover:text-white transition-colors cursor-pointer truncate pr-4"
          >
            {post.title}
          </Link>

          {/* Status badge */}
          <span className={cn(
            'inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border w-fit',
            STATUS_STYLES[post.status]
          )}>
            {post.status}
          </span>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(post.tags ?? []).slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-white/5 border border-white/10 text-white/45 text-[10px] rounded font-mono"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Last modified */}
          <span className="text-white/30 text-xs font-mono">
            {post.publishedAt
              ? format(new Date(post.publishedAt), 'yyyy-MM-dd HH:mm')
              : '—'}
          </span>

          {/* Actions menu */}
          <button
            className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/70 hover:bg-white/5 p-1.5 rounded-lg transition-all cursor-pointer"
            aria-label="More options"
          >
            <MoreVertical size={13} />
          </button>
        </div>
      ))}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
        <span className="text-white/25 text-[10px] uppercase tracking-widest font-mono">
          Showing {posts.length} of {posts.length} posts
        </span>
        {/* Pagination — static for now, will be wired in Phase 2 */}
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={cn(
                'w-7 h-7 text-xs rounded-lg cursor-pointer transition-all',
                page === 1
                  ? 'bg-indigo-500 text-white font-semibold'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/5'
              )}
            >
              {page}
            </button>
          ))}
          <span className="text-white/20 text-xs px-1">...</span>
          <button className="w-7 h-7 text-xs rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 cursor-pointer">7</button>
        </div>
      </div>

      {/* Status bar — matches Figma bottom bar */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/5 bg-[#0d0e14]/50">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-white/25 text-[9px] uppercase tracking-widest font-mono">
            Sanity API Connected
          </span>
        </div>
        <span className="text-white/15 text-[9px] font-mono">Latency: 42ms</span>
        <span className="text-white/15 text-[9px] font-mono">V2.4.1-Stable</span>
        <span className="ml-auto text-white/15 text-[9px] font-mono">
          © 2023 ContentFlow Engineering
        </span>
      </div>
    </div>
  )
}