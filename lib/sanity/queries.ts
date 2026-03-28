import { groq } from 'next-sanity'

// Main posts list — PUBLISHED ONLY + own drafts
// Regular users see all published + their own drafts
export const ALL_POSTS_QUERY = groq`
  *[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    featured,
    tags,
    authorId,
    authorName,
    authorEmail,
    authorAvatar,
    "coverImage": coverImage.asset->url
  }
`

// Posts for a specific user — includes their own drafts
export const MY_POSTS_QUERY = groq`
  *[_type == "post" && authorId == $userId] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    featured,
    tags,
    authorId,
    authorName,
    authorEmail,
    authorAvatar,
    "coverImage": coverImage.asset->url
  }
`

// Single post — published only (for public detail page)
export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug && defined(publishedAt)][0] {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    body,
    publishedAt,
    featured,
    tags,
    authorId,
    authorName,
    authorEmail,
    authorAvatar,
    "coverImage": coverImage.asset->url
  }
`

// Preview query — all posts including drafts (server-side only)
export const ALL_POSTS_PREVIEW_QUERY = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    featured,
    tags,
    authorId,
    authorName,
    authorAvatar,
    "coverImage": coverImage.asset->url
  }
`

// Own stats
export const MY_POSTS_COUNT_QUERY = groq`
  {
    "total": count(*[_type == "post" && authorId == $userId]),
    "published": count(*[_type == "post" && authorId == $userId && defined(publishedAt)])
  }
`