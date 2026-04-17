// features/posts/components/DraftPostToast.tsx
//
// Client component: reads the `?draft=1` search param set when a user visits
// a draft post's URL, shows a Sonner toast, then cleans the param from the URL
// so a page refresh doesn't re-trigger the message.
//
// Rendered inside DashboardLayout (wrapped in Suspense) so it is present on
// every dashboard page without requiring per-route wiring.

'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

export function DraftPostToast() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('draft') !== '1') return

    toast.info('Post is not published yet — publish it to view it in a page.', {
      duration: 6000,
    })

    // Remove ?draft=1 from the URL without a navigation so the toast
    // does not fire again on back/forward or manual refresh.
    try {
      const url = new URL(window.location.href)
      url.searchParams.delete('draft')
      window.history.replaceState({}, '', url.toString())
    } catch {
      // Ignore in environments where window is unavailable
    }
  // searchParams identity changes on every render in Next.js — depend on the
  // string value to avoid an infinite loop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('draft')])

  return null
}
