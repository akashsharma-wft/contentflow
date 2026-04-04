/**
 * Server-only Sanity client that respects Next.js Draft Mode.
 *
 * Import this ONLY in Server Components and API routes — never in 'use client' files.
 * It depends on next/headers which is unavailable in client components.
 */
import 'server-only'
import { createClient } from 'next-sanity'
import { draftMode } from 'next/headers'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
const apiVersion = '2024-01-01'

/**
 * Returns whether Next.js Draft Mode is currently active.
 * Call in Server Components to decide whether to show draft content.
 */
export async function getDraftModeStatus(): Promise<boolean> {
  const { isEnabled } = await draftMode()
  return isEnabled
}

/**
 * Returns a Sanity client configured for the current rendering context:
 * - Draft Mode ON  → perspective: 'previewDrafts', token required
 * - Draft Mode OFF → perspective: 'published', CDN enabled
 */
export async function getSanityClient() {
  const { isEnabled } = await draftMode()

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: !isEnabled,
    token: isEnabled ? process.env.SANITY_API_TOKEN : undefined,
    perspective: isEnabled ? 'previewDrafts' : 'published',
  })
}
