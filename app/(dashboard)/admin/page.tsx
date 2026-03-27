// ─── app/(dashboard)/admin/page.tsx ──────────────────────────────────────────
// B2: Admin route — shows all users and their subscription tiers.
// Only accessible to users with role = 'admin' in Supabase profiles.
// Uses service role key via server action — never exposed to client.
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminUsersTable } from '@/features/admin/components/AdminUsersTable'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export const metadata = { title: 'Admin — ContentFlow' }

type Profile = Database['public']['Tables']['profiles']['Row']

async function getAllUsers(): Promise<Profile[]> {
  // Service role client — admin access, server only
  const adminClient = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if current user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Non-admins get redirected to dashboard
  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const users = await getAllUsers()

  return <AdminUsersTable users={users} />
}