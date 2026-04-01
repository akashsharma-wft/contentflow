import Link from 'next/link'
import { sanityClient } from '@/lib/sanity/client'
import { RECENT_POSTS_QUERY } from '@/lib/sanity/queries'
import { format } from 'date-fns'

interface RecentPostsBlockProps {
  block: {
    heading?: string
    subheading?: string
    maxPosts?: number
    layout?: 'grid' | 'list'
    showCoverImage?: boolean
    ctaLabel?: string
    ctaHref?: string
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

export async function RecentPostsBlock({ block }: RecentPostsBlockProps) {
  const { heading = 'Recent Posts', subheading, maxPosts = 6, layout = 'grid', showCoverImage = true, ctaLabel, ctaHref = '/posts' } = block

  const posts: Post[] = await sanityClient.fetch(RECENT_POSTS_QUERY, { limit: maxPosts })
  if (!posts?.length) return null

  return (
    <section className="w-full px-5 lg:px-8 py-16 bg-[#0d0e14]">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h2 className="text-white text-3xl font-bold tracking-tight">{heading}</h2>
            {subheading && <p className="text-white/45 text-base">{subheading}</p>}
          </div>
          {ctaLabel && (
            <Link href={ctaHref} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5">
              {ctaLabel} <span>→</span>
            </Link>
          )}
        </div>
        {layout === 'list' ? (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group flex items-center gap-4 p-4 bg-[#13141c] border border-white/5 rounded-xl hover:border-white/10 transition-all cursor-pointer">
                {showCoverImage && post.coverImage && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white/80 font-medium text-sm group-hover:text-white transition-colors truncate">{post.title}</h3>
                  {post.excerpt && <p className="text-white/35 text-xs mt-0.5 line-clamp-1">{post.excerpt}</p>}
                </div>
                <span className="text-white/25 text-xs font-mono shrink-0">{format(new Date(post.publishedAt), 'MMM dd')}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="group bg-[#13141c] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all cursor-pointer">
                {showCoverImage && (post.coverImage ? (
                  <div className="aspect-video overflow-hidden">
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-white/5 to-white/[0.02]" />
                ))}
                <div className="p-4 space-y-2">
                  <h3 className="text-white/80 font-semibold text-sm leading-snug group-hover:text-white transition-colors line-clamp-2">{post.title}</h3>
                  {post.excerpt && <p className="text-white/35 text-xs leading-relaxed line-clamp-2">{post.excerpt}</p>}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-white/25 text-xs font-mono">{post.authorName ?? 'Anonymous'}</span>
                    <span className="text-white/20 text-xs font-mono">{format(new Date(post.publishedAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
