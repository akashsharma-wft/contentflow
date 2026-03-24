'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { PortableText } from '@portabletext/react'
import { ArrowLeft, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import posthog from 'posthog-js'

interface PostDetailProps {
  post: {
    _id: string
    title: string
    slug: string
    body: unknown[]
    tags: string[]
    featured: boolean
    publishedAt: string | null
    coverImage: string | null
    author: { name: string; avatar: string | null } | null
  }
}

// Custom components for rendering Sanity Portable Text
// Handles images and code blocks with proper styling
const portableTextComponents = {
  types: {
    image: ({ value }: { value: { asset: { url: string }; alt?: string; caption?: string } }) => (
      <figure className="my-6">
        <img
          src={value.asset?.url}
          alt={value.alt ?? ''}
          className="w-full rounded-xl border border-white/5"
        />
        {value.caption && (
          <figcaption className="text-center text-white/30 text-xs mt-2 font-mono">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
    code: ({ value }: { value: { code: string; language?: string; filename?: string } }) => (
      <div className="my-4 rounded-xl overflow-hidden border border-white/10">
        {value.filename && (
          <div className="flex items-center px-4 py-2 bg-white/5 border-b border-white/5">
            <span className="text-white/30 text-[10px] font-mono uppercase tracking-widest">
              {value.filename}
            </span>
          </div>
        )}
        <pre className="p-4 bg-[#0d0e14] overflow-x-auto">
          <code className="text-white/70 text-sm font-mono leading-relaxed">
            {value.code}
          </code>
        </pre>
      </div>
    ),
  },
  block: {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-white text-2xl font-bold mt-8 mb-4">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-white text-xl font-bold mt-6 mb-3">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-white text-lg font-semibold mt-5 mb-2">{children}</h3>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-white/60 text-sm leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-2 border-indigo-500 pl-4 my-4 text-white/40 text-sm italic">
        {children}
      </blockquote>
    ),
  },
  marks: {
    code: ({ children }: { children?: React.ReactNode }) => (
      <code className="bg-white/5 border border-white/10 text-indigo-300 text-xs font-mono px-1.5 py-0.5 rounded">
        {children}
      </code>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="text-white font-semibold">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="text-white/70 italic">{children}</em>
    ),
  },
}

export function PostDetail({ post }: PostDetailProps) {
  // Track post_viewed event in PostHog — required by assignment
  useEffect(() => {
    posthog.capture('post_viewed', {
      post_slug: post.slug,
      post_title: post.title,
    })
  }, [post.slug, post.title])

  const authorInitials = post.author?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'AU'

  return (
    <div className="max-w-[680px] mx-auto px-5 lg:px-8 py-8">

      {/* Back link — matches Figma "← Back to Posts" */}
      <Link
        href="/dashboard/posts"
        className="inline-flex items-center gap-2 text-white/35 hover:text-white/70 text-sm mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Posts
      </Link>

      {/* Tags row */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-white/50 text-[10px] uppercase tracking-widest font-mono rounded"
            >
              {tag}
            </span>
          ))}
          {post.featured && (
            <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] uppercase tracking-widest font-mono rounded">
              Featured
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h1 className="text-white text-2xl lg:text-3xl font-bold tracking-tight leading-tight mb-4">
        {post.title}
      </h1>

      {/* Author + meta row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          {/* Author avatar */}
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {post.author?.avatar
              ? <img src={post.author.avatar} alt={post.author.name} className="w-full h-full rounded-full object-cover" />
              : authorInitials
            }
          </div>
          <div>
            <p className="text-white/70 text-sm font-medium">{post.author?.name ?? 'Unknown'}</p>
            <p className="text-white/30 text-xs">
              {post.publishedAt
                ? format(new Date(post.publishedAt), 'MMM dd, yyyy')
                : 'Unpublished'}
              {' · '}
              <span className="text-white/20">2,841 views</span>
            </p>
          </div>
        </div>
      </div>

      {/* Cover image */}
      {post.coverImage && (
        <div className="mb-6 rounded-xl overflow-hidden border border-white/5 aspect-video bg-gradient-to-br from-indigo-500/20 to-teal-500/20">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Body content */}
      <article className="prose prose-invert max-w-none">
        {post.body ? (
          <PortableText value={post.body as Parameters<typeof PortableText>[0]['value']} components={portableTextComponents} />
        ) : (
          <p className="text-white/30 text-sm italic">No content yet.</p>
        )}
      </article>

      {/* Bottom navigation — matches Figma back/share/next */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-white/5">
        <Link
          href="/dashboard/posts"
          className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-white/50 hover:text-white text-sm rounded-lg transition-all cursor-pointer"
        >
          <ChevronLeft size={14} />
          Back
        </Link>

        <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-white/50 hover:text-white text-sm rounded-lg transition-all cursor-pointer">
          <Share2 size={14} />
          Share
        </button>

        <button className="flex items-center gap-2 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">
          Next
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Edit in Sanity Studio link */}
      <div className="flex justify-start pt-4">
        <a
          href={`http://localhost:3333/studio/desk/post;${post._id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/20 hover:text-indigo-400 text-[11px] font-mono uppercase tracking-widest transition-colors cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Edit in Sanity Studio →
        </a>
      </div>
    </div>
  )
}