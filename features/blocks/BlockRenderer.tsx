import { HeroBlock } from './HeroBlock'
import { FeaturedPostsBlock } from './FeaturedPostsBlock'
import { RecentPostsBlock } from './RecentPostsBlock'
import { CtaBlock, StatsBlock, RichTextBlock } from './blocks'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Block = Record<string, any>

interface BlockRendererProps {
  sections: Block[]
}

export function BlockRenderer({ sections }: BlockRendererProps) {
  if (!sections?.length) return null

  return (
    <>
      {sections.map((block) => {
        const key = block._key ?? block._type
        switch (block._type) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          case 'heroSection':        return <HeroBlock key={key} block={block as any} />
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          case 'featuredPostsSection': return <FeaturedPostsBlock key={key} block={block as any} />
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          case 'recentPostsSection': return <RecentPostsBlock key={key} block={block as any} />
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          case 'ctaSection':         return <CtaBlock key={key} block={block as any} />
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          case 'statsSection':       return <StatsBlock key={key} block={block as any} />
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          case 'richTextSection':    return <RichTextBlock key={key} block={block as any} />
          default:
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[BlockRenderer] Unknown block type: ${block._type}`)
            }
            return null
        }
      })}
    </>
  )
}
