import { groq } from 'next-sanity'

export const ALL_POSTS_QUERY = groq`
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
    authorEmail,
    authorAvatar,
    "coverImage": coverImage.asset->url
  }
`

export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
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

export const MY_POSTS_COUNT_QUERY = groq`
  {
    "total": count(*[_type == "post" && authorId == $userId]),
    "published": count(*[_type == "post" && authorId == $userId && defined(publishedAt)])
  }
`