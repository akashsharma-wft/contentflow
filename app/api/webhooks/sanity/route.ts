import { NextRequest, NextResponse } from 'next/server'
import { invalidateRouteCache } from '@/lib/supabase/middleware'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-sanity-webhook-secret')
  const envSecret = process.env.SANITY_WEBHOOK_SECRET

  if (envSecret && secret !== envSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (body?._type === 'page') {
      invalidateRouteCache()
    }
    return NextResponse.json({ received: true })
  } catch {
    invalidateRouteCache()
    return NextResponse.json({ received: true })
  }
}
