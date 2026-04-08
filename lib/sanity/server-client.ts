// lib/sanity/server-client.ts
//
// SERVER-ONLY Sanity client that respects Next.js Draft Mode.
//
// When Draft Mode is enabled (e.g. inside the Sanity Presentation Tool):
//   - Uses SANITY_API_READ_TOKEN to authenticate
//   - Sets perspective: 'previewDrafts' so you see unsaved draft changes
//   - Enables stega encoding so click-to-edit overlays work in Presentation Tool
//
// When Draft Mode is disabled (normal page load):
//   - No token — reads only published documents
//   - Uses CDN for performance
//   - No stega encoding
//
// USAGE: Replace sanityClient.fetch() with this in any route/component
// that needs live preview support.

import 'server-only'
import { createClient } from 'next-sanity'
import { draftMode } from 'next/headers'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
const apiVersion = '2024-01-01'

export async function getSanityClient() {
  const { isEnabled } = await draftMode()

  return createClient({
    projectId,
    dataset,
    apiVersion,
    // In draft mode: bypass CDN to get fresh draft data
    useCdn: !isEnabled,
    // In draft mode: use the viewer token to read unpublished drafts
    token: isEnabled ? process.env.SANITY_API_READ_TOKEN : undefined,
    // perspective: 'previewDrafts' makes GROQ return draft documents when they exist
    perspective: isEnabled ? 'previewDrafts' : 'published',
    // stega encoding embeds edit coordinates in text strings.
    // The VisualEditing component in layout.tsx reads these to show blue click-to-edit borders.
    stega: isEnabled
      ? {
          enabled: true,
          studioUrl: '/studio',
        }
      : { enabled: false },
  })
}