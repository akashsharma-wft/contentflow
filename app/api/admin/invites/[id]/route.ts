// app/api/admin/invites/[id]/route.ts
// PATCH — admin approves, rejects, or cancels a pending invite/request.
//
// Auth:   must be authenticated + role === 'admin'
// Body:   { action: 'approve' | 'reject' | 'cancel' }
//
// On approve:
//   1. Updates admin_invites row → status = 'approved', reviewed_by, reviewed_at
//   2. Updates profiles.role = 'admin' for the target user (if user_id exists)
//      If no profile yet (invite to unknown email), role is set when they sign up
//      via the invite link workflow — for now we mark it approved and wait.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createUserClient } from '@/lib/supabase/server'
import type { AdminDatabase } from '@/types/admin'

function adminDb() {
  return createClient<AdminDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ── 1. Auth + admin role check ───────────────────────────────────────────
    const supabase = await createUserClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
    }

    // ── 2. Parse body + params ───────────────────────────────────────────────
    const { id } = await params
    const body = await request.json()
    const action: string = body.action ?? ''

    if (!['approve', 'reject', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be approve | reject | cancel' },
        { status: 400 }
      )
    }

    const db = adminDb()

    // ── 3. Fetch the invite row ──────────────────────────────────────────────
    const { data: invite, error: fetchError } = await db
      .from('admin_invites')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot ${action} an invite with status '${invite.status}'` },
        { status: 409 }
      )
    }

    // cancel is only valid on invites created by this admin (or any admin — keep it simple)
    // We allow any admin to cancel any pending invite.

    // ── 4. Build update payload ──────────────────────────────────────────────
    const newStatus =
      action === 'approve' ? 'approved' :
      action === 'reject'  ? 'rejected'  :
                             'cancelled'

    const { error: updateError } = await db
      .from('admin_invites')
      .update({
        status:      newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('admin/invites/[id] update error:', updateError)
      return NextResponse.json({ error: 'Failed to update invite' }, { status: 500 })
    }

    // ── 5. If approved and we have a user_id, promote them ──────────────────
    if (action === 'approve' && invite.user_id) {
      const { error: roleError } = await db
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', invite.user_id)

      if (roleError) {
        console.error('admin/invites/[id] role promotion error:', roleError)
        // Roll back the status update so the admin can retry
        await db
          .from('admin_invites')
          .update({ status: 'pending', reviewed_by: null, reviewed_at: null })
          .eq('id', id)
        return NextResponse.json(
          { error: 'Failed to promote user role — invite reverted to pending' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (err) {
    console.error('admin/invites/[id] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
