// sanity/components/LanguageProvider.tsx
//
// Wraps the Studio layout with a language context so that the active
// language (chosen from the top-bar dropdown) persists across navigation.
// This is the component shown in the screenshot:
//   layout: props => <LanguageProvider>{props.renderDefault(props)}</LanguageProvider>
//
// The @sanity/document-internationalization plugin reads this context and
// automatically filters document lists to the selected language.

'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

type Lang = 'en' | 'hi' | 'kn'

interface LanguageContextValue {
  currentLanguage: Lang
  setLanguage: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  currentLanguage: 'en',
  setLanguage: () => {},
})

export function useStudioLanguage() {
  return useContext(LanguageContext)
}

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Lang>('en')

  const setLanguage = useCallback((lang: Lang) => {
    setCurrentLanguage(lang)
  }, [])

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}