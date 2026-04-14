'use client'

import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/hooks/useUser'
import { X, Loader2, Star, Lock, Upload, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { usePostHog } from 'posthog-js/react'

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
    authorId?: string
    coverImage?: string
  } | null
  currentUserId: string
  /** The React Query key that owns this data — used to invalidate after save. */
  queryKey: string[]
}

export function EditPostModal({ open, onClose, post, currentUserId, queryKey }: EditPostModalProps) {
  const queryClient = useQueryClient()
  const posthog = usePostHog()
  const { user } = useUser()
  const coverImageRef = useRef<HTMLInputElement>(null)

  const [title, setTitle]             = useState('')
  const [excerpt, setExcerpt]         = useState('')
  const [tags, setTags]               = useState<string[]>([])
  const [featured, setFeatured]       = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput]       = useState('')

  // Image state
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile]       = useState<File | null>(null)
  const [removeCover, setRemoveCover]   = useState(false)

  const isOwnPost = post?.authorId === currentUserId

  useEffect(() => {
    if (post) {
      setTitle(post.title ?? '')
      setExcerpt(post.excerpt ?? '')
      setTags(post.tags ?? [])
      setFeatured(post.featured)
      setIsPublished(!!post.publishedAt)
      // Restore existing cover into preview
      setCoverPreview(post.coverImage ?? null)
      setCoverFile(null)
      setRemoveCover(false)
    }
  }, [post])

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image')
      return
    }
    setCoverFile(file)
    setRemoveCover(false)
    const reader = new FileReader()
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleRemoveCover() {
    setCoverFile(null)
    setCoverPreview(null)
    setRemoveCover(true)
    if (coverImageRef.current) coverImageRef.current.value = ''
  }

  async function handleSubmit() {
    if (!post || !title.trim()) return
    setIsSubmitting(true)

    try {
      let coverImageUrl: string | undefined

      // Upload new cover image via Supabase Storage (same flow as CreatePostModal)
      if (coverFile) {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          const ext = coverFile.name.split('.').pop() ?? 'jpg'
          const path = `covers/${authUser.id}-${Date.now()}.${ext}`
          const { error } = await supabase.storage
            .from('contentflow')
            .upload(path, coverFile, { upsert: true })

          if (!error) {
            const { data: { publicUrl } } = supabase.storage
              .from('contentflow')
              .getPublicUrl(path)
            coverImageUrl = publicUrl
          }
        }
      }

      const body: Record<string, unknown> = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        tags,
        featured,
        publishedAt: isPublished ? (post.publishedAt ?? new Date().toISOString()) : null,
      }

      if (coverImageUrl) {
        body.coverImageUrl = coverImageUrl
      } else if (removeCover) {
        body.removeCoverImage = true
      }

      const response = await fetch(`/api/posts/${post._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Failed to update post')

      // ['posts'] prefix hits both ['posts','all',lang] and ['posts','stats',lang].
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post updated')
      posthog?.capture('post_edited', { post_id: post._id, title: title.trim() })
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open || !post) return null

  // Determine what image state to show:
  // - coverPreview !== null → show preview (either existing or newly selected)
  // - coverPreview === null → show empty placeholder
  const showingExistingImage = coverPreview === post.coverImage && !coverFile && !removeCover

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) onClose() }}
    >
      <div className="w-full max-w-2xl bg-[#13141c] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-white text-sm font-semibold">Edit Post</h2>
            <p className="text-white/30 text-[10px] font-mono">{post._id}</p>
          </div>
          <button onClick={onClose} disabled={isSubmitting}
            className="text-white/30 hover:text-white/70 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {!isOwnPost && (
          <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <Lock size={13} className="text-amber-400 shrink-0" />
            <p className="text-amber-300 text-xs">
              You can only edit posts you created. This post belongs to another author.
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] divide-y lg:divide-y-0 lg:divide-x divide-white/5">

            {/* Left — main fields */}
            <div className="p-5 space-y-4">
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

              <div className="space-y-1.5">
                <Label className="text-white/40 text-[10px] uppercase tracking-widest">Tags</Label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#0d0e14] border border-white/10 rounded-xl min-h-[42px]">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs rounded-md">
                      {tag}
                      <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}
                        disabled={!isOwnPost} className="text-indigo-400 hover:text-white cursor-pointer">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        const t = tagInput.trim()
                        if (t && !tags.includes(t)) setTags([...tags, t])
                        setTagInput('')
                      }
                    }}
                    disabled={!isOwnPost}
                    placeholder={tags.length === 0 ? 'Add tags...' : ''}
                    className="flex-1 min-w-[80px] bg-transparent outline-none text-white/70 text-xs placeholder:text-white/20 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Right — toggles + cover image */}
            <div className="p-5 space-y-4">
              {/* Featured */}
              <div className="flex items-center justify-between p-3 bg-[#0d0e14] border border-white/5 rounded-xl">
                <p className="text-white/60 text-sm flex items-center gap-1.5">
                  <Star size={12} className={featured ? 'text-amber-400 fill-amber-400' : 'text-white/30'} />
                  Featured
                </p>
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

              {/* Published */}
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

              {/* Cover Image */}
              <div className="space-y-1.5">
                <Label className="text-white/40 text-[10px] uppercase tracking-widest">Cover Image</Label>

                <div
                  onClick={() => isOwnPost && coverImageRef.current?.click()}
                  className={cn(
                    'relative aspect-video rounded-xl border-2 border-dashed overflow-hidden',
                    isOwnPost ? 'cursor-pointer' : 'cursor-not-allowed opacity-60',
                    coverPreview ? 'border-indigo-500/30' : 'border-white/10 hover:border-white/20',
                  )}
                >
                  {coverPreview ? (
                    <>
                      <Image
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                        height={200}
                        width={280}
                        unoptimized={coverPreview.startsWith('data:')}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-xs font-medium">Change Image</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 py-6">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        {isOwnPost ? (
                          <Upload size={14} className="text-white/30" />
                        ) : (
                          <ImageIcon size={14} className="text-white/20" />
                        )}
                      </div>
                      <p className="text-white/30 text-xs text-center">
                        {isOwnPost ? 'Click to upload' : 'No cover image'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Remove button — shown only when there's a current image */}
                {coverPreview && isOwnPost && (
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="text-white/30 hover:text-red-400 text-[10px] transition-colors cursor-pointer"
                  >
                    {showingExistingImage ? 'Remove current image' : 'Cancel new image'}
                  </button>
                )}

                <input
                  ref={coverImageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
