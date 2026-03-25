import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function DELETE() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // ✅ 1. Delete avatar (CORRECT WAY)
    await adminClient.storage
      .from('contentflow')
      .remove([`avatars/${user.id}-avatar.png`])

    // ✅ 2. Delete profile
    await adminClient
      .from('profiles')
      .delete()
      .eq('id', user.id)

    // ✅ 3. Delete auth user
    await adminClient.auth.admin.deleteUser(user.id)

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Deletion failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}