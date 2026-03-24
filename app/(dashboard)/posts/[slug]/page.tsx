// ─── app/(dashboard)/posts/[slug]/page.tsx ───────────────────────────────────
// Server Component — fetches single post directly from Sanity on the server.
// No TanStack Query here — this is intentional and matches the assignment requirement.

import { sanityClient } from '@/lib/sanity/client'
import { POST_BY_SLUG_QUERY } from '@/lib/sanity/queries'
import { PostDetail } from '@/features/posts/components/PostDetail'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Generate metadata from the post title
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const post = await sanityClient.fetch(POST_BY_SLUG_QUERY, { slug })
  return { title: post?.title ? `${post.title} — ContentFlow` : 'Post — ContentFlow' }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params
  const post = await sanityClient.fetch(POST_BY_SLUG_QUERY, { slug })

  // Show 404 if post doesn't exist
  if (!post) notFound()

  return <PostDetail post={post} />
}