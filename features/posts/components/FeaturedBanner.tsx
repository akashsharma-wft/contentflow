// ─── features/posts/components/FeaturedBanner.tsx ────────────────────────────
// Bonus B3 — shown when PostHog feature flag 'show-featured-banner' is enabled.
// The flag is evaluated server-side in the analytics page and client-side here.
'use client'

import Link from 'next/link'
import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import { Star, ArrowRight } from 'lucide-react'

interface FeaturedBannerProps {
  post: {
    _id: string
    title: string
    slug: string
    excerpt?: string
    tags?: string[]
  } | undefined
}

export function FeaturedBanner({ post }: FeaturedBannerProps) {
  const posthog = usePostHog()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check feature flag client-side
    if (posthog) {
      const enabled = posthog.isFeatureEnabled('show-featured-banner')
      setShow(enabled ?? false)
    }
  }, [posthog])

  if (!show || !post) return null

  return (
    <div className="bg-indigo-500/10 border border-indigo-500/25 rounded-xl p-4 flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Star size={14} className="text-indigo-400 fill-indigo-400" />
        </div>
        <div>
          <p className="text-indigo-300 text-[10px] uppercase tracking-widest font-medium mb-0.5">
            Featured Post
          </p>
          <p className="text-white text-sm font-semibold">{post.title}</p>
          {post.excerpt && (
            <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{post.excerpt}</p>
          )}
        </div>
      </div>
      <Link
        href={`/posts/${post.slug}`}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
      >
        Read now
        <ArrowRight size={12} />
      </Link>
    </div>
  )
}