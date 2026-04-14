// app/api/admin/invites/route.ts
// GET — admin fetches all pending invites and access requests.
//
// Auth:   must be authenticated + role === 'admin'
// Returns: { invites: AdminInviteRow[], requests: AdminInviteRow[] }

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createUserClient } from '@/lib/supabase/server'
import type { AdminDatabase } from '@/types/admin'
import type { AdminInviteRow } from '@/types/admin'

function adminDb() {
  return createClient<AdminDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
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

    const db = adminDb()

    // ── 2. Fetch all pending + recently-actioned rows ───────────────────────
    const { data: rows, error } = await db
      .from('admin_invites')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('admin/invites fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 })
    }

    // ── 3. Enrich with display names from profiles ───────────────────────────
    // Collect all user_ids and invited_by ids in one round-trip
    const profileIds = new Set<string>()
    for (const row of rows ?? []) {
      if (row.user_id)    profileIds.add(row.user_id)
      if (row.invited_by) profileIds.add(row.invited_by)
    }

    const profileMap = new Map<string, string>()
    if (profileIds.size > 0) {
      const { data: profiles } = await db
        .from('profiles')
        .select('id, display_name, email')
        .in('id', Array.from(profileIds))

      for (const p of profiles ?? []) {
        profileMap.set(p.id, p.display_name ?? p.email ?? p.id)
      }
    }

    const enriched: AdminInviteRow[] = (rows ?? []).map((row) => ({
      ...row,
      requester_name:  row.user_id    ? (profileMap.get(row.user_id)    ?? null) : null,
      invited_by_name: row.invited_by ? (profileMap.get(row.invited_by) ?? null) : null,
    }))

    const invites  = enriched.filter((r) => r.type === 'invite')
    const requests = enriched.filter((r) => r.type === 'request')

    return NextResponse.json({ invites, requests })
  } catch (err) {
    console.error('admin/invites unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
