import { sanityClient } from '@/lib/sanity/client'
import { PAGE_BY_SLUG_QUERY, POST_COUNT_QUERY } from '@/lib/sanity/queries'
import { BlockRenderer } from '@/features/blocks/BlockRenderer'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityClient.fetch(PAGE_BY_SLUG_QUERY, { slug: 'home' })
  return {
    title: page?.seoTitle ?? 'ContentFlow — Engineering CMS',
    description: page?.seoDescription ?? 'CMS-driven publishing for engineering teams.',
  }
}

export default async function HomePage() {
  const [page, postCount] = await Promise.all([
    sanityClient.fetch(PAGE_BY_SLUG_QUERY, { slug: 'home' }),
    sanityClient.fetch(POST_COUNT_QUERY),
  ])

  if (!page) notFound()

  const sectionsWithLiveData = (page.sections ?? []).map((block: Record<string, unknown>) => {
    if (block._type === 'statsSection' && block.useLivePostCount) {
      return { ...block, livePostCount: postCount ?? 0 }
    }
    return block
  })

  return <BlockRenderer sections={sectionsWithLiveData} />
}
