// ─── app/api/webhooks/stripe/route.ts ─────────────────────────────────────────
// Stripe calls this endpoint when payment events happen.
// CRITICAL: Must verify the Stripe signature — without this, anyone could
// send fake events to upgrade accounts for free. This is a security requirement.
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import posthog from 'posthog-js'

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
      console.error('No userId in session metadata')
      return NextResponse.json({ error: 'No userId' }, { status: 400 })
    }

    // Upgrade user to pro in Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_tier: 'pro' })
      .eq('id', userId)

    if (error) {
      console.error('Failed to update subscription tier:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    // Track upgrade_completed event in PostHog from server
    // Uses PostHog Node SDK for server-side events
    const { PostHog } = await import('posthog-node')
    const serverPosthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!)
    await serverPosthog.capture({
      distinctId: userId,
      event: 'upgrade_completed',
      properties: {
        plan: 'pro',
        stripe_session: session.id,
        timestamp: new Date().toISOString(),
      },
    })
    await serverPosthog.shutdown()

    console.log(`User ${userId} upgraded to Pro`)
  }

  // Handle subscription cancelled
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const customerId = subscription.customer as string

    // Find user by Stripe customer ID
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .limit(1)

    if (profiles?.[0]) {
      await supabase
        .from('profiles')
        .update({ subscription_tier: 'free' })
        .eq('id', profiles[0].id)
    }
  }

  return NextResponse.json({ received: true })
}