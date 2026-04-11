'use client'

// sanity/components/StudioToolMenu.tsx
//
// Replaces the Studio tool-menu row (the bar that shows Structure / Vision /
// Presentation tabs) so we can inject the language switcher directly adjacent
// to those tabs — matching the reference UX where the dropdown sits inline
// with the tool tabs rather than pinned to the far-right of the navbar.
//
// Only shown in the 'topbar' context (not the collapsed sidebar variant).

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ToolMenuProps } from 'sanity'
import { setStudioLanguage, getStudioLanguage } from '../lib/languageStore'
import type { Language } from '../lib/translations'

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'hi', label: 'Hindi',   flag: '🇮🇳' },
  { value: 'kn', label: 'Kannada', flag: '🇮🇳' },
]

export function StudioToolMenu(props: ToolMenuProps) {
  const [lang, setLang] = useState<Language>(getStudioLanguage())
  const [open, setOpen] = useState(false)
  const dropdownRef     = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const handleSelect = useCallback((next: Language) => {
    setOpen(false)
    if (next === lang) return
    setLang(next)
    setStudioLanguage(next)
    window.location.reload()
  }, [lang])

  const active = LANGUAGES.find((l) => l.value === lang)!

  // In the sidebar context, just render the default — no language switcher needed there
  if (props.context === 'sidebar') {
    return props.renderDefault(props)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {/* Default tool tabs — Structure, Vision, Presentation */}
      {props.renderDefault(props)}

      {/* Separator */}
      <div style={separatorStyle} />

      {/* Language switcher — inline with tool tabs */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={btnStyle}
          title="Switch content language"
        >
          <span>{active.flag}</span>
          <span>{active.label}</span>
          <span style={{ opacity: 0.55, fontSize: 10, marginLeft: 2 }}>▾</span>
        </button>

        {open && (
          <div style={menuStyle}>
            {LANGUAGES.map(({ value, label, flag }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleSelect(value)}
                style={{
                  ...menuItemStyle,
                  ...(lang === value ? menuItemActiveStyle : {}),
                }}
              >
                <span>{flag}</span>
                <span>{label}</span>
                {lang === value && (
                  <span style={{ marginLeft: 'auto', opacity: 0.55, fontSize: 11 }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const separatorStyle: React.CSSProperties = {
  width:       1,
  height:      20,
  background:  'rgba(255,255,255,0.12)',
  marginLeft:  6,
  marginRight: 6,
  flexShrink:  0,
  alignSelf:   'center',
}

const btnStyle: React.CSSProperties = {
  display:      'inline-flex',
  alignItems:   'center',
  gap:          6,
  padding:      '5px 12px',
  borderRadius: 6,
  border:       '1px solid rgba(255,255,255,0.12)',
  background:   'rgba(255,255,255,0.06)',
  color:        'var(--card-fg-color, #e5e7eb)',
  fontSize:     13,
  fontWeight:   500,
  cursor:       'pointer',
  whiteSpace:   'nowrap',
  lineHeight:   '22px',
  letterSpacing: '0.01em',
  transition:   'background 0.15s',
}

const menuStyle: React.CSSProperties = {
  position:     'absolute',
  top:          'calc(100% + 8px)',
  left:         0,
  minWidth:     160,
  borderRadius: 8,
  border:       '1px solid rgba(255,255,255,0.10)',
  background:   'var(--card-bg-color, #1a1b23)',
  boxShadow:    '0 8px 28px rgba(0,0,0,0.5)',
  zIndex:       9999,
  overflow:     'hidden',
  padding:      '6px 0',
}

const menuItemStyle: React.CSSProperties = {
  display:     'flex',
  alignItems:  'center',
  gap:         8,
  width:       '100%',
  padding:     '9px 14px',
  background:  'transparent',
  border:      'none',
  color:       'var(--card-fg-color, #e5e7eb)',
  fontSize:    13,
  lineHeight:  '20px',
  cursor:      'pointer',
  textAlign:   'left',
  transition:  'background 0.1s',
}

const menuItemActiveStyle: React.CSSProperties = {
  background: 'rgba(99,102,241,0.15)',
  color:      'var(--card-fg-color, #a5b4fc)',
  fontWeight: 600,
}
