/**
 * /api/preview/enable
 *
 * Called by Sanity Presentation Tool to activate Next.js Draft Mode.
 * Redirects to the requested preview URL after enabling.
 */
import { draftMode } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const secret = searchParams.get('secret')
  const redirectUrl = searchParams.get('redirect') ?? '/'

  // Validate the preview secret
  const expectedSecret = process.env.SANITY_PREVIEW_SECRET
  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  // Enable Draft Mode — sets a cookie on the browser
  const dm = await draftMode()
  dm.enable()

  // Redirect to the preview URL (must be same origin)
  const target = new URL(redirectUrl, req.nextUrl.origin)
  return NextResponse.redirect(target)
}
