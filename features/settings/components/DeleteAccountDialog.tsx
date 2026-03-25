'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail: string
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  userEmail,
}: DeleteAccountDialogProps) {
  const router = useRouter()
  const [confirmEmail, setConfirmEmail] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Only enable the delete button when typed email matches exactly
  const isConfirmed = confirmEmail === userEmail

  async function handleDelete() {
    if (!isConfirmed) return
    setIsDeleting(true)

    try {
      const supabase = createClient()

      // Step 2: Delete auth.users via server API route (requires service role)
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Failed to delete account')
      }

      toast.success('Account deleted successfully')

      // Step 3: Clear all Supabase auth tokens from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-')) localStorage.removeItem(key)
      })

      // Step 4: Hard redirect — session is gone, router.push won't work
      window.location.href = '/login'
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account')
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#1a1d27] border border-white/10 max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle size={15} className="text-red-400" />
            </div>
            <AlertDialogTitle className="text-white text-base font-semibold">
              Delete Account
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-white/45 text-sm leading-relaxed mt-2">
            This action is irreversible. All your content, technical assets, and
            architectural history will be permanently erased. Please type your
            email to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Email confirmation input */}
        <div className="space-y-1.5 py-2">
          <Label className="text-white/30 text-[10px] uppercase tracking-widest font-medium">
            Verification Required
          </Label>
          <Input
            type="email"
            placeholder={userEmail}
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            disabled={isDeleting}
            className="bg-[#0d0e14] border-white/10 text-white placeholder:text-white/20 focus-visible:ring-red-500/30 focus-visible:border-red-500/30 h-10 rounded-xl"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => { setConfirmEmail(''); onOpenChange(false) }}
            className="bg-transparent border-white/10 text-white/50 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer',
              isConfirmed
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-red-500/20 text-red-400/50 cursor-not-allowed'
            )}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}