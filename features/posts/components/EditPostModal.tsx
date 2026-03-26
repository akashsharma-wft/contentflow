'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import { X, Loader2, Star, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface EditPostModalProps {
  open: boolean
  onClose: () => void
  post: {
    _id: string
    title: string
    slug: string
    excerpt?: string
    tags?: string[]
    featured: boolean
    publishedAt: string | null
    author?: { name: string } | null
  } | null
}

export function EditPostModal({ open, onClose, post }: EditPostModalProps) {
  const queryClient = useQueryClient()
  const { user } = useUser()

  const [title, setTitle]       = useState('')
  const [excerpt, setExcerpt]   = useState('')
  const [tags, setTags]         = useState<string[]>([])
  const [featured, setFeatured] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if this post belongs to the current user
  const isOwnPost = post ? post._id.includes(user?.id?.slice(0, 8) ?? 'NEVER') 
    || post._id.startsWith(`post-`) : false

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setExcerpt(post.excerpt ?? '')
      setTags(post.tags ?? [])
      setFeatured(post.featured)
      setIsPublished(!!post.publishedAt)
    }
  }, [post])

  async function handleSubmit() {
    if (!post || !title.trim()) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/posts/${post._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim(),
          tags,
          featured,
          publishedAt: isPublished ? (post.publishedAt ?? new Date().toISOString()) : null,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Failed to update post')

      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post updated')
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open || !post) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose() }}
    >
      <div className="w-full max-w-2xl bg-[#13141c] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-white text-sm font-semibold">Edit Post</h2>
            <p className="text-white/30 text-[10px]">{post._id}</p>
          </div>
          <button onClick={onClose} disabled={isSubmitting}
            className="text-white/30 hover:text-white/70 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* If not own post, show read-only notice */}
        {!isOwnPost && (
          <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <Lock size={13} className="text-amber-400 shrink-0" />
            <p className="text-amber-300 text-xs">
              You can only edit posts you created. This post belongs to another author.
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-white/40 text-[10px] uppercase tracking-widest">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting || !isOwnPost}
              className="bg-[#0d0e14] border-white/10 text-white h-11 rounded-xl focus-visible:ring-indigo-500/30"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/40 text-[10px] uppercase tracking-widest">Excerpt</Label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              disabled={isSubmitting || !isOwnPost}
              rows={4}
              className="w-full px-3 py-2.5 bg-[#0d0e14] border border-white/10 rounded-xl text-white/70 text-sm placeholder:text-white/20 outline-none focus:border-indigo-500/40 resize-none disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-[#0d0e14] border border-white/5 rounded-xl">
              <div>
                <p className="text-white/60 text-sm flex items-center gap-1.5">
                  <Star size={12} className={featured ? 'text-amber-400 fill-amber-400' : 'text-white/30'} />
                  Featured
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFeatured(!featured)}
                disabled={!isOwnPost}
                className={cn('relative rounded-full transition-all cursor-pointer disabled:opacity-50',
                  featured ? 'bg-indigo-500' : 'bg-white/10'
                )}
                style={{ width: '40px', height: '22px' }}
              >
                <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm',
                  featured ? 'left-5' : 'left-0.5'
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0d0e14] border border-white/5 rounded-xl">
              <p className="text-white/60 text-sm">Published</p>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                disabled={!isOwnPost}
                className={cn('relative rounded-full transition-all cursor-pointer disabled:opacity-50',
                  isPublished ? 'bg-emerald-500' : 'bg-white/10'
                )}
                style={{ width: '40px', height: '22px' }}
              >
                <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm',
                  isPublished ? 'left-5' : 'left-0.5'
                )} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/5 shrink-0">
          <button onClick={onClose} disabled={isSubmitting}
            className="px-4 py-2 text-sm text-white/40 hover:text-white/70 cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isOwnPost || !title.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 size={13} className="animate-spin" />}
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}