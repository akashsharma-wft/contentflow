// scripts/cleanup.ts
//
// Two-phase cleanup for the ContentFlow Sanity dataset after the
// section-doc architecture refactor.
//
// Usage:
//   npm run cleanup             → dry-run (shows what would be deleted, safe)
//   npm run cleanup -- --force  → actually delete legacy docs + patch fields
//
// Phase 1 — field patches (always runs):
//   page:       unset isPublic, adminOnly, enablePosthogTracking
//   page:       strip inline section objects (keep only {_type:'reference'} entries)
//   section:    unset legacy components[]
//   siteConfig: unset enablePosthogTracking, posthogKey
//
// Phase 2 — legacy doc deletion (runs only with --force):
//   Deletes page documents whose _id is NOT in the 21 stable IDs.
//   Deletes siteConfig documents whose _id is NOT in the 3 stable IDs.
//   Draft variants (drafts.XXX) of deleted published docs are also removed.
//
// Stable IDs
//   Pages:      page-{slug}-{lang}  (7 pages × 3 langs = 21)
//   SiteConfig: site-config         (1 — single language-agnostic document)

import { createClient } from '@sanity/client'

// ── Client ────────────────────────────────────────────────────────────────────

const client = createClient({
  projectId:  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'h2zl7fu3',
  dataset:    process.env.NEXT_PUBLIC_SANITY_DATASET    ?? 'production',
  apiVersion: '2024-01-01',
  token:      process.env.SANITY_API_TOKEN ?? process.env.SANITY_AUTH_TOKEN,
  useCdn:     false,
})

const FORCE = process.argv.includes('--force')

// ── Stable ID sets ────────────────────────────────────────────────────────────

const PAGE_SLUGS  = ['home', 'login', 'signup', 'posts', 'settings', 'billing', 'admin']
const LANGS       = ['en', 'hi', 'kn']

const STABLE_PAGE_IDS = new Set<string>(
  PAGE_SLUGS.flatMap((slug) => LANGS.map((lang) => `page-${slug}-${lang}`)),
)

const STABLE_SITE_CONFIG_IDS = new Set<string>(['site-config'])

// ── Helpers ───────────────────────────────────────────────────────────────────

function draftId(id: string) { return `drafts.${id}` }

async function deleteDoc(id: string, label: string) {
  if (FORCE) {
    await client.delete(id).catch((err: Error) => {
      if (!err.message.includes('not found')) {
        console.warn(`   ⚠  could not delete ${id}: ${err.message}`)
      }
    })
    console.log(`   🗑  deleted  ${label}  (${id})`)
  } else {
    console.log(`   ○  would delete  ${label}  (${id})`)
  }
}

async function unsetFields(docType: string, fields: string[], extraFilter = '') {
  const filter = `_type == "${docType}"${extraFilter ? ` && ${extraFilter}` : ''}`
  const docs   = await client.fetch<{ _id: string }[]>(`*[${filter}] { _id }`)

  if (docs.length === 0) {
    console.log(`   (no ${docType} docs to patch)`)
    return 0
  }

  let count = 0
  for (const doc of docs) {
    if (FORCE) {
      await client.patch(doc._id).unset(fields).commit({ autoGenerateArrayKeys: false })
        .catch((err: Error) => console.warn(`   ⚠  ${doc._id}: ${err.message}`))
    }
    count++
  }

  const verb = FORCE ? 'patched' : 'would patch'
  console.log(`   ${FORCE ? '✓' : '○'}  ${verb} ${count} ${docType} doc(s) — unset [${fields.join(', ')}]`)
  return count
}

// ── Phase 1: field patches ────────────────────────────────────────────────────

async function patchPageLegacyFlags() {
  console.log('\n📄  Page — legacy flag fields')
  await unsetFields('page', ['isPublic', 'adminOnly', 'enablePosthogTracking'])
}

async function patchInlineSections() {
  console.log('\n📦  Page — strip inline section objects from sections[]')
  console.log('    (keep only {_type:"reference"} entries)')

  const pages = await client.fetch<{ _id: string; sections?: { _type: string }[] }[]>(
    `*[_type == "page" && defined(sections)] { _id, sections }`,
  )

  let count = 0
  for (const page of pages) {
    const hasInline = (page.sections ?? []).some((s) => s._type !== 'reference')
    if (!hasInline) continue

    const refsOnly = (page.sections ?? []).filter((s) => s._type === 'reference')
    if (FORCE) {
      await client.patch(page._id).set({ sections: refsOnly }).commit({ autoGenerateArrayKeys: false })
        .catch((err: Error) => console.warn(`   ⚠  ${page._id}: ${err.message}`))
    }
    count++
  }

  if (count === 0) {
    console.log('   (no inline sections found — already clean)')
  } else {
    const verb = FORCE ? 'stripped' : 'would strip'
    console.log(`   ${FORCE ? '✓' : '○'}  ${verb} inline sections from ${count} page(s)`)
  }
}

async function patchSectionComponents() {
  console.log('\n🧩  Section — legacy components[] field')
  await unsetFields('section', ['components'])
}

async function patchSiteConfigLegacy() {
  console.log('\n⚙️  SiteConfig — legacy tracking fields')
  await unsetFields('siteConfig', ['enablePosthogTracking', 'posthogKey'])
}

// ── Phase 2: legacy doc deletion ──────────────────────────────────────────────

async function deleteLegacyPages() {
  console.log('\n🗑   Page — delete docs outside stable IDs')

  // Fetch all page documents (excluding drafts)
  const all = await client.fetch<{ _id: string; title?: string; language?: string; 'slug': { current?: string } | undefined }[]>(
    `*[_type == "page" && !(_id in path("drafts.**"))] { _id, title, language, slug }`,
  )

  const toDelete = all.filter((d) => !STABLE_PAGE_IDS.has(d._id))

  if (toDelete.length === 0) {
    console.log('   (no legacy page docs found)')
    return
  }

  for (const doc of toDelete) {
    const label = `${doc.title ?? 'Untitled'} [${doc.language ?? '?'}] slug:${doc.slug?.current ?? '?'}`
    await deleteDoc(doc._id, label)
    // Also remove the draft variant if it exists
    await deleteDoc(draftId(doc._id), `draft of ${label}`)
  }

  if (!FORCE) {
    console.log(`\n   ℹ  ${toDelete.length} legacy page doc(s) flagged. Re-run with --force to delete.`)
  }
}

async function deleteLegacySiteConfigs() {
  console.log('\n🗑   SiteConfig — delete docs outside stable IDs')

  const all = await client.fetch<{ _id: string; title?: string; language?: string }[]>(
    `*[_type == "siteConfig" && !(_id in path("drafts.**"))] { _id, title, language }`,
  )

  const toDelete = all.filter((d) => !STABLE_SITE_CONFIG_IDS.has(d._id))

  if (toDelete.length === 0) {
    console.log('   (no legacy siteConfig docs found)')
    return
  }

  for (const doc of toDelete) {
    const label = `${doc.title ?? 'Untitled'} [${doc.language ?? '?'}]`
    await deleteDoc(doc._id, label)
    await deleteDoc(draftId(doc._id), `draft of ${label}`)
  }

  if (!FORCE) {
    console.log(`\n   ℹ  ${toDelete.length} legacy siteConfig doc(s) flagged. Re-run with --force to delete.`)
  }
}

// ── Slug conflict check ───────────────────────────────────────────────────────

async function checkSlugConflicts() {
  console.log('\n🔍  Slug conflict check (same slug + language)')

  const pages = await client.fetch<{ _id: string; slug: string; language: string }[]>(
    `*[_type == "page" && !(_id in path("drafts.**"))] {
      _id,
      "slug": slug.current,
      language
    }`,
  )

  const seen = new Map<string, string[]>()
  for (const p of pages) {
    const key = `${p.slug}::${p.language}`
    const ids = seen.get(key) ?? []
    ids.push(p._id)
    seen.set(key, ids)
  }

  let conflicts = 0
  for (const [key, ids] of seen) {
    if (ids.length > 1) {
      const [slug, lang] = key.split('::')
      console.log(`   ⚠  slug "${slug}" [${lang}] → ${ids.join(', ')}`)
      conflicts++
    }
  }

  if (conflicts === 0) {
    console.log('   ✓ no slug conflicts')
  } else {
    console.log(`\n   ${conflicts} conflict(s) found. Run with --force to delete the legacy duplicates.`)
  }

  return conflicts
}

// ── Preview URL table ─────────────────────────────────────────────────────────

function printPreviewTable() {
  console.log('\n🔗  Preview URL mapping (NEXT_PUBLIC_APP_URL = process.env or localhost:3000)')

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const cases: [string, string, string][] = [
    ['home',     'en', '/'],
    ['home',     'hi', '/hi'],
    ['home',     'kn', '/kn'],
    ['login',    'en', '/login'],
    ['login',    'hi', '/hi/login'],
    ['signup',   'kn', '/kn/signup'],
    ['posts',    'en', '/posts'],
    ['settings', 'en', '/settings'],
    ['billing',  'hi', '/hi/billing'],
    ['admin',    'en', '/admin'],
  ]

  for (const [slug, lang, expected] of cases) {
    const isHome = slug === 'home'
    const prefix = lang !== 'en' ? `/${lang}` : ''
    const path   = isHome ? (prefix || '/') : `${prefix}/${slug}`
    const url    = `${APP_URL}${path}`
    const ok     = path === expected
    console.log(`   ${ok ? '✓' : '✗'}  ${slug.padEnd(9)} [${lang}]  →  ${url}${ok ? '' : `  (expected ${APP_URL}${expected})`}`)
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🧹  ContentFlow Sanity Cleanup')
  console.log(`   project : ${client.config().projectId}`)
  console.log(`   dataset : ${client.config().dataset}`)
  console.log(`   mode    : ${FORCE ? '🔴 FORCE — changes will be applied' : '🟡 DRY RUN — no changes (pass --force to apply)'}`)

  // ── Phase 1: patches ────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Phase 1 — field patches')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  await patchPageLegacyFlags()
  await patchInlineSections()
  await patchSectionComponents()
  await patchSiteConfigLegacy()

  // ── Phase 2: deletions ──────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Phase 2 — legacy document deletion')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  await deleteLegacyPages()
  await deleteLegacySiteConfigs()

  // ── Diagnostics ─────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Diagnostics')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  await checkSlugConflicts()
  printPreviewTable()

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  if (FORCE) {
    console.log('✅  Cleanup complete.')
    console.log('   Next: run `npm run sanity-seed` to ensure section docs exist.\n')
  } else {
    console.log('✅  Dry-run complete — no changes made.')
    console.log('   Re-run with --force to apply all patches and deletions.')
    console.log('   Then run `npm run sanity-seed` to ensure section docs exist.\n')
  }
}

main().catch((err: Error) => {
  console.error('\n❌  Cleanup failed:', err.message ?? err)
  process.exit(1)
})
