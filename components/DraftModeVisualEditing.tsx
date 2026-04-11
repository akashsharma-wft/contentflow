'use client'

// components/DraftModeVisualEditing.tsx
//
// Renders <VisualEditing /> only when the page is loaded inside the Sanity
// Presentation Tool's iframe (window.self !== window.top).
//
// WHY THIS GUARD IS NEEDED:
//   The Next.js draft-mode cookie (__prerender_bypass) persists after leaving
//   the Presentation Tool. On a normal browser visit, isDraftMode can still be
//   true — which previously caused VisualEditing to mount and its overlay engine
//   to scan stega-encoded text, drawing blue edit boundaries everywhere.
//
//   isMaybePreviewIframe() returns true only when the page is rendered inside
//   an iframe (i.e. inside the Presentation Tool). Outside that context it
//   returns false and this component renders nothing — even if draft mode is on.
//
// RESULT:
//   - Normal browsing (stale cookie): stega text is in the DOM but the overlay
//     engine never mounts → zero blue borders
//   - Presentation Tool: iframe detected, VisualEditing mounts with full stega
//     support → click-to-edit overlays, "Documents on page", live sync all work

import { useEffect, useState } from 'react'
import { VisualEditing } from 'next-sanity/visual-editing'

export function DraftModeVisualEditing() {
  const [inFrame, setInFrame] = useState(false)

  useEffect(() => {
    // isMaybePreviewIframe() === window.self !== window.top
    // Evaluated client-side after mount so SSR always renders nothing (correct).
    setInFrame(window.self !== window.top)
  }, [])

  if (!inFrame) return null
  return <VisualEditing />
}
