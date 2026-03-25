// ─── lib/stripe.ts ────────────────────────────────────────────────────────────
// Server-side Stripe instance. Never import this in client components.
// The secret key is only available server-side (no NEXT_PUBLIC_ prefix).
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
})