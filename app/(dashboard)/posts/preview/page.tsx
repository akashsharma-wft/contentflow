import { createClient as createServerClient } from '@/lib/supabase/server'
import { sanityClient } from '@/lib/sanity/client'
import { LivePreviewClient } from '@/features/posts/components/LivePreviewClient'
import { redirect } from 'next/navigation'
import { groq } from 'next-sanity'

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>
}) {
  const { preview } = await searchParams
  const isPreview = preview === 'true'

  // Get current user for ownership filtering
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let posts
  if (isPreview) {
    // Preview mode: show all published + only THIS user's drafts
    posts = await sanityClient
      .withConfig({
        perspective: 'previewDrafts',
        token: process.env.SANITY_API_TOKEN,
        useCdn: false,
      })
      .fetch(groq`
        *[_type == "post" && (defined(publishedAt) || authorId == $userId)]
        | order(publishedAt desc) {
          _id, title, "slug": slug.current, excerpt, publishedAt,
          featured, tags, authorId, authorName,
          "coverImage": coverImage.asset->url
        }
      `, { userId: user.id })
  } else {
    // Non-preview: published only
    posts = await sanityClient.fetch(groq`
      *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
        _id, title, "slug": slug.current, excerpt, publishedAt,
        featured, tags, authorId, authorName,
        "coverImage": coverImage.asset->url
      }
    `)
  }

  return <LivePreviewClient posts={posts} isPreview={isPreview} userId={user.id} />
}