// types/admin.ts
// TypeScript types for the admin invite / access-request workflow.
// The admin_invites table is declared in supabase/migrations/001_admin_invites.sql.

import type { Database } from '@/types/supabase'

export type AdminInviteType   = 'invite' | 'request'
export type AdminInviteStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

/** A row from the admin_invites table. */
export interface AdminInvite {
  id:          string
  email:       string
  user_id:     string | null
  type:        AdminInviteType
  status:      AdminInviteStatus
  message:     string | null
  invited_by:  string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at:  string
}

/** Shape returned by GET /api/admin/invites — rows enriched with profile display names. */
export interface AdminInviteRow extends AdminInvite {
  /** Display name of the user who made a request (null for invites where user hasn't signed up). */
  requester_name:  string | null
  /** Display name of the admin who created the invite / reviewed the record. */
  invited_by_name: string | null
}

// ─── Supabase-compatible database type for admin_invites ──────────────────────
//
// `types/supabase.ts` is auto-generated and only contains `profiles`.
// We define a standalone AdminDatabase below that mirrors the required Supabase
// type structure so the service-role client gets full type safety on admin_invites
// without modifying the auto-generated file.
//
// Only tables used in the admin routes are included (profiles + admin_invites).

type AdminInviteRow_DB = {
  id:          string
  email:       string
  user_id:     string | null
  type:        AdminInviteType
  status:      AdminInviteStatus
  message:     string | null
  invited_by:  string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at:  string
}

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type AdminDatabase = {
  __InternalSupabase: { PostgrestVersion: '14.4' }
  public: {
    Tables: {
      admin_invites: {
        Row: AdminInviteRow_DB
        Insert: {
          id?:          string
          email:        string
          user_id?:     string | null
          type:         string
          status?:      string
          message?:     string | null
          invited_by?:  string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?:  string
        }
        Update: {
          id?:          string
          email?:       string
          user_id?:     string | null
          type?:        string
          status?:      string
          message?:     string | null
          invited_by?:  string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?:  string
        }
        Relationships: []
      }
      profiles: {
        Row:    ProfileRow
        Insert: ProfileInsert
        Update: ProfileUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Database['public']['Enums']
    CompositeTypes: Record<string, never>
  }
}
