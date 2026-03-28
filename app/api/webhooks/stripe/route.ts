import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const rawBody = await request.text() // Must be raw text, NOT .json()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>

  try {
    // Verify the webhook came from Stripe — rejects tampered payloads
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook verification failed'
    console.error('Stripe webhook signature verification failed:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  // Use service role key here — webhook runs server-side, needs to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Handle checkout.session.completed — user successfully paid
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.userId

    if (!userId) {
      return NextResponse.json({ error: 'No userId' }, { status: 400 })
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'pro',
        stripe_customer_id: session.customer as string,
        subscription_id: session.subscription as string,
      })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update subscription:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object

    // Find user by subscription_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('subscription_id', subscription.id)
      .single()

    if (profile?.id) {
      // Downgrade tier
      await supabase
        .from('profiles')
        .update({ subscription_tier: 'free', subscription_id: null })
        .eq('id', profile.id)

      // Find all published posts by this user, keep 5 newest published, draft the rest
      const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
      const SANITY_DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
      const SANITY_TOKEN      = process.env.SANITY_API_TOKEN!

      const postsUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${SANITY_DATASET}`
      const postsResponse = await fetch(postsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SANITY_TOKEN}` },
        body: JSON.stringify({
          query: '*[_type=="post" && authorId==$userId && defined(publishedAt)] | order(publishedAt desc) {_id}',
          params: { userId: profile.id },
        }),
      })
      const postsData = await postsResponse.json()
      const publishedPosts: { _id: string }[] = postsData?.result ?? []

      // Posts beyond the 5 most recent get unpublished (publishedAt removed = draft)
      const postsToUnpublish = publishedPosts.slice(5)

      if (postsToUnpublish.length > 0) {
        const mutations = postsToUnpublish.map((p) => ({
          patch: { id: p._id, unset: ['publishedAt'] }
        }))

        await fetch(
          `https://${SANITY_PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${SANITY_DATASET}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SANITY_TOKEN}` },
            body: JSON.stringify({ mutations }),
          }
        )

        console.log(`Downgraded user ${profile.id}: unpublished ${postsToUnpublish.length} posts`)
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object

    if (subscription.cancel_at_period_end && subscription.cancel_at) {
      // User has cancelled — mark the cancellation date
      await supabase
        .from('profiles')
        .update({
          subscription_cancel_at: new Date(subscription.cancel_at * 1000).toISOString(),
        })
        .eq('subscription_id', subscription.id)
    } else if (!subscription.cancel_at_period_end) {
      // User reactivated (clicked "Don't cancel")
      await supabase
        .from('profiles')
        .update({ subscription_cancel_at: null })
        .eq('subscription_id', subscription.id)
    }
  }

  return NextResponse.json({ received: true })
}