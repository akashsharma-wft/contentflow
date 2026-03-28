'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Star, MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { EditPostModal } from './EditPostModal'
import { DeletePostDialog } from './DeletePostDialog'
import { useUser } from '@/hooks/useUser'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { usePostHog } from 'posthog-js/react'

interface Post {
  _id: string
  title: string
  slug: string
  tags: string[]
  featured: boolean
  publishedAt: string | null
  status: 'published' | 'draft'
  authorId?: string
}

interface PostsTableProps {
  posts: Post[]
  userId: string
}

const STATUS_STYLES = {
  published: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  draft: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
}

export function PostsTable({ posts, userId }: PostsTableProps) {
  const [editingPost, setEditingPost]   = useState<Post | null>(null)
  const [deletingPost, setDeletingPost] = useState<Post | null>(null)

  // Optimistic UI — immediate visual feedback before API confirms
  const [optimisticState, setOptimisticState] = useState<Map<string, boolean>>(new Map())

  // Debounce infrastructure — no state, just refs (no rerender on timer changes)
  const debounceTimers  = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const pendingValues   = useRef<Map<string, boolean>>(new Map())
  const mounted         = useRef(true)

  const queryClient = useQueryClient()
  const posthog     = usePostHog()
  const { user }    = useUser()

  const QUERY_KEY = ['posts-all', userId]

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      // Navigate away mid-toggle — cancel all pending API calls
      debounceTimers.current.forEach((timer) => clearTimeout(timer))
      debounceTimers.current.clear()
      pendingValues.current.clear()
    }
  }, [])

  function handleFeaturedToggle(postId: string, currentFeatured: boolean) {
    // Read from optimistic state if available (handles rapid toggle correctly)
    const currentDisplay = optimisticState.has(postId)
      ? optimisticState.get(postId)!
      : currentFeatured
    const targetFeatured = !currentDisplay

    // Show change immediately in UI
    setOptimisticState((prev) => new Map(prev).set(postId, targetFeatured))

    // Update what we'll send — if user clicks again, this overwrites
    pendingValues.current.set(postId, targetFeatured)

    // Reset debounce timer — wait for user to stop clicking
    const existing = debounceTimers.current.get(postId)
    if (existing) clearTimeout(existing)

    const timer = setTimeout(async () => {
      const finalValue = pendingValues.current.get(postId)
      if (finalValue === undefined || !mounted.current) return

      pendingValues.current.delete(postId)
      debounceTimers.current.delete(postId)

      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ featured: finalValue }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error ?? 'Failed')
        }

        if (mounted.current) {
          // Sync cache with confirmed server value
          queryClient.setQueryData(QUERY_KEY, (old: Post[] | undefined) =>
            old?.map((p) => p._id === postId ? { ...p, featured: finalValue } : p)
          )
          // Remove optimistic override — cache is now authoritative
          setOptimisticState((prev) => {
            const next = new Map(prev)
            next.delete(postId)
            return next
          })
        }
      } catch {
        if (mounted.current) {
          // Roll back: remove optimistic state, show original from cache
          setOptimisticState((prev) => {
            const next = new Map(prev)
            next.delete(postId)
            return next
          })
          toast.error('Failed to update featured status — rolled back')
        }
      }
    }, 400)

    debounceTimers.current.set(postId, timer)
  }

  async function confirmDelete() {
    if (!deletingPost) return
    const response = await fetch(`/api/posts/${deletingPost._id}`, { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: ['my-post-stats', userId] })
    posthog?.capture('post_deleted', { post_id: deletingPost._id, title: deletingPost.title })
    toast.success('Post deleted')
    setDeletingPost(null)
  }

  return (
    <>
      <div className="bg-[#13141c] border border-white/5 rounded-2xl overflow-hidden">
        <div className="hidden lg:grid grid-cols-[32px_1fr_120px_180px_150px_48px] items-center px-4 py-3 border-b border-white/5">
          {['', 'Post Title', 'Status', 'Tags', 'Last Modified', ''].map((col, i) => (
            <span key={i} className="text-white/25 text-[10px] uppercase tracking-widest font-medium">
              {col}
            </span>
          ))}
        </div>

        {posts.map((post, index) => {
          const displayFeatured = optimisticState.has(post._id)
            ? optimisticState.get(post._id)!
            : post.featured

          // Pending = timer is running (user clicked, API not yet called)
          const isPending = debounceTimers.current.has(post._id)

          return (
            <div
              key={post._id}
              className={cn(
                'flex lg:grid lg:grid-cols-[32px_1fr_120px_180px_150px_48px] items-center px-4 py-3.5 gap-3 group transition-colors hover:bg-white/[0.02]',
                index < posts.length - 1 && 'border-b border-white/5'
              )}
            >
              <button
                onClick={() => handleFeaturedToggle(post._id, post.featured)}
                className="cursor-pointer transition-all hover:scale-110 active:scale-95"
                aria-label={displayFeatured ? 'Remove from featured' : 'Mark as featured'}
              >
                <Star
                  size={15}
                  className={cn(
                    'transition-all duration-150',
                    displayFeatured ? 'text-amber-400 fill-amber-400' : 'text-white/20 hover:text-white/50',
                    isPending && 'opacity-60 animate-pulse'
                  )}
                />
              </button>

              <Link
                href={`/posts/${post.slug}`}
                className="text-white/80 text-sm font-medium hover:text-white transition-colors truncate"
              >
                {post.title}
              </Link>

              <span className={cn(
                'hidden lg:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border w-fit shrink-0',
                STATUS_STYLES[post.status]
              )}>
                {post.status}
              </span>

              <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
                {(post.tags ?? []).filter(Boolean).slice(0, 2).map((tag, tagIndex) => (
                  <span
                    key={`${post._id}-tag-${tagIndex}`}
                    className="px-2 py-0.5 bg-white/5 border border-white/10 text-white/45 text-[10px] rounded font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <span className="hidden lg:block text-white/30 text-xs font-mono">
                {post.publishedAt
                  ? format(new Date(post.publishedAt), 'yyyy-MM-dd HH:mm')
                  : '— Unpublished'}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/70 hover:bg-white/5 p-1.5 rounded-lg transition-all cursor-pointer"
                    aria-label="More options"
                  >
                    <MoreVertical size={13} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-[#1a1d27] border border-white/10 text-white/70 min-w-[140px]"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="flex items-center gap-2 cursor-pointer hover:text-white text-sm px-3 py-2"
                    >
                      <Eye size={13} /> View post
                    </Link>
                  </DropdownMenuItem>
                  {post.authorId === user?.id && (
                    <DropdownMenuItem
                      onClick={() => setEditingPost(post)}
                      className="flex items-center gap-2 cursor-pointer text-sm px-3 py-2"
                    >
                      <Pencil size={13} /> Edit post
                    </DropdownMenuItem>
                  )}
                  {post.authorId === user?.id && (
                    <DropdownMenuItem
                      onClick={() => setDeletingPost(post)}
                      className="flex items-center gap-2 cursor-pointer text-sm px-3 py-2 text-red-400 focus:text-red-400"
                    >
                      <Trash2 size={13} /> Delete post
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        })}

        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 flex-wrap gap-2">
          <span className="text-white/25 text-[10px] uppercase tracking-widest font-mono">
            Showing {posts.length} posts
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((page) => (
              <button key={page} className={cn(
                'w-7 h-7 text-xs rounded-lg cursor-pointer transition-all',
                page === 1 ? 'bg-indigo-500 text-white font-semibold' : 'text-white/30 hover:text-white/60 hover:bg-white/5'
              )}>
                {page}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/5 bg-[#0d0e14]/50 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/25 text-[9px] uppercase tracking-widest font-mono">Sanity API Connected</span>
          </div>
          <span className="text-white/15 text-[9px] font-mono">V2.4.1-Stable</span>
          <span className="ml-auto text-white/15 text-[9px] font-mono hidden lg:block">© 2024 ContentFlow Engineering</span>
        </div>
      </div>

      <EditPostModal
        open={editingPost !== null}
        onClose={() => setEditingPost(null)}
        post={editingPost}
        currentUserId={user?.id ?? ''}
      />
      <DeletePostDialog
        open={deletingPost !== null}
        onOpenChange={(open) => { if (!open) setDeletingPost(null) }}
        postTitle={deletingPost?.title ?? ''}
        onConfirm={confirmDelete}
      />
    </>
  )
}