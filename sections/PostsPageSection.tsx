// sections/PostsPageSection.tsx
// Server component — fetches postsPageConfig from Sanity and passes it
// as props to the client component. This is called by SectionRenderer
// when it encounters a 'postsPageSection' block.
import { sanityClient } from '@/lib/sanity/client'
import { POSTS_PAGE_CONFIG_QUERY } from '@/lib/sanity/queries'
import { PostsPageClient } from '@/features/posts/components/PostsPageClient'

export type PostsPageConfig = {
  heading?: string
  subheading?: string
  groqBadgeLabel?: string
  syncButtonLabel?: string
  newPostButtonLabel?: string
  myPostsLabel?: string
  publishedLabel?: string
  draftsLabel?: string
  searchPlaceholder?: string
  colTitle?: string
  colStatus?: string
  colTags?: string
  colLastModified?: string
  emptyTitle?: string
  emptyBody?: string
  emptyCtaLabel?: string
}

export async function PostsPageSection() {
  const config = await sanityClient.fetch<PostsPageConfig | null>(POSTS_PAGE_CONFIG_QUERY)
  return <PostsPageClient config={config ?? {}} />
}