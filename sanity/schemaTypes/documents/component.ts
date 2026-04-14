// sanity/schemaTypes/documents/component.ts
//
// Reusable component document — one doc per component instance per language.
//
// Architecture (mirrors section.ts):
//   • `componentType` is the discriminator
//   • Content fields are defined in schemaTypes/components/{layout,content}Components/
//     and spread in here — one named sub-object per component type.
//   • Pages store `sections[]` as mixed references to `section` OR `component` docs.
//   • GROQ dereferences with `sections[]->` — _type === 'component' identifies these.
//
// Component types:
//   Layout chrome : navbar | footer | sidebar | mobileNavTop | mobileNavBottom
//   Content blocks: form | grid | cards | pricingTable | dataTable | list | flex

import { defineField, defineType } from 'sanity'
import {
  ComponentIcon,
  BarChartIcon,
  BulbOutlineIcon,
  UlistIcon,
  InlineIcon,
} from '@sanity/icons'
import { getStudioLanguage } from '../../lib/languageStore'
import {
  formComponentFields,
  gridComponentFields,
  cardsComponentFields,
  pricingComponentFields,
  dataTableComponentFields,
  listComponentFields,
  flexComponentFields,
} from '../components'

// ── Shared option lists ────────────────────────────────────────────────────────

const LANGUAGE_OPTIONS = [
  { title: 'English',          value: 'en' },
  { title: 'Hindi — हिंदी',    value: 'hi' },
  { title: 'Kannada — ಕನ್ನಡ', value: 'kn' },
]

// Content block component types only.
// Layout chrome (navbar, footer, sidebar, mobile nav) is NOT managed here —
// it lives in Site Config as inline content/config data.
const COMPONENT_TYPE_OPTIONS = [
  { title: 'Form',          value: 'form'         },
  { title: 'Grid',          value: 'grid'         },
  { title: 'Cards',         value: 'cards'        },
  { title: 'Pricing Table', value: 'pricingTable' },
  { title: 'Data Table',    value: 'dataTable'    },
  { title: 'List',          value: 'list'         },
  { title: 'Flex Layout',   value: 'flex'         },
]

// ── Component document ────────────────────────────────────────────────────────

export const componentType = defineType({
  name: 'component',
  title: 'Component',
  type: 'document',
  icon: ComponentIcon,

  fields: [
    // ── Identity ──────────────────────────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Internal Name',
      description: 'Used only inside Studio (not shown on the site)',
      type: 'string',
      validation: R => R.required(),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      initialValue: () => getStudioLanguage(),
      options: { list: LANGUAGE_OPTIONS, layout: 'radio' },
      validation: R => R.required(),
    }),
    defineField({
      name: 'componentType',
      title: 'Component Type',
      description: 'Determines which config fields are shown below.',
      type: 'string',
      options: { list: COMPONENT_TYPE_OPTIONS },
      validation: R => R.required(),
    }),

    // ── Content block fields ──────────────────────────────────────────────────
    // Layout chrome fields (navbar/footer/sidebar/mobile nav) are NOT here —
    // they are managed as inline config in the siteConfig singleton.
    ...formComponentFields,
    ...gridComponentFields,
    ...cardsComponentFields,
    ...pricingComponentFields,
    ...dataTableComponentFields,
    ...listComponentFields,
    ...flexComponentFields,
  ],

  // ── Studio preview ──────────────────────────────────────────────────────────
  preview: {
    select: {
      name:          'name',
      language:      'language',
      componentType: 'componentType',
    },
    prepare: ({ name, language, componentType: ct }: {
      name?: string; language?: string; componentType?: string
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const iconMap: Record<string, any> = {
        form:         InlineIcon,
        grid:         BulbOutlineIcon,
        cards:        BulbOutlineIcon,
        pricingTable: BarChartIcon,
        dataTable:    UlistIcon,
        list:         UlistIcon,
        flex:         InlineIcon,
      }
      const langTag = language?.toUpperCase() ?? '?'
      return {
        title:    `${name ?? 'Unnamed Component'}  ·  ${langTag}`,
        subtitle: ct ?? '—',
        media:    (ct && iconMap[ct]) ?? ComponentIcon,
      }
    },
  },
})
