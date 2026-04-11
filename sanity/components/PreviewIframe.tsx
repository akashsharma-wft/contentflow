'use client'

// sanity/components/PreviewIframe.tsx
//
// Preview tab component for page documents.
// Uses DocumentViewProps API (NOT useFormValue — that requires FormValueProvider context
// which is not available inside structure view components).
//
// URL mapping:
//   home   / en  → /
//   home   / hi  → /hi
//   home   / kn  → /kn
//   login  / en  → /login
//   login  / hi  → /hi/login
//   signup / kn  → /kn/signup
//   posts  / en  → /posts    (same for settings, billing, admin)

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SanityDocument } from 'sanity'

// Props shape emitted by S.view.component() — matches UserViewComponent from sanity/structure.
interface PreviewIframeProps {
  document: {
    displayed: Partial<SanityDocument>
  }
  documentId: string
}

const APP_URL: string =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL)
    ? (process.env.NEXT_PUBLIC_APP_URL as string)
    : 'http://localhost:3000'

// ── URL builder ───────────────────────────────────────────────────────────────

function buildPreviewUrl(slug: string | undefined, lang: string | undefined): string | null {
  if (!slug) return null

  const isHome = slug === 'home'
  const prefix = lang && lang !== 'en' ? `/${lang}` : ''

  const path = isHome
    ? (prefix || '/')
    : `${prefix}/${slug}`

  return `${APP_URL}${path}`
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PreviewIframe({ document }: PreviewIframeProps) {
  // Use the displayed (draft-aware) document data passed directly via props.
  // This avoids useFormValue which requires a FormValueProvider context.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const displayed = document.displayed as any

  const slug = displayed?.slug?.current as string | undefined
  const lang = displayed?.language as string | undefined

  const url = buildPreviewUrl(slug, lang)

  const iframeRef   = useRef<HTMLIFrameElement>(null)
  const [key, setKey] = useState(0)

  useEffect(() => { setKey((k) => k + 1) }, [slug, lang])

  const reload = useCallback(() => setKey((k) => k + 1), [])

  if (!url) {
    return (
      <div style={styles.empty}>
        <span style={{ fontSize: 32, marginBottom: 8 }}>👁</span>
        <span>Save the document first to see a preview.</span>
      </div>
    )
  }

  return (
    <div style={styles.wrapper}>

      {/* ── Toolbar ── */}
      <div style={styles.toolbar}>
        <code style={styles.urlText}>{url}</code>

        <button
          type="button"
          onClick={reload}
          title="Reload preview"
          style={styles.toolbarBtn}
        >
          ↻
        </button>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in new tab"
          style={{ ...styles.toolbarBtn, textDecoration: 'none' }}
        >
          ↗
        </a>
      </div>

      {/* ── Draft mode hint ── */}
      <div style={styles.draftHint}>
        💡 For live draft preview, use the <strong>Presentation</strong> tool in the top toolbar.
      </div>

      {/* ── Preview iframe ── */}
      <iframe
        key={key}
        ref={iframeRef}
        src={url}
        title="Page preview"
        style={styles.iframe}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />

    </div>
  )
}

// ── Inline styles ─────────────────────────────────────────────────────────────

const styles = {
  wrapper: {
    display:       'flex' as const,
    flexDirection: 'column' as const,
    height:        '100%',
    background:    '#0d0e14',
  },
  empty: {
    display:        'flex' as const,
    flexDirection:  'column' as const,
    alignItems:     'center' as const,
    justifyContent: 'center' as const,
    height:         '100%',
    gap:            8,
    color:          '#666',
    fontSize:       14,
    fontFamily:     'system-ui, sans-serif',
  },
  toolbar: {
    display:         'flex' as const,
    alignItems:      'center' as const,
    gap:             6,
    padding:         '5px 10px',
    borderBottom:    '1px solid rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(0,0,0,0.35)',
    flexShrink:      0,
  },
  urlText: {
    flex:        1,
    fontSize:    11,
    color:       '#aaa',
    fontFamily:  'monospace',
    overflow:    'hidden' as const,
    textOverflow:'ellipsis' as const,
    whiteSpace:  'nowrap' as const,
  },
  toolbarBtn: {
    display:        'inline-flex' as const,
    alignItems:     'center' as const,
    justifyContent: 'center' as const,
    width:          26,
    height:         26,
    borderRadius:   4,
    border:         '1px solid rgba(255,255,255,0.12)',
    background:     'rgba(255,255,255,0.06)',
    color:          '#ccc',
    fontSize:       14,
    cursor:         'pointer' as const,
    flexShrink:     0,
    lineHeight:     1,
  },
  draftHint: {
    padding:         '4px 12px',
    fontSize:        11,
    color:           '#666',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderBottom:    '1px solid rgba(255,255,255,0.04)',
    flexShrink:      0,
    fontFamily:      'system-ui, sans-serif',
  },
  iframe: {
    flex:   1,
    width:  '100%',
    border: 'none',
  },
}
