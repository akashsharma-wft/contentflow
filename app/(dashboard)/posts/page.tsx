'use client'

import { useQuery } from '@tanstack/react-query'
import { sanityClient } from '@/lib/sanity/client'
import { ALL_POSTS_QUERY } from '@/lib/sanity/queries'
import { PostsHeader } from '@/features/posts/components/PostsHeader'
import { PostsStatsBar } from '@/features/posts/components/PostsStatsBar'
import { PostsTable } from '@/features/posts/components/PostsTable'
import { PostsEmptyState } from '@/features/posts/components/PostsEmptyState'
import { PostsTableSkeleton } from '@/features/posts/components/PostsTableSkeleton'
import { FeaturedBanner } from '@/features/posts/components/FeaturedBanner'
import { useDebounce } from '@/hooks/useDebounce'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { useUser } from '@/hooks/useUser'
import { groq } from 'next-sanity'

export default function PostsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSyncing, setIsSyncing]     = useState(false)
  const debouncedSearch               = useDebounce(searchQuery, 300)

  // Replace the useQuery in posts/page.tsx:
  const { user } = useUser()

  const { data: posts, isLoading, isError, refetch } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      // Fetch published posts + current user's own drafts
      return sanityClient.fetch(groq`
        *[_type == "post" && (defined(publishedAt) || authorId == $userId)]
        | order(publishedAt desc) {
          _id, title, "slug": slug.current, excerpt, publishedAt,
          featured, tags, authorId, authorName, authorAvatar,
          "coverImage": coverImage.asset->url
        }
      `, { userId: user.id })
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

  const allPosts       = posts ?? []
  const filteredPosts  = allPosts.filter((post: { title: string }) =>
    post.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  )
  const publishedCount = allPosts.filter((p: { publishedAt: string | null }) => !!p.publishedAt).length
  const draftCount     = allPosts.length - publishedCount
  const featuredPosts = allPosts.filter(
    (p: { featured: boolean; publishedAt: string | null }) =>
      p.featured && !!p.publishedAt
  )

  return (
    <div className="py-6 space-y-5">
      {featuredPosts.length > 0 && (
        <FeaturedBanner posts={featuredPosts} />
      )}

      <PostsHeader onSync={handleSync} isSyncing={isSyncing} />

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

      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#13141c] border border-white/5 rounded-xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <PostsStatsBar
          total={allPosts.length}
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

      {!isLoading && !isError && filteredPosts.length === 0 && <PostsEmptyState />}

      {!isLoading && !isError && filteredPosts.length > 0 && (
        <PostsTable
          posts={filteredPosts.map((p: {
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