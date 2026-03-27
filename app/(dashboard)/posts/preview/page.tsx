import { sanityClient } from '@/lib/sanity/client'
import { ALL_POSTS_QUERY } from '@/lib/sanity/queries'
import { LivePreviewClient } from '@/features/posts/components/LivePreviewClient'

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>
}) {
  const { preview } = await searchParams
  const isPreview = preview === 'true'

  // Server-side fetch — use previewDrafts perspective when preview mode is on
  const posts = await sanityClient
    .withConfig({
      perspective: isPreview ? 'previewDrafts' : 'published',
      token: process.env.SANITY_API_TOKEN, // required for draft access
      useCdn: false, // drafts must bypass CDN
    })
    .fetch(ALL_POSTS_QUERY)

  return <LivePreviewClient posts={posts} isPreview={isPreview} />
}