// sanity/schemaTypes/index.ts
import { pageType }      from './documents/page'
import { postType }      from './documents/post'
import { sectionType }   from './documents/section'
import { componentType } from './documents/component'
import { siteConfig }    from './singletons/siteConfig'

export const schemaTypes = [
  // ── Documents ─────────────────────────────────────────────────────────────
  pageType,
  postType,
  sectionType,
  componentType,
  siteConfig,
]
