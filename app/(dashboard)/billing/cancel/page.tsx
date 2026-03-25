// ─── app/(dashboard)/billing/cancel/page.tsx ─────────────────────────────────
// Shown when user cancels Stripe Checkout without paying.
import Link from 'next/link'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen bg-[#0d0e14] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#13141c] border border-white/5 rounded-2xl p-8 text-center space-y-5">

        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle size={32} className="text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-white text-xl font-bold">Checkout Cancelled</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            No payment was made. You can upgrade to Pro any time from the Billing page.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Link
            href="/billing"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Billing
          </Link>
          <Link
            href="/dashboard"
            className="w-full py-2.5 text-white/40 hover:text-white/70 text-sm transition-colors cursor-pointer"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}