/**
 * /api/preview/disable
 *
 * Disables Next.js Draft Mode and redirects to the given path.
 */
import { draftMode } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const redirectUrl = searchParams.get('redirect') ?? '/'

  const dm = await draftMode()
  dm.disable()

  const target = new URL(redirectUrl, req.nextUrl.origin)
  return NextResponse.redirect(target)
}
