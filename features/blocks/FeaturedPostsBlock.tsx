import Link from 'next/link'
import { sanityClient } from '@/lib/sanity/client'
import { FEATURED_POSTS_QUERY } from '@/lib/sanity/queries'
import { format } from 'date-fns'

interface FeaturedPostsBlockProps {
  block: {
    heading?: string
    subheading?: string
    maxPosts?: number
    showExcerpt?: boolean
    showTags?: boolean
    ctaLabel?: string
  }
}

interface Post {
  _id: string
  title: string
  slug: string
  excerpt?: string
  publishedAt: string
  tags?: string[]
  authorName?: string
  coverImage?: string
}

export async function FeaturedPostsBlock({ block }: FeaturedPostsBlockProps) {
  const { heading = 'Featured Posts', subheading, maxPosts = 3, showExcerpt = true, showTags = true, ctaLabel } = block

  const posts: Post[] = await sanityClient.fetch(FEATURED_POSTS_QUERY, { limit: maxPosts })
  if (!posts?.length) return null

  return (
    <section className="w-full px-5 lg:px-8 py-16 bg-[#0d0e14]">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="space-y-2">
          <h2 className="text-white text-3xl font-bold tracking-tight">{heading}</h2>
          {subheading && <p className="text-white/45 text-base">{subheading}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <Link key={post._id} href={`/posts/${post.slug}`} className="group bg-[#13141c] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all cursor-pointer">
              {post.coverImage ? (
                <div className="aspect-video overflow-hidden">
                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center">
                  <span className="text-white/10 text-4xl font-bold">CF</span>
                </div>
              )}
              <div className="p-5 space-y-3">
                {showTags && post.tags?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] uppercase tracking-wider rounded font-mono">{tag}</span>
                    ))}
                  </div>
                ) : null}
                <h3 className="text-white font-semibold text-base leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2">{post.title}</h3>
                {showExcerpt && post.excerpt && (
                  <p className="text-white/45 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-white/30 text-xs font-mono">{post.authorName ?? 'Anonymous'}</span>
                  <span className="text-white/25 text-xs font-mono">{format(new Date(post.publishedAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {ctaLabel && (
          <div className="flex justify-center">
            <Link href="/posts" className="px-5 py-2.5 border border-white/15 text-white/60 hover:text-white hover:border-white/30 text-sm font-medium rounded-xl transition-all cursor-pointer">{ctaLabel}</Link>
          </div>
        )}
      </div>
    </section>
  )
}
