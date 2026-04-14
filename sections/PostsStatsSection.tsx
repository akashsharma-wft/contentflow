// sections/PostsStatsSection.tsx
//
// Derives stats (My Posts / Published / Drafts) from its own dedicated cache entry.
//
// Query key: ['posts', 'stats', lang]
//   Deliberately DIFFERENT from PostsTableSection (['posts', 'all', lang]).
//   Sharing a key between two components with different projections caused the
//   stats queryFn (which only fetches _id/authorId/publishedAt) to win the
//   initial-load race and poison the table cache with incomplete data.
//
// Invalidation: use queryKey prefix ['posts'] to hit both 'all' and 'stats' at once.

'use client'

import { useQuery } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'
import { sanityFreshClient } from '@/lib/sanity/client'
import { groq } from 'next-sanity'
import { useUser } from '@/hooks/useUser'
import { PostsStatsBar } from '@/features/posts/components/PostsStatsBar'
import { Skeleton } from '@/components/ui/skeleton'
import type { SectionPostsStatsContent } from '@/types/sanity'

interface Props {
  content: SectionPostsStatsContent
  lang?: string
}

interface PostMeta {
  _id: string
  authorId?: string
  publishedAt: string | null
}

const STATS_QUERY = groq`
  *[_type == "post"
    && !(_id in path("drafts.**"))
    && (language == $lang || (!defined(language) && $lang == "en"))]
  | order(publishedAt desc, _createdAt desc) {
    _id, authorId, publishedAt
  }
`

export function PostsStatsSection({ content, lang = 'en' }: Props) {
  const { user, isLoading: authLoading } = useUser()

  const { data: posts = [], isLoading } = useQuery<PostMeta[]>({
    queryKey: ['posts', 'stats', lang],
    queryFn: () => sanityFreshClient.fetch<PostMeta[]>(STATS_QUERY, { lang }),
    enabled: !!user?.id,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  })

  if (authLoading || isLoading) {
    return (
      <div className="mb-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    )
  }

  const myPosts   = posts.filter((p) => p.authorId === user?.id)
  const published = myPosts.filter((p) => !!p.publishedAt).length
  const drafts    = myPosts.filter((p) => !p.publishedAt).length

  return (
    <div className="mb-5">
      <PostsStatsBar
        total={myPosts.length}
        published={published}
        drafts={drafts}
        myPostsLabel={content.myPostsLabel}
        publishedLabel={content.publishedLabel}
        draftsLabel={content.draftsLabel}
      />
    </div>
  )
}
