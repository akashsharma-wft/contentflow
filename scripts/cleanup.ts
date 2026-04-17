/**
 * ContentFlow — Cleanup script
 * Removes all seed-generated documents from the Sanity dataset.
 * Usage: npx dotenv -e .env.local tsx scripts/cleanup.ts
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'h2zl7fu3',
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET    ?? 'production',
  apiVersion: '2024-01-01',
  token:      process.env.SANITY_API_TOKEN,
  useCdn:     false,
})

if (!process.env.SANITY_API_TOKEN) {
  console.error('❌  SANITY_API_TOKEN not set in .env.local')
  process.exit(1)
}

async function deleteByFilter(label: string, filter: string): Promise<number> {
  const docs = await client.fetch<{ _id: string }[]>(`*[${filter}]{ _id }`)
  if (docs.length === 0) {
    console.log(`   – 0 ${label} found, skipping`)
    return 0
  }
  const CHUNK = 200
  for (let i = 0; i < docs.length; i += CHUNK) {
    const tx = client.transaction()
    docs.slice(i, i + CHUNK).forEach(d => {
      tx.delete(d._id)
      tx.delete(`drafts.${d._id}`)
    })
    await tx.commit({ visibility: 'sync' })
  }
  console.log(`   ✓ deleted ${docs.length} ${label}`)
  return docs.length
}

async function main() {
  console.log('\n🧹  ContentFlow Cleanup Script')
  console.log(`   Project: ${client.config().projectId} / ${client.config().dataset}\n`)
  console.log('   Wiping ALL pages, sections, posts and site config...\n')

  // Wipe ALL docs of each type (not just seed-prefixed) to remove any stale docs from previous runs
  const posts      = await deleteByFilter('posts',       `_type == "post"      && !(_id in path("drafts.**"))`)
  const pages      = await deleteByFilter('pages',       `_type == "page"      && !(_id in path("drafts.**"))`)
  const sections   = await deleteByFilter('sections',    `_type == "section"   && !(_id in path("drafts.**"))`)
  const components = await deleteByFilter('components',  `_type == "component" && !(_id in path("drafts.**"))`)
  const config     = await deleteByFilter('site config', `_id == "site-config"`)

  const total = posts + pages + sections + components + config

  console.log('\n✅  Cleanup complete!')
  console.log('─'.repeat(40))
  console.log(`   Posts deleted      : ${posts}`)
  console.log(`   Pages deleted      : ${pages}`)
  console.log(`   Sections deleted   : ${sections}`)
  console.log(`   Components deleted : ${components}`)
  console.log(`   Config deleted     : ${config}`)
  console.log(`   Total              : ${total}`)
  console.log('─'.repeat(40))
  console.log()
}

main().catch(err => {
  console.error('❌  Cleanup failed:', err)
  process.exit(1)
})
