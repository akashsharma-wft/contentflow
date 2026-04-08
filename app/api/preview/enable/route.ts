// app/api/preview/enable/route.ts
//
// Called by the Sanity Presentation Tool when you click the "Preview" button.
// Enables Next.js Draft Mode so the site fetches draft documents.
//
// @sanity/preview-url-secret v4 exports validatePreviewUrl from the root.
// The old sub-path imports (/next-app-router, /sanity-plugin) are gone.
//
// Flow:
//   1. Presentation tool calls /api/preview/enable?sanityPreviewSecret=...&redirectTo=/
//   2. validatePreviewUrl checks the secret against Sanity dataset
//   3. draftMode().enable() sets the __prerender_bypass cookie
//   4. Redirect to the page being previewed — it now fetches drafts

import { draftMode } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { createClient } from 'next-sanity'

// Sanity client — used server-side ONLY to validate the preview secret token.
// Needs a token with at least Viewer role to read the secret from the dataset.
const sanityClientForPreview = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn:    false,
  token:     process.env.SANITY_API_READ_TOKEN,
})

export async function GET(req: NextRequest) {
  const { isValid, redirectTo = '/' } = await validatePreviewUrl(
    sanityClientForPreview,
    req.url
  )

  if (!isValid) {
    return new Response('Invalid preview secret', { status: 401 })
  }

  const dm = await draftMode()
  dm.enable()

  return NextResponse.redirect(new URL(redirectTo, req.url))
}