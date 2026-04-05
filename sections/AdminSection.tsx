// sections/AdminSection.tsx
// Server component — fetches adminPageConfig from Sanity AND all users
// from Supabase using the service role key. Both happen server-side only.
// The service role key NEVER touches the client.
import 'server-only'
import { sanityClient } from '@/lib/sanity/client'
import { ADMIN_PAGE_CONFIG_QUERY } from '@/lib/sanity/queries'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { AdminUsersTable } from '@/features/admin/components/AdminUsersTable'

export type AdminConfig = {
  heading?: string
  subheading?: string
  totalUsersLabel?: string
  colUser?: string
  colPlan?: string
  colRole?: string
  colJoined?: string
  footerNote?: string
  emptyLabel?: string
}

export async function AdminSection() {
  // Fetch config and users in parallel
  const [config, users] = await Promise.all([
    sanityClient.fetch<AdminConfig | null>(ADMIN_PAGE_CONFIG_QUERY),
    getAllUsers(),
  ])

  return <AdminUsersTable users={users} config={config ?? {}} />
}

async function getAllUsers() {
  const adminClient = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('AdminSection: Failed to fetch users', error)
    return []
  }

  return data ?? []
}