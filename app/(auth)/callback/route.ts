import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// This route is hit after Google redirects back to our app
// Supabase gives us a ?code= param, we exchange it for a real session
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // If something went wrong, send them back to login with an error message
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}