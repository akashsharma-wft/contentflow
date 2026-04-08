// app/api/preview/disable/route.ts
//
// Called when you click "Exit preview" in the Sanity overlay toolbar.
// Disables Next.js Draft Mode and redirects home.

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const dm = await draftMode()
  dm.disable()

  // Redirect to whatever page they came from, or home
  const { searchParams } = new URL(request.url)
  const redirectTo = searchParams.get('redirectTo') ?? '/'
  redirect(redirectTo)
}