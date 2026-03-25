import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code       = searchParams.get('code')
  const tokenHash  = searchParams.get('token_hash')
  const type       = searchParams.get('type') as 'signup' | 'recovery' | 'email' | null
  const next       = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  // Flow 1 — OAuth (Google): exchange the code for a session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Flow 2 — Email verification: verify the OTP token hash
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If both fail, redirect to login with an error param
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}