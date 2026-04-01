import { sanityClient } from '@/lib/sanity/client'
import { PAGE_BY_SLUG_QUERY } from '@/lib/sanity/queries'
import { BlockRenderer } from '@/features/blocks/BlockRenderer'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const slugStr = slug.join('/')
  const page = await sanityClient.fetch(PAGE_BY_SLUG_QUERY, { slug: slugStr })
  return {
    title: page?.seoTitle ?? `${slugStr} — ContentFlow`,
    description: page?.seoDescription,
  }
}

export default async function CatchAllPage({ params }: PageProps) {
  const { slug } = await params
  const slugStr = slug.join('/')
  if (slugStr.startsWith('_next') || slugStr.startsWith('api')) notFound()
  const page = await sanityClient.fetch(PAGE_BY_SLUG_QUERY, { slug: slugStr })
  if (!page) notFound()
  return <BlockRenderer sections={page.sections ?? []} />
}
