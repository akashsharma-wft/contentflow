// components/custom/ComponentRenderer.tsx
//
// Registry pattern: maps Sanity component documents → React components.
// Called by SectionRenderer when a dereferenced sections[] item has _type === 'component'.
//
// Only CONTENT BLOCK component types are handled here.
// Layout chrome (navbar, footer, sidebar, mobile nav) is NOT part of the
// component document system — it lives in Site Config as inline config data
// and is rendered by the built-in Next.js layout components.
//
// HOW TO ADD A NEW CONTENT COMPONENT TYPE:
//   1. Add componentType option to sanity/schemaTypes/documents/component.ts
//   2. Add content sub-object field file in sanity/schemaTypes/components/contentComponents/
//   3. Add field to SECTIONS_PROJECTION in lib/sanity/queries.ts
//   4. Create renderer: components/custom/content/MyComponent.tsx
//   5. Add case below
//   6. Add TypeScript type to types/sanity.ts

import type { SanityComponentDoc } from '@/types/sanity'

import { FormComponent }         from './content/FormComponent'
import { GridComponent }         from './content/GridComponent'
import { CardsComponent }        from './content/CardsComponent'
import { PricingTableComponent } from './content/PricingTableComponent'
import { DataTableComponent }    from './content/DataTableComponent'
import { ListComponent }         from './content/ListComponent'
import { FlexComponent }         from './content/FlexComponent'

// ─────────────────────────────────────────────────────────────────────────────

interface ComponentRendererProps {
  component: SanityComponentDoc
  lang?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComp = any

export function ComponentRenderer({ component, lang: _lang = 'en' }: ComponentRendererProps) {
  const c = component as AnyComp

  switch (c.componentType as string) {
    case 'form':         return <FormComponent         component={c.form         ?? {}} />
    case 'grid':         return <GridComponent         component={c.grid         ?? {}} />
    case 'cards':        return <CardsComponent        component={c.cards        ?? {}} />
    case 'pricingTable': return <PricingTableComponent component={c.pricingTable ?? {}} />
    case 'dataTable':    return <DataTableComponent    component={c.dataTable    ?? {}} />
    case 'list':         return <ListComponent         component={c.list         ?? {}} />
    case 'flex':         return <FlexComponent         component={c.flex         ?? {}} />

    default:
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[ComponentRenderer] Unknown componentType: "${c.componentType}" on component doc "${c._id}"`)
      }
      return null
  }
}
