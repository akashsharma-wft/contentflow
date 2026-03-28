'use client'

import { useState } from 'react'
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

interface CancelSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  onConfirm,
}: CancelSubscriptionDialogProps) {
  const [isCancelling, setIsCancelling] = useState(false)

  async function handleConfirm() {
    setIsCancelling(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#1a1d27] border border-white/10 max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
              <AlertTriangle size={15} className="text-amber-400" />
            </div>
            <AlertDialogTitle className="text-white text-base font-semibold">
              Cancel Subscription
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-white/45 text-sm leading-relaxed mt-2">
            Your Pro access will remain active until the end of the current billing period. After that, your account will revert to the Free plan and any posts beyond the 5-post limit will be moved to drafts.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            disabled={isCancelling}
            className="bg-transparent border-white/10 text-white/50 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            Keep Pro
          </AlertDialogCancel>
          <button
            onClick={handleConfirm}
            disabled={isCancelling}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel subscription'}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}