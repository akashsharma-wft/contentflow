export const dynamic = 'force-dynamic'

export { metadata, viewport } from 'next-sanity/studio'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { AdminInvite, AdminDatabase } from '@/types/admin'
import { StudioClient } from './_StudioClient'
import { StudioAccessRequest } from './_StudioAccessRequest'

// Read at module level so it's available in the server component without
// passing it as a prop through client boundaries.
const SANITY_TOKEN = process.env.SANITY_API_TOKEN ?? ''

function adminDb() {
  return createAdminClient<AdminDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function StudioPage() {
  // ── 1. Auth check ─────────────────────────────────────────────────────────
  // Middleware already redirects unauthenticated users to /login, but we do a
  // server-side guard here too so this component is self-contained.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/studio')
  }

  // ── 2. Role check ─────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') {
    // Full studio access — pass the Sanity API token so _StudioClient can
    // pre-seed localStorage and skip the redundant Sanity.io login screen.
    return <StudioClient token={SANITY_TOKEN} />
  }

  const userEmail = profile?.email ?? user.email ?? ''
  const db = adminDb()

  // ── 3. Non-admin: fetch their latest request AND any pending invite by email ──
  // Run both queries in parallel.
  const [{ data: latestRequest }, { data: pendingInvite }] = await Promise.all([
    db
      .from('admin_invites')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'request')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    db
      .from('admin_invites')
      .select('*')
      .eq('email', userEmail)
      .eq('type', 'invite')
      .eq('status', 'pending')
      .limit(1)
      .maybeSingle(),
  ])

  // If there's a pending invite for this email but user_id isn't linked yet, link it now.
  if (pendingInvite && !pendingInvite.user_id) {
    await db
      .from('admin_invites')
      .update({ user_id: user.id })
      .eq('id', pendingInvite.id)
  }

  return (
    <StudioAccessRequest
      userEmail={userEmail}
      existingRequest={latestRequest as AdminInvite | null}
      existingInvite={pendingInvite as AdminInvite | null}
    />
  )
}
