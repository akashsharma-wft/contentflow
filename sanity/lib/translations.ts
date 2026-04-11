// sanity/lib/translations.ts
// Studio sidebar labels translated into all three supported languages.

export type Language = 'en' | 'hi' | 'kn'

export const translations = {
  en: {
    contentflow:    'ContentFlow',
    pages:          'Pages',
    posts:          'Posts',
    sections:       'Sections',
    pageSections:   'Page Sections',
    components:     'Components',
    basic:          'Basic',
    advanced:       'Advanced',
    siteConfig:     'Site Config',
  },
  hi: {
    contentflow:    'ContentFlow',
    pages:          'पृष्ठ',
    posts:          'पोस्ट',
    sections:       'अनुभाग',
    pageSections:   'पेज अनुभाग',
    components:     'घटक',
    basic:          'मूल',
    advanced:       'उन्नत',
    siteConfig:     'साइट कॉन्फिग',
  },
  kn: {
    contentflow:    'ContentFlow',
    pages:          'ಪುಟಗಳು',
    posts:          'ಪೋಸ್ಟ್‌ಗಳು',
    sections:       'ವಿಭಾಗಗಳು',
    pageSections:   'ಪೇಜ್ ವಿಭಾಗಗಳು',
    components:     'ಘಟಕಗಳು',
    basic:          'ಮೂಲ',
    advanced:       'ಸುಧಾರಿತ',
    siteConfig:     'ಸೈಟ್ ಕಾನ್ಫಿಗ್',
  },
} as const

export type TranslationKey = keyof typeof translations.en

/** Translate a key for the given language (falls back to English). */
export function t(key: TranslationKey, lang: Language = 'en'): string {
  return translations[lang]?.[key] ?? translations.en[key]
}
