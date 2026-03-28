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
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, subscription_tier')
      .eq('id', user.id)
      .single()

    const countUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}`
    const countResponse = await fetch(countUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SANITY_TOKEN}` },
          body: JSON.stringify({
            query: 'count(*[_type=="post" && authorId==$authorId && defined(publishedAt)])',
            params: { authorId: user.id },
          }),
    })

    const countData = await countResponse.json()
    const currentCount = countData?.result ?? 0

    const postLimit = profile?.subscription_tier === 'pro' ? Number.MAX_SAFE_INTEGER : 5

    
    const body = await request.json()
    const { title, excerpt, tags, featured, publishedAt, coverImageUrl } = body

    if (currentCount >= postLimit && publishedAt) {
      return NextResponse.json({
        error: `Post limit reached. Free plan allows ${postLimit} posts. Upgrade to Pro for unlimited posts.`,
        limitReached: true,
      }, { status: 403 })
    }
    
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const postId = `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const slug = postId

    const postDocument: Record<string, unknown> = {
      _type: 'post',
      _id: postId,
      title: title.trim(),
      slug: { _type: 'slug', current: slug },
      excerpt: excerpt?.trim() ?? '',
      featured: featured ?? false,
      tags: (tags ?? []).filter(Boolean),
      // Author data embedded directly from user profile
      authorId: user.id,
      authorName: profile?.display_name ?? user.email ?? 'Anonymous',
      authorEmail: user.email ?? '',
      authorAvatar: profile?.avatar_url ?? null,
      body: [{
        _type: 'block',
        _key: `block-${Date.now()}`,
        style: 'normal',
        children: [{
          _type: 'span',
          _key: `span-${Date.now()}`,
          text: excerpt ?? '',
          marks: [],
        }],
        markDefs: [],
      }],
    }

    if (publishedAt) {
      postDocument.publishedAt = new Date(publishedAt).toISOString()
    }

    if (coverImageUrl) {
      try {
        const imageResponse = await fetch(coverImageUrl)
        const imageBuffer = await imageResponse.arrayBuffer()
        const contentType = imageResponse.headers.get('content-type') ?? 'image/png'

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
            asset: { _type: 'reference', _ref: imageAsset.document._id },
          }
        }
      } catch {
        console.warn('Image upload failed, continuing without image')
      }
    }

    await sanityMutation([{ createOrReplace: postDocument }])

    return NextResponse.json({ success: true, postId, slug })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create post'
    console.error('Post creation error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}