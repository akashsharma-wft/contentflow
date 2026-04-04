/**
 * scripts/cleanup.ts
 *
 * Deletes all documents seeded by seed.ts
 * Run before seeding fresh: npm run cleanup
 */

import 'dotenv/config'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
})

const DOCUMENT_IDS = [
  // Singletons
  'siteConfig',
  'authConfig',
  // Home pages
  'page-home-en',
  'page-home-hi',
  'page-home-kn',
  // English posts
  'post-en-1',
  'post-en-2',
  'post-en-3',
  'post-en-4',
  'post-en-5',
  'post-en-6',
  // Hindi posts
  'post-hi-1',
  'post-hi-2',
  // Kannada posts
  'post-kn-1',
  'post-kn-2',
]

async function cleanup() {
  console.log('\n🗑️  Cleaning up seeded documents...\n')
  console.log(`Project : ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`)
  console.log(`Dataset : ${process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'}\n`)

  if (!process.env.SANITY_API_TOKEN) {
    console.error('❌  SANITY_API_TOKEN is missing. Add it to .env.local and try again.')
    process.exit(1)
  }

  try {
    let deleted = 0
    for (const id of DOCUMENT_IDS) {
      try {
        await client.delete(id)
        console.log(`  ✓ Deleted: ${id}`)
        deleted++
      } catch (err: any) {
        if (err?.statusCode === 404) {
          console.log(`  ⊘ Not found: ${id}`)
        } else {
          throw err
        }
      }
    }

    console.log(`\n✅  Cleanup complete! Deleted ${deleted} documents.\n`)
  } catch (err) {
    console.error('❌  Cleanup failed:', err)
    process.exit(1)
  }
}

cleanup()
