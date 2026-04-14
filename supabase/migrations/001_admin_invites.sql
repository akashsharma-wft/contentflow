-- Migration: 001_admin_invites
-- Creates the admin_invites table for the admin invite / access-request workflow.
--
-- Run this in your Supabase SQL editor or via `supabase db push`.
--
-- Table handles two flows in one:
--   type = 'invite'   — admin sends invite to an email address
--   type = 'request'  — non-admin user requests studio/admin access
--
-- Statuses:
--   pending    — awaiting review
--   approved   — admin approved; role already updated in profiles
--   rejected   — admin rejected
--   cancelled  — admin cancelled their own pending invite

CREATE TABLE IF NOT EXISTS public.admin_invites (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT        NOT NULL,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  type         TEXT        NOT NULL CHECK (type IN ('invite', 'request')),
  status       TEXT        NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  message      TEXT,
  invited_by   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup by email (invite deduplication)
CREATE INDEX IF NOT EXISTS admin_invites_email_idx
  ON public.admin_invites(email);

-- Fast lookup by user_id (user checking their own request status)
CREATE INDEX IF NOT EXISTS admin_invites_user_id_idx
  ON public.admin_invites(user_id);

-- Fast lookup by status (admin panel pending queue)
CREATE INDEX IF NOT EXISTS admin_invites_status_idx
  ON public.admin_invites(status);

-- Enable RLS
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

-- Users can read their own requests via the anon key (used by the access-request screen)
CREATE POLICY "users_view_own_requests"
  ON public.admin_invites
  FOR SELECT
  USING (auth.uid() = user_id);

-- All write operations go through service-role-key API routes (service role bypasses RLS).
-- No additional policies needed for insert/update/delete.
