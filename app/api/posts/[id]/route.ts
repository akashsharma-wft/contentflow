import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const SANITY_DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const SANITY_TOKEN      = process.env.SANITY_API_TOKEN!

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Use POST with query and params in body to avoid unknown query parameter errors
    const checkUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}`;
    const checkQuery = '*[_id==$id && authorId==$authorId][0]{_id}';
    const checkResponse = await fetch(checkUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SANITY_TOKEN}`,
      },
      body: JSON.stringify({
        query: checkQuery,
        params: { id, authorId: user.id },
      }),
    });
    const checkData = await checkResponse.json();
    if (!checkData?.result?._id) {
      return NextResponse.json({ error: 'You can only edit your own posts' }, { status: 403 });
    }

    const body = await request.json()
    const { title, excerpt, tags, featured, publishedAt } = body

    const slug = title.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')

    const mutations = [{
      patch: {
        id,
        set: {
          title,
          'slug.current': slug,
          excerpt: excerpt ?? '',
          featured: featured ?? false,
          tags: tags ?? [],
          ...(publishedAt !== undefined && { publishedAt }),
        }
      }
    }]

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
      const err = await response.json()
      throw new Error(err.error?.description ?? 'Sanity update failed')
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Update failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const checkUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}`;
    const checkQuery = '*[_id==$id && authorId==$authorId][0]{_id}';
    const checkResponse = await fetch(checkUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SANITY_TOKEN}`,
      },
      body: JSON.stringify({
        query: checkQuery,
        params: { id, authorId: user.id },
      }),
    });
    const checkData = await checkResponse.json()

    if (!checkData?.result?._id) {
      return NextResponse.json({ error: 'You can only delete your own posts' }, { status: 403 })
    }

    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${SANITY_DATASET}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SANITY_TOKEN}`,
      },
      body: JSON.stringify({ mutations: [{ delete: { id } }] }),
    })

    if (!response.ok) {
      throw new Error('Sanity delete failed')
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Delete failed' },
      { status: 500 }
    )
  }
}