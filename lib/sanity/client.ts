import { createClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
const apiVersion = '2024-01-01'

/** Public read-only client — safe for both server and browser */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
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
