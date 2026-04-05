'use client'
import { useState } from 'react'
import Image from 'next/image'
import imageUrlBuilder from '@sanity/image-url'
import { createClient } from 'next-sanity'
import { X } from 'lucide-react'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
})
const builder = imageUrlBuilder(client)
type SanityImg = { asset: { _ref: string } }
function urlFor(source: SanityImg) { return builder.image(source) }

interface GalleryImage { _key?: string; image: SanityImg; alt: string; caption?: string }

interface GallerySectionProps {
  section: {
    heading?: string
    images?: GalleryImage[]
    layout?: 'grid' | 'masonry' | 'carousel'
    columns?: 2 | 3 | 4
    lightbox?: boolean
  }
}

const colClass: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
}

export function GallerySection({ section }: GallerySectionProps) {
  const { heading, images = [], columns = 3, lightbox = true } = section
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  return (
    <section className="py-16 px-6 bg-[#0d0e14]">
      <div className="max-w-6xl mx-auto">
        {heading && <h2 className="text-3xl font-bold text-white text-center mb-10">{heading}</h2>}

        <div className={`grid gap-4 ${colClass[columns]}`}>
          {images.map((img, i) => (
            <button
              key={img._key ?? i}
              onClick={() => lightbox && setActiveIdx(i)}
              className={`relative aspect-square overflow-hidden rounded-xl group ${lightbox ? 'cursor-zoom-in' : 'cursor-default'}`}
            >
              <Image
                src={urlFor(img.image).width(600).url()}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs">{img.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && activeIdx !== null && images[activeIdx] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActiveIdx(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white p-2"
            onClick={() => setActiveIdx(null)}
          >
            <X size={24} />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-3xl px-4 py-2"
            onClick={(e) => { e.stopPropagation(); setActiveIdx((idx: number | null) => idx !== null && idx > 0 ? idx - 1 : images.length - 1) }}
          >
            ‹
          </button>
          <div className="relative max-w-4xl w-full max-h-[80vh] aspect-video" onClick={(e) => e.stopPropagation()}>
            <Image
              src={urlFor(images[activeIdx].image).width(1600).url()}
              alt={images[activeIdx].alt}
              fill
              className="object-contain"
            />
          </div>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-3xl px-4 py-2"
            onClick={(e) => { e.stopPropagation(); setActiveIdx((idx: number | null) => idx !== null && idx < images.length - 1 ? idx + 1 : 0) }}
          >
            ›
          </button>
          {images[activeIdx].caption && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
              {images[activeIdx].caption}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
