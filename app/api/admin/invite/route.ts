// app/api/admin/invite/route.ts
// POST — admin sends an email invite to grant someone admin access.
//
// Auth:   must be authenticated + role === 'admin'
// Body:   { email: string; message?: string }
//
// Branching behaviour:
//   INVITE_EMAIL (akash.sharma@weframetech.com)
//     → insert pending invite row + send real Resend email
//   Any other email
//     → look up existing profile, promote role='admin' directly (no email)
//       returns { directGrant: true } so the client can show a different toast
//       returns 404 if no profile exists for that email yet

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createUserClient } from '@/lib/supabase/server'
import type { AdminDatabase } from '@/types/admin'
import { sendAdminInviteEmail } from '@/lib/email'

// The only email address that goes through the full email-invite flow.
// All other addresses are promoted directly.
const INVITE_EMAIL = 'akash.sharma@weframetech.com'

function adminDb() {
  return createClient<AdminDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
    // ── 1. Auth + admin role check ───────────────────────────────────────────
    const supabase = await createUserClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role, display_name, email')
      .eq('id', user.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
    }

    // ── 2. Validate body ─────────────────────────────────────────────────────
    const body = await request.json()
    const email: string = (body.email ?? '').trim().toLowerCase()
    const message: string | null = body.message?.trim() || null

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const db = adminDb()

    // ── 3. Prevent duplicate pending invites for this email ──────────────────
    const { data: existing } = await db
      .from('admin_invites')
      .select('id, status')
      .eq('email', email)
      .eq('type', 'invite')
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'A pending invite already exists for this email' },
        { status: 409 }
      )
    }

    // ── 4. Look up existing profile for the target email ────────────────────
    const { data: targetProfile } = await db
      .from('profiles')
      .select('id, role')
      .eq('email', email)
      .maybeSingle()

    if (targetProfile?.role === 'admin') {
      return NextResponse.json(
        { error: 'This user is already an admin' },
        { status: 409 }
      )
    }

    // ── 5. Branch: special invite email vs direct-grant ──────────────────────

    if (email === INVITE_EMAIL) {
      // ── 5a. Full invite flow: insert pending row + send real email ──────────
      const { data: invite, error: insertError } = await db
        .from('admin_invites')
        .insert({
          email,
          user_id:    targetProfile?.id ?? null,
          type:       'invite',
          status:     'pending',
          message,
          invited_by: user.id,
        })
        .select()
        .single()

      if (insertError) {
        console.error('admin/invite insert error:', insertError)
        return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
      }

      try {
        await sendAdminInviteEmail({
          toEmail:       email,
          invitedByName: callerProfile.display_name ?? callerProfile.email ?? user.email ?? 'An admin',
          message,
          appUrl:        process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        })
      } catch (emailErr) {
        console.error('admin/invite email send error:', emailErr)
        await db.from('admin_invites').delete().eq('id', invite.id)
        return NextResponse.json(
          { error: 'Email failed to send — please check your RESEND_API_KEY configuration' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, invite })
    }

    // ── 5b. Direct grant: profile must already exist ─────────────────────────
    if (!targetProfile) {
      return NextResponse.json(
        { error: 'No user account exists for that email yet — they need to sign up first' },
        { status: 404 }
      )
    }

    const { error: roleError } = await db
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', targetProfile.id)

    if (roleError) {
      console.error('admin/invite direct-grant role error:', roleError)
      return NextResponse.json({ error: 'Failed to promote user to admin' }, { status: 500 })
    }

    // Insert an approved audit record so the history stays coherent.
    await db.from('admin_invites').insert({
      email,
      user_id:     targetProfile.id,
      type:        'invite',
      status:      'approved',
      message,
      invited_by:  user.id,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, directGrant: true })
  } catch (err) {
    console.error('admin/invite unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
