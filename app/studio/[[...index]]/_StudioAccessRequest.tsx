'use client'

import { useState } from 'react'
import { Shield, ShieldOff, Clock, CheckCircle2, XCircle, Send, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminInvite } from '@/types/admin'

interface StudioAccessRequestProps {
  userEmail:       string
  existingRequest: AdminInvite | null
  /** Set when an admin sent this email an invite (type='invite') that is still pending */
  existingInvite:  AdminInvite | null
}

export function StudioAccessRequest({ userEmail, existingRequest, existingInvite }: StudioAccessRequestProps) {
  const [status,  setStatus]  = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Derive the current request state to show (requests take priority over invites for status display)
  const requestState = existingRequest?.status ?? null

  async function handleRequestAccess() {
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/studio/request-access', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: message.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setErrorMsg('Network error — please try again')
      setStatus('error')
    }
  }

  // Already approved means their role should have been updated — show refresh hint
  if (requestState === 'approved') {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle2 size={26} className="text-emerald-400" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Access Approved</h1>
          <p className="text-white/50 text-sm max-w-sm">
            Your admin access request has been approved. Refresh the page to access Sanity Studio.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Reload Page
          </button>
        </div>
      </Layout>
    )
  }

  if (requestState === 'rejected') {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <XCircle size={26} className="text-red-400" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Request Declined</h1>
          <p className="text-white/50 text-sm max-w-sm">
            Your previous access request was declined. You can submit a new request below, or
            contact an admin directly.
          </p>
          <RequestForm
            message={message}
            setMessage={setMessage}
            onSubmit={handleRequestAccess}
            status={status}
            errorMsg={errorMsg}
          />
        </div>
      </Layout>
    )
  }

  if (requestState === 'pending' || status === 'success') {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Clock size={26} className="text-amber-400" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Request Pending</h1>
          <p className="text-white/50 text-sm max-w-sm">
            Your request for Sanity Studio access has been submitted. An admin will review it
            shortly. You will be able to access Studio once approved.
          </p>
          <div className="mt-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-white/40 text-xs font-mono">{userEmail}</span>
          </div>
        </div>
      </Layout>
    )
  }

  // Invited by an admin (invite type, pending) — already in the queue, no need to submit a request
  if (existingInvite?.status === 'pending' && !existingRequest) {
    return (
      <Layout>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <Clock size={26} className="text-indigo-400" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Invite Pending Approval</h1>
          <p className="text-white/50 text-sm max-w-sm">
            An admin has invited <span className="text-white/70 font-mono">{userEmail}</span> to
            ContentFlow Studio. Your invite is pending final approval — you'll have access once an
            admin approves it.
          </p>
          <div className="mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-white/40 text-xs font-mono">Waiting for admin review…</span>
          </div>
        </div>
      </Layout>
    )
  }

  // Default: no request yet — show the request form
  return (
    <Layout>
      <div className="flex flex-col items-center gap-6 text-center w-full max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
          <ShieldOff size={26} className="text-indigo-400" />
        </div>

        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">
            Studio Access Restricted
          </h1>
          <p className="text-white/50 text-sm mt-2 max-w-xs mx-auto">
            Sanity Studio is only accessible to admins. Submit a request and an existing admin
            will review it.
          </p>
        </div>

        <div className="w-full bg-[#13141c] border border-white/5 rounded-2xl p-5 text-left space-y-4">
          <div>
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-mono mb-1">
              Signed in as
            </p>
            <p className="text-white/60 text-sm font-mono">{userEmail}</p>
          </div>

          <RequestForm
            message={message}
            setMessage={setMessage}
            onSubmit={handleRequestAccess}
            status={status}
            errorMsg={errorMsg}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span className="text-white/20 text-[10px] font-mono uppercase tracking-widest">
            Admins are notified of new requests
          </span>
        </div>
      </div>
    </Layout>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0e0f14] flex flex-col items-center justify-center p-6">
      <div className="mb-8 flex items-center gap-2">
        <Shield size={18} className="text-indigo-400" />
        <span className="text-white/60 text-sm font-semibold tracking-tight">
          ContentFlow Studio
        </span>
      </div>
      {children}
    </div>
  )
}

interface RequestFormProps {
  message:    string
  setMessage: (v: string) => void
  onSubmit:   () => void
  status:     'idle' | 'submitting' | 'success' | 'error'
  errorMsg:   string
}

function RequestForm({ message, setMessage, onSubmit, status, errorMsg }: RequestFormProps) {
  return (
    <div className="w-full space-y-3">
      <div>
        <label className="text-white/30 text-[10px] uppercase tracking-widest font-mono block mb-1.5">
          Optional note for the admin
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. I need to update the homepage content…"
          rows={3}
          className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2.5 text-white/70 text-sm placeholder:text-white/20 resize-none focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
      </div>

      {errorMsg && (
        <p className="text-red-400 text-xs">{errorMsg}</p>
      )}

      <button
        onClick={onSubmit}
        disabled={status === 'submitting'}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer',
          status === 'submitting'
            ? 'bg-indigo-500/50 text-white/50 cursor-not-allowed'
            : 'bg-indigo-500 hover:bg-indigo-600 text-white'
        )}
      >
        {status === 'submitting' ? (
          'Submitting…'
        ) : (
          <>
            <Send size={14} />
            Request Studio Access
            <ChevronRight size={14} className="ml-auto" />
          </>
        )}
      </button>
    </div>
  )
}
