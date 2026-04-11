'use client'

// sanity/components/StudioNavbar.tsx
// Replaces the default Studio navbar with a version that includes a
// language switcher (EN / HI / KN) pinned to the far right.
//
// On language change:
//   1. Calls setStudioLanguage() which persists to localStorage
//   2. Reloads the page so structure.ts re-evaluates with the new language

import { useCallback, useState } from 'react'
import { Flex, Box, Select, Text, Card } from '@sanity/ui'
import type { NavbarProps } from 'sanity'
import { setStudioLanguage, getStudioLanguage } from '../lib/languageStore'
import type { Language } from '../lib/translations'

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English'          },
  { value: 'hi', label: 'Hindi — हिंदी'    },
  { value: 'kn', label: 'Kannada — ಕನ್ನಡ' },
]

export function StudioNavbar(props: NavbarProps) {
  const [lang, setLang] = useState<Language>(getStudioLanguage())

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const next = event.target.value as Language
      setLang(next)
      setStudioLanguage(next)
      // Reload so structure.ts re-evaluates with the new language filter.
      window.location.reload()
    },
    [],
  )

  return (
    <Flex align="center" style={{ width: '100%', minWidth: 0 }}>
      {/* Default Studio navbar (logo, tools, user menu) — fills remaining space */}
      <Box flex={1} style={{ minWidth: 0 }}>
        {props.renderDefault(props)}
      </Box>

      {/* Language switcher — pinned to the right */}
      <Card
        padding={2}
        radius={2}
        tone="transparent"
        borderLeft
        style={{ flexShrink: 0, marginRight: '12px' }}
      >
        <Flex align="center" gap={2}>
          <Text size={1} muted weight="semibold">
            Lang:
          </Text>
          <Select
            value={lang}
            onChange={handleChange}
            fontSize={1}
            padding={2}
            radius={2}
            style={{ minWidth: '145px', cursor: 'pointer' }}
          >
            {LANGUAGES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Flex>
      </Card>
    </Flex>
  )
}
