// ─── app/api/posts/route.ts ───────────────────────────────────────────────────
// Creates a new post + author in Sanity via the Sanity REST API.
// Includes plan-based limits (Free vs Pro)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const SANITY_TOKEN = process.env.SANITY_API_TOKEN!

async function sanityMutation(mutations: unknown[]) {
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${SANITY_DATASET}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SANITY_TOKEN}`,
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
    // ─── Auth ────────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ─── Fetch Profile (single query for everything) ─────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, subscription_tier')
      .eq('id', user.id)
      .single()

    const authorRefId = `author-${user.id}`

    // ─── Plan Limit Check (Sanity count query) ───────────────────────────────
    const countUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=count(*[_type=="post" && author._ref=="${authorRefId}"])`

    const countResponse = await fetch(countUrl, {
      headers: { Authorization: `Bearer ${SANITY_TOKEN}` },
    })

    const countData = await countResponse.json()
    const currentCount = countData?.result ?? 0

    const postLimit =
      profile?.subscription_tier === 'pro'
        ? Number.MAX_SAFE_INTEGER
        : 5

    if (currentCount >= postLimit) {
      return NextResponse.json(
        {
          error: `Post limit reached. Free plan allows ${postLimit} posts. Upgrade to Pro for unlimited posts.`,
          limitReached: true,
        },
        { status: 403 }
      )
    }

    // ─── Request Body ────────────────────────────────────────────────────────
    const body = await request.json()
    const { title, excerpt, tags, featured, publishedAt, coverImageUrl } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // ─── Slug Generation ─────────────────────────────────────────────────────
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    // ─── Check Existing Author ───────────────────────────────────────────────
    const authorSearchUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}?query=*[_type=="author" && _id=="${authorRefId}"][0]{_id}`

    const authorSearch = await fetch(authorSearchUrl, {
      headers: { Authorization: `Bearer ${SANITY_TOKEN}` },
    })

    const authorData = await authorSearch.json()
    let authorId = authorData?.result?._id

    const mutations: unknown[] = []

    // ─── Create Author (if not exists) ───────────────────────────────────────
    if (!authorId) {
      authorId = authorRefId

      mutations.push({
        createOrReplace: {
          _type: 'author',
          _id: authorId,
          name: profile?.display_name ?? user.email ?? 'Anonymous',
          bio: `Contributor on ContentFlow`,
        },
      })
    }

    // ─── Create Post ─────────────────────────────────────────────────────────
    const postId = `post-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`

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
            },
          ],
          markDefs: [],
        },
      ],
    }

    if (publishedAt) {
      postDocument.publishedAt = new Date(publishedAt).toISOString()
    }

    // ─── Cover Image Upload ──────────────────────────────────────────────────
    if (coverImageUrl) {
      try {
        const imageResponse = await fetch(coverImageUrl)
        const imageBuffer = await imageResponse.arrayBuffer()
        const contentType =
          imageResponse.headers.get('content-type') ?? 'image/png'

        const uploadUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/assets/images/${SANITY_DATASET}`

        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': contentType,
            Authorization: `Bearer ${SANITY_TOKEN}`,
          },
          body: imageBuffer,
        })

        if (uploadResponse.ok) {
          const imageAsset = await uploadResponse.json()

          postDocument.coverImage = {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: imageAsset.document._id,
            },
          }
        }
      } catch (err) {
        console.warn('Image upload failed, continuing without image')
      }
    }

    // ─── Commit to Sanity ────────────────────────────────────────────────────
    mutations.push({ createOrReplace: postDocument })

    await sanityMutation(mutations)

    return NextResponse.json({ success: true, postId, slug })
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to create post'

    console.error('Post creation error:', message)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}