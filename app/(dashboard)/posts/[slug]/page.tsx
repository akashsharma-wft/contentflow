import { sanityClient } from '@/lib/sanity/client'
import { POST_BY_SLUG_QUERY, ALL_POSTS_QUERY } from '@/lib/sanity/queries'
import { PostDetail } from '@/features/posts/components/PostDetail'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const post = await sanityClient.fetch(POST_BY_SLUG_QUERY, { slug })
  return {
    title: post?.title ? `${post.title} — ContentFlow` : 'Post — ContentFlow',
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { slug } = await params

  // Fetch the current post AND all posts to find prev/next slugs
  const [post, allPosts] = await Promise.all([
    sanityClient.fetch(POST_BY_SLUG_QUERY, { slug }),
    sanityClient.fetch(ALL_POSTS_QUERY),
  ])

  if (!post) notFound()

  // Find position in all posts to get prev/next
  const currentIndex = allPosts.findIndex(
    (p: { slug: string }) => p.slug === slug
  )
  const prevSlug = currentIndex > 0
    ? allPosts[currentIndex - 1]?.slug
    : null
  const nextSlug = currentIndex < allPosts.length - 1
    ? allPosts[currentIndex + 1]?.slug
    : null

  return <PostDetail post={post} prevSlug={prevSlug} nextSlug={nextSlug} />
}