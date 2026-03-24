// All GROQ queries live here — never write inline queries in components.
// Import these constants wherever you need to fetch Sanity data.
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
    author->{ name, "avatar": image.asset->url },
    "coverImage": coverImage.asset->url
  }
`

export const POST_BY_SLUG_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
    ...,
    author->{ name, bio, "avatar": image.asset->url },
    "coverImage": coverImage.asset->url
  }
`