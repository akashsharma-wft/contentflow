'use client'

// sanity/components/StudioNavbar.tsx
// Minimal navbar wrapper — kept in case we need to add global navbar elements.
// Language switcher has been moved to StudioToolMenu so it sits inline
// with the Structure/Vision/Presentation tabs (toolMenu slot).

import { Flex, Box } from '@sanity/ui'
import type { NavbarProps } from 'sanity'

export function StudioNavbar(props: NavbarProps) {
  return (
    <Flex align="center" style={{ width: '100%', minWidth: 0 }}>
      <Box flex={1} style={{ minWidth: 0 }}>
        {props.renderDefault(props)}
      </Box>
    </Flex>
  )
}
