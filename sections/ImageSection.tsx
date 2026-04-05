'use client'
import Image from 'next/image'
import imageUrlBuilder from '@sanity/image-url'
import { createClient } from 'next-sanity'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
})
const builder = imageUrlBuilder(client)
type SanityImg = { asset: { _ref: string } }
function urlFor(source: SanityImg) { return builder.image(source) }

// ─── IMAGE SECTION ────────────────────────────────────────────────────────────
interface ImageSectionProps {
  section: {
    image: SanityImg
    alt: string
    caption?: string
    maxWidth?: 'narrow' | 'medium' | 'wide' | 'full'
    rounded?: boolean
    shadow?: boolean
  }
}

const maxWidthClass: Record<string, string> = {
  narrow: 'max-w-xl',
  medium: 'max-w-3xl',
  wide: 'max-w-5xl',
  full: 'max-w-none',
}

export function ImageSection({ section }: ImageSectionProps) {
  const { image, alt, caption, maxWidth = 'wide', rounded = true, shadow = false } = section
  if (!image?.asset) return null
  return (
    <section className="py-12 px-6 bg-[#0d0e14]">
      <div className={`mx-auto ${maxWidthClass[maxWidth]}`}>
        <div className={`relative w-full aspect-video overflow-hidden ${rounded ? 'rounded-2xl' : ''} ${shadow ? 'shadow-2xl shadow-black/50' : ''}`}>
          <Image
            src={urlFor(image).width(1200).url()}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        </div>
        {caption && (
          <p className="text-center text-white/30 text-xs font-mono mt-3">{caption}</p>
        )}
      </div>
    </section>
  )
}
