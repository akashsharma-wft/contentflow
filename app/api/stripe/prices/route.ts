import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'

export async function GET() {
  try {
    const prices = await stripe.prices.list({
      expand: ['data.product'],
      active: true,
    })

    const formatted = prices.data.map((price) => ({
      id: price.id,
      unit_amount: price.unit_amount ?? 0,
      currency: price.currency,
      interval: price.recurring?.interval ?? 'month',
      product: {
        name: (price.product as Stripe.Product).name,
      },
    }))

    return NextResponse.json(formatted)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch prices'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}