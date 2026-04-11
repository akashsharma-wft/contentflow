'use client'

// sanity/components/LanguageProvider.tsx
// Wraps the Studio layout so the active language persists across navigation.
// Also syncs with languageStore so the structure builder can read it.

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { setStudioLanguage } from '../lib/languageStore'
import type { Language } from '../lib/translations'

interface LanguageContextValue {
  currentLanguage: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  currentLanguage: 'en',
  setLanguage: () => {},
})

export function useStudioLanguage() {
  return useContext(LanguageContext)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en')

  const setLanguage = useCallback((lang: Language) => {
    setCurrentLanguage(lang)
    setStudioLanguage(lang)
  }, [])

  // Sync initial value into the module store on mount
  useEffect(() => {
    setStudioLanguage(currentLanguage)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}
