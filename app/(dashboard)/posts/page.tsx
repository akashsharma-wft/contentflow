'use client'

import { useQuery } from '@tanstack/react-query'
import { sanityClient } from '@/lib/sanity/client'
import { PostsHeader } from '@/features/posts/components/PostsHeader'
import { PostsStatsBar } from '@/features/posts/components/PostsStatsBar'
import { PostsTable } from '@/features/posts/components/PostsTable'
import { PostsEmptyState } from '@/features/posts/components/PostsEmptyState'
import { PostsTableSkeleton } from '@/features/posts/components/PostsTableSkeleton'
import { FeaturedBanner } from '@/features/posts/components/FeaturedBanner'
import { useDebounce } from '@/hooks/useDebounce'
import { useUser } from '@/hooks/useUser'
import { useState } from 'react'
import { Search, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { groq } from 'next-sanity'
import { cn } from '@/lib/utils'

export default function PostsPage() {
  const { user }          = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSyncing, setIsSyncing]     = useState(false)
  const [showDrafts, setShowDrafts]   = useState(false) // inline preview toggle
  const debouncedSearch               = useDebounce(searchQuery, 300)

  // Fetch ALL posts once (published + own drafts) — filter in frontend
  // This single query powers both normal and preview mode
  const { data: allFetchedPosts, isLoading, isError, refetch } = useQuery({
    queryKey: ['posts-all', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      return sanityClient.fetch(groq`
        *[_type == "post"] | order(publishedAt desc, _createdAt desc) {
          _id,
          title,
          "slug": slug.current,
          excerpt,
          publishedAt,
          featured,
          tags,
          authorId,
          authorName,
          authorEmail,
          authorAvatar,
          "coverImage": coverImage.asset->url
        }
      `)
    },
    enabled: !!user?.id,
    staleTime: 0,
  })

  async function handleSync() {
    setIsSyncing(true)
    try {
      await refetch()
      toast.success('Synced from Sanity')
    } catch {
      toast.error('Sync failed')
    } finally {
      setIsSyncing(false)
    }
  }

  const rawPosts = allFetchedPosts ?? []

  // Own drafts count — used to conditionally show the preview toggle button
  const myDrafts = rawPosts.filter(
    (p: { publishedAt: string | null; authorId?: string }) =>
      !p.publishedAt && p.authorId === user?.id
  )

  // Visibility rule:
  // Normal mode  → published only (all users' published)
  // Preview mode → published + current user's own drafts
  const visiblePosts = rawPosts.filter(
    (p: { publishedAt: string | null; authorId?: string }) => {
      if (p.publishedAt) return true
      if (showDrafts && p.authorId === user?.id) return true
      return false
    }
  )

  const searchFiltered = visiblePosts.filter((p: { title: string }) =>
    p.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const publishedCount = rawPosts.filter((p: { publishedAt: string | null }) => !!p.publishedAt).length
  const draftCount     = myDrafts.length
  const myPostsCount   = myDrafts.length + publishedCount

  const featuredPosts = visiblePosts.filter(
    (p: { featured: boolean; publishedAt: string | null }) =>
      p.featured && !!p.publishedAt
  )

  return (
    <div className="py-6 space-y-5">
      {/* Featured banner — only published featured posts */}
      {featuredPosts.length > 0 && (
        <FeaturedBanner posts={featuredPosts} />
      )}

      {/* Preview mode banner */}
      {showDrafts && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <p className="text-amber-300 text-sm flex-1">
            <span className="font-semibold">Draft preview active</span>
            {' '}— showing your {draftCount} unpublished draft{draftCount !== 1 ? 's' : ''} alongside published posts.
          </p>
          <button
            onClick={() => setShowDrafts(false)}
            className="text-amber-400 hover:text-amber-200 text-xs font-medium cursor-pointer transition-colors shrink-0"
          >
            Exit preview
          </button>
        </div>
      )}

      {/* Header row — inline preview toggle replaces separate preview page */}
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

        <div className="flex items-center gap-5 shrink-0 flex-wrap">
          {/* Preview toggle — only shown when user has own drafts */}
          {draftCount > 0 && (
            <button
              onClick={() => setShowDrafts(!showDrafts)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all cursor-pointer border',
                showDrafts
                  ? 'bg-amber-500/15 border-amber-500/25 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:bg-white/8'
              )}
            >
              {showDrafts ? <EyeOff size={13} /> : <Eye size={13} />}
              {showDrafts ? `Drafts on (${draftCount})` : `Drafts (${draftCount})`}
            </button>
          )}

          <PostsHeader onSync={handleSync} isSyncing={isSyncing} />
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[#13141c] border border-white/10 rounded-xl text-white/70 text-sm placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"
        />
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#13141c] border border-white/5 rounded-xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <PostsStatsBar
          total={myPostsCount}
          published={publishedCount}
          drafts={draftCount}
        />
      )}

      {isLoading && <PostsTableSkeleton />}

      {isError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          Failed to load posts. Check your Sanity connection.
        </div>
      )}

      {!isLoading && !isError && searchFiltered.length === 0 && <PostsEmptyState />}

      {!isLoading && !isError && searchFiltered.length > 0 && (
        <PostsTable
          userId={user?.id ?? ''}   // ← add this
          posts={searchFiltered.map((p: {
            _id: string
            title: string
            slug: string
            tags: string[] | null
            featured: boolean
            publishedAt: string | null
            authorId?: string
            authorName?: string
          }) => ({
            ...p,
            tags: p.tags ?? [],
            status: p.publishedAt ? ('published' as const) : ('draft' as const),
          }))}
        />
      )}
    </div>
  )
}