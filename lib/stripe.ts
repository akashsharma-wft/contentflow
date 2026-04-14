// ─── lib/stripe.ts ────────────────────────────────────────────────────────────
// Server-side Stripe instance. Never import this in client components.
// The secret key is only available server-side (no NEXT_PUBLIC_ prefix).
//
// `stripe` is null when STRIPE_SECRET_KEY is not set. Routes that need Stripe
// should check for null and return an appropriate error/fallback response rather
// than throwing, which would cause Next.js to return a 404 instead of 500.
import Stripe from 'stripe'

function createStripeInstance(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  try {
    return new Stripe(key, { apiVersion: '2026-02-25.clover', typescript: true })
  } catch {
    return null
  }
}

export const stripe: Stripe | null = createStripeInstance()