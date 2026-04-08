// sections/PostsPageSection.tsx
//
// FIX: SectionRenderer calls <PostsPageSection lang={lang} /> but the component
// accepted no arguments. Added lang prop to the signature.
// The prop is available for future use (e.g. fetching translated postsPageConfig)
// but the current singleton fetch is language-agnostic.
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

interface Props {
  lang?: string
}

export async function PostsPageSection({ lang: _lang = 'en' }: Props) {
  const config = await sanityClient.fetch<PostsPageConfig | null>(POSTS_PAGE_CONFIG_QUERY)
  return <PostsPageClient config={config ?? {}} />
}