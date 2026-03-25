// ─── app/api/posts/route.ts ───────────────────────────────────────────────────
// Creates a new post + author in Sanity via the Sanity REST API.
// Must be server-side — Sanity write tokens should never be on the client.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const SANITY_DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const SANITY_TOKEN      = process.env.SANITY_API_TOKEN!

async function sanityMutation(mutations: unknown[]) {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${SANITY_DATASET}`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SANITY_TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.description ?? 'Sanity mutation failed')
  }
  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get profile for author details
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .single()

    const body = await request.json()
    const { title, excerpt, tags, featured, publishedAt, coverImageUrl } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    // Check if an author document already exists for this user
    // We search by name to avoid creating duplicates
    const authorSearchUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=*[_type=="author" && name=="${profile?.display_name ?? user.email}"][0]{_id}`
    const authorSearch = await fetch(authorSearchUrl, {
      headers: { Authorization: `Bearer ${SANITY_TOKEN}` }
    })
    const authorData = await authorSearch.json()
    let authorId = authorData?.result?._id

    const mutations: unknown[] = []

    // Create author if doesn't exist
    if (!authorId) {
      authorId = `author-${user.id}`
      mutations.push({
        createOrReplace: {
          _type: 'author',
          _id: authorId,
          name: profile?.display_name ?? user.email ?? 'Anonymous',
          bio: `Contributor on ContentFlow`,
        }
      })
    }

    // Create the post
    const postId = `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const postDocument: Record<string, unknown> = {
      _type: 'post',
      _id: postId,
      title: title.trim(),
      slug: { _type: 'slug', current: slug },
      excerpt: excerpt?.trim() ?? '',
      featured: featured ?? false,
      tags: (tags ?? []).filter(Boolean),
      author: { _type: 'reference', _ref: authorId },
      body: [
        {
          _type: 'block',
          _key: `block-${Date.now()}`,
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: `span-${Date.now()}`,
              text: excerpt ?? '',
              marks: [],
            }
          ],
          markDefs: [],
        }
      ],
    }

    // Add publishedAt if provided
    if (publishedAt) {
      postDocument.publishedAt = new Date(publishedAt).toISOString()
    }

    // Add cover image if URL provided
    if (coverImageUrl) {
      // Upload image to Sanity assets first
      const imageResponse = await fetch(coverImageUrl)
      const imageBuffer = await imageResponse.arrayBuffer()
      const contentType = imageResponse.headers.get('content-type') ?? 'image/png'

      const uploadUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/${SANITY_DATASET}`
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
          'Authorization': `Bearer ${SANITY_TOKEN}`,
        },
        body: imageBuffer,
      })

      if (uploadResponse.ok) {
        const imageAsset = await uploadResponse.json()
        postDocument.coverImage = {
          _type: 'image',
          asset: { _type: 'reference', _ref: imageAsset.document._id }
        }
      }
    }

    mutations.push({ createOrReplace: postDocument })

    await sanityMutation(mutations)

    return NextResponse.json({ success: true, postId, slug })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create post'
    console.error('Post creation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}