import { getSanityClient } from '@/lib/sanity/server-client'
import { RECENT_POSTS_QUERY } from '@/lib/sanity/queries'
import { PostFilterGrid } from '@/components/PostFilterGrid'
import type { RecentPostsSection as RecentPostsSectionType, SanityPostCard } from '@/types/sanity'

interface Props {
  section: RecentPostsSectionType
  lang?: string
}

export async function RecentPostsSection({ section, lang = 'en' }: Props) {
  const {
    heading = 'Recent Publications',
    subheading,
    count = 12,
    viewAllLabel = 'View all posts',
  } = section

  const client = await getSanityClient()
  // Fetch more posts than initially shown so filter tabs + load more work without a refetch
  const posts: SanityPostCard[] = await client.fetch(RECENT_POSTS_QUERY, { lang, limit: Math.max(count, 24) })

  if (posts.length === 0) return null

  return (
    <section className="w-full px-4 sm:px-6 py-14 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight relative inline-block">
          {heading}
          <span className="absolute -bottom-1.5 left-0 w-10 h-0.5 bg-indigo-500 rounded-full" />
        </h2>
        {subheading && <p className="text-white/40 text-sm mt-3">{subheading}</p>}
      </div>

      {/* Client component handles filter tabs + load more */}
      <PostFilterGrid posts={posts} lang={lang} viewAllLabel={viewAllLabel} />
    </section>
  )
}
