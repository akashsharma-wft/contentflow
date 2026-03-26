'use client'

import Link from 'next/link'
import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import { Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

interface FeaturedPost {
  _id: string
  title: string
  slug: string
  excerpt?: string
  tags?: string[]
}

interface FeaturedBannerProps {
  posts: FeaturedPost[]  // all featured posts, not just one
}

export function FeaturedBanner({ posts }: FeaturedBannerProps) {
  const posthog = usePostHog()
  const [show, setShow] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    let mounted = true
    const checkFlag = () => {
      if (!posthog || !mounted) return
      const enabled = posthog.isFeatureEnabled('show-featured-banner')
      if (mounted) setShow(enabled ?? false)
    }

    // PostHog may not be ready immediately
    checkFlag()
    const timer = setTimeout(checkFlag, 1000)
    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [posthog])

  if (!show || posts.length === 0) return null

  const post = posts[currentIndex]

  return (
    <div className="bg-indigo-500/10 border border-indigo-500/25 rounded-xl p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Star size={14} className="text-indigo-400 fill-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="text-indigo-300 text-[10px] uppercase tracking-widest font-medium mb-0.5">
              Featured Post {posts.length > 1 ? `(${currentIndex + 1} of ${posts.length})` : ''}
            </p>
            <p className="text-white text-sm font-semibold truncate">{post.title}</p>
            {post.excerpt && (
              <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{post.excerpt}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Prev/Next if multiple featured posts */}
          {posts.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex((i) => (i - 1 + posts.length) % posts.length)}
                className="p-1.5 text-white/30 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentIndex((i) => (i + 1) % posts.length)}
                className="p-1.5 text-white/30 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </>
          )}
          <Link
            href={`/posts/${post.slug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Read now
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}