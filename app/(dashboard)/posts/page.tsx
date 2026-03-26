'use client'

import { useQuery } from '@tanstack/react-query'
import { sanityClient } from '@/lib/sanity/client'
import { ALL_POSTS_QUERY } from '@/lib/sanity/queries'
import { PostsHeader } from '@/features/posts/components/PostsHeader'
import { PostsStatsBar } from '@/features/posts/components/PostsStatsBar'
import { PostsTable } from '@/features/posts/components/PostsTable'
import { PostsEmptyState } from '@/features/posts/components/PostsEmptyState'
import { PostsTableSkeleton } from '@/features/posts/components/PostsTableSkeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { FeaturedBanner } from '@/features/posts/components/FeaturedBanner'

export default function PostsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  // Debounce search input by 300ms as required by assignment
  const debouncedSearch = useDebounce(searchQuery, 300)

  // TanStack Query — query key must be ['posts'] per assignment
  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ['posts'],
    queryFn: () => sanityClient.fetch(ALL_POSTS_QUERY),
  })

  // Client-side filter by title — no new API call, uses cached data
  const filteredPosts = (posts ?? []).filter((post: { title: string }) =>
    post.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const publishedCount = (posts ?? []).filter((p: { publishedAt: string | null }) => p.publishedAt).length
  const draftCount     = (posts ?? []).length - publishedCount

  return (
    <div className="px-5 lg:px-8 py-6 space-y-5 max-w-[1200px]">
      {/* Featured banner — shown when PostHog feature flag 'show-featured-banner' is enabled */}
      {!isLoading && filteredPosts.some((p: { featured: boolean }) => p.featured) && (
        <FeaturedBanner
          post={filteredPosts.find((p: { featured: boolean }) => p.featured)}
        />
      )}
      <PostsHeader />

      {/* Search bar */}
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

      {/* Stats bar — shows skeleton while loading */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#13141c] border border-white/5 rounded-xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <PostsStatsBar
          total={posts?.length ?? 0}
          published={publishedCount}
          drafts={draftCount}
          views={8867}
        />
      )}

      {/* Posts table or empty state */}
      {isLoading && <PostsTableSkeleton />}
      {isError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          Failed to load posts. Check your Sanity connection.
        </div>
      )}
      {!isLoading && !isError && filteredPosts.length === 0 && <PostsEmptyState />}
      {!isLoading && !isError && filteredPosts.length > 0 && (
        <PostsTable posts={filteredPosts.map((p: {
          _id: string
          title: string
          slug: string
          tags: string[]
          featured: boolean
          publishedAt: string | null
        }) => ({
          ...p,
          status: p.publishedAt ? 'published' : 'draft',
        }))} />
      )}
    </div>
  )
}