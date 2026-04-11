// sanity/lib/languageStore.ts
// Module-level language store.
// - Persisted in localStorage so it survives Studio reloads.
// - Synced from StudioNavbar on every language switch.
// - Read by structure.ts and schema initialValue functions.

import type { Language } from './translations'

const STORAGE_KEY = 'cf-studio-lang'

function readFromStorage(): Language {
  if (typeof localStorage === 'undefined') return 'en'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'hi' || stored === 'kn') return stored
  return 'en'
}

let _currentLanguage: Language = readFromStorage()

// ── Public API ───────────────────────────────────────────────────────────────

export function getStudioLanguage(): Language {
  return _currentLanguage
}

export function setStudioLanguage(lang: Language): void {
  if (_currentLanguage === lang) return
  _currentLanguage = lang
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang)
  }
  _listeners.forEach(fn => fn(lang))
}

// ── Listeners (for components that need to react to language changes) ─────────

type Listener = (lang: Language) => void
const _listeners = new Set<Listener>()

/** Subscribe to language changes. Returns an unsubscribe function. */
export function onLanguageChange(listener: Listener): () => void {
  _listeners.add(listener)
  return () => _listeners.delete(listener)
}
