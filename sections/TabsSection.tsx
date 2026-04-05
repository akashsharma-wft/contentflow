'use client'
import { useState } from 'react'
import Image from 'next/image'
import imageUrlBuilder from '@sanity/image-url'
import { createClient } from 'next-sanity'
import { PortableText } from '@portabletext/react'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
})
const builder = imageUrlBuilder(client)
type SanityImg = { asset: { _ref: string } }
function urlFor(src: SanityImg) { return builder.image(src) }

interface Tab {
  _key?: string
  label: string
  icon?: string
  content?: unknown[]
  image?: SanityImg
}

interface TabsSectionProps {
  section: {
    heading?: string
    tabs?: Tab[]
  }
}

export function TabsSection({ section }: TabsSectionProps) {
  const { heading, tabs = [] } = section
  const [active, setActive] = useState(0)
  const current = tabs[active]

  return (
    <section className="py-16 px-6 bg-[#0d0e14]">
      <div className="max-w-5xl mx-auto">
        {heading && <h2 className="text-3xl font-bold text-white text-center mb-10">{heading}</h2>}

        {/* Tab bar */}
        <div className="flex flex-wrap gap-1 bg-white/4 border border-white/8 rounded-xl p-1 mb-8 w-fit mx-auto">
          {tabs.map((tab, i) => (
            <button
              key={tab._key ?? i}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active === i
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {current && (
          <div className="border border-white/8 rounded-2xl p-8 bg-white/2">
            {current.image?.asset && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-6">
                <Image
                  src={urlFor(current.image).width(1000).url()}
                  alt={current.label}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {current.content && (
              <div className="prose prose-invert prose-sm max-w-none text-white/70">
                <PortableText value={current.content as Parameters<typeof PortableText>[0]['value']} />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
