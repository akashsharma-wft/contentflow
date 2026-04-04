export const dynamic = 'force-dynamic'

export { metadata, viewport } from 'next-sanity/studio'

import { StudioClient } from './_StudioClient'

export default function StudioPage() {
  return <StudioClient />
}
