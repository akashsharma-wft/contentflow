// sections/PostDetailPageSection.tsx
// Server component — renders a full post detail page with comments, related posts, etc.

import { Suspense } from 'react'
import type { PostDetailPageSection as PostDetailPageSectionType } from '@/types/sanity'

interface Props {
  section: PostDetailPageSectionType
}

export async function PostDetailPageSection({ section }: Props) {
  return (
    <div className="w-full">
      <Suspense fallback={<div>Loading post detail...</div>}>
        <div className="prose dark:prose-invert max-w-4xl mx-auto">
          {/* Post detail content would be rendered here */}
          {section?.heading && (
            <h1 className="text-4xl font-bold mb-4">{section.heading}</h1>
          )}
          {section?.description && (
            <p className="text-lg text-white/70 mb-8">{section.description}</p>
          )}
          
          {/* TODO: Add comments and related posts sections */}
          <div className="mt-12 pt-8 border-t border-white/10 text-white/50">
            <p>Post detail content coming soon</p>
          </div>
        </div>
      </Suspense>
    </div>
  )
}
