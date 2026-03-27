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

  // Handle cancellation — use subscription_id to find the user
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'free',
        subscription_id: null,
      })
      .eq('subscription_id', subscription.id)

    if (error) {
      console.error('Failed to downgrade subscription:', error)
    }
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