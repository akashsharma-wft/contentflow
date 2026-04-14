import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
const apiVersion = '2024-01-01'

/** Public read-only client — safe for both server and browser. Uses CDN (may be ~60s stale). */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

/**
 * Fresh read-only client — bypasses CDN so data is always up-to-date.
 * Use this in dashboard queries where newly created/edited content must appear immediately.
 */
export const sanityFreshClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

/**
 * Admin write client — server-side only, used in API routes.
 * Never expose to the browser.
 */
export const sanityAdminClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})
