import { defineType, defineField } from 'sanity'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrepareValue = Record<string, any>

// ─── GRID SECTION ─────────────────────────────────────────────────────────────
// Flexible grid of cards. Each card has image, heading, body, optional link.
// Controlled: columns (2/3/4), gap, card style.
export const gridSection = defineType({
  name: 'gridSection',
  title: 'Grid Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string' }),
    defineField({ name: 'subheading', title: 'Subheading', type: 'string' }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'number',
      options: { list: [2, 3, 4], layout: 'radio' },
      initialValue: 3,
    }),
    defineField({
      name: 'items',
      title: 'Cards',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'body', title: 'Body', type: 'text', rows: 2 }),
          defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
          defineField({ name: 'icon', title: 'Icon name (Lucide)', type: 'string' }),
          defineField({ name: 'linkLabel', title: 'Link Label', type: 'string' }),
          defineField({ name: 'linkHref', title: 'Link URL', type: 'string' }),
        ],
        preview: { select: { title: 'heading' }, prepare: (value: PrepareValue) => ({ title: value.title }) },
      }],
    }),
    defineField({
      name: 'cardStyle',
      title: 'Card Style',
      type: 'string',
      options: { list: [
        { title: 'Bordered (dark)', value: 'bordered' },
        { title: 'Filled (subtle bg)', value: 'filled' },
        { title: 'Plain (no border)', value: 'plain' },
      ], layout: 'radio' },
      initialValue: 'bordered',
    }),
  ],
  preview: {
    select: { heading: 'heading', items: 'items' },
    prepare(value: PrepareValue) {
      return { title: `Grid: ${value.heading ?? 'Untitled'}`, subtitle: `${value.items?.length ?? 0} cards` }
    },
  },
})

// ─── COLUMNS SECTION ──────────────────────────────────────────────────────────
// 2-column layout. Left and right are arbitrary rich text blocks.
// Great for "feature left, image right" or "text left, text right" layouts.
export const columnsSection = defineType({
  name: 'columnsSection',
  title: 'Two Columns Section',
  type: 'object',
  fields: [
    defineField({
      name: 'left',
      title: 'Left Column',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'right',
      title: 'Right Column',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'ratio',
      title: 'Column Ratio',
      type: 'string',
      options: { list: [
        { title: '50 / 50', value: '1/1' },
        { title: '60 / 40', value: '3/2' },
        { title: '40 / 60', value: '2/3' },
        { title: '70 / 30', value: '7/3' },
      ], layout: 'radio' },
      initialValue: '1/1',
    }),
    defineField({ name: 'reverseOnMobile', title: 'Reverse order on mobile?', type: 'boolean', initialValue: false }),
  ],
  preview: { prepare: () => ({ title: 'Two Columns' }) },
})

// ─── SPACER SECTION ───────────────────────────────────────────────────────────
export const spacerSection = defineType({
  name: 'spacerSection',
  title: 'Spacer',
  type: 'object',
  fields: [
    defineField({
      name: 'size',
      title: 'Height',
      type: 'string',
      options: { list: [
        { title: 'Small (24px)', value: 'sm' },
        { title: 'Medium (48px)', value: 'md' },
        { title: 'Large (96px)', value: 'lg' },
        { title: 'XL (128px)', value: 'xl' },
      ], layout: 'radio' },
      initialValue: 'md',
    }),
  ],
  preview: { select: { size: 'size' }, prepare: (value: any) => ({ title: `Spacer (${value.size})` }) },
})

// ─── DIVIDER SECTION ──────────────────────────────────────────────────────────
export const dividerSection = defineType({
  name: 'dividerSection',
  title: 'Divider',
  type: 'object',
  fields: [
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      options: { list: [
        { title: 'Line', value: 'line' },
        { title: 'Dots', value: 'dots' },
        { title: 'Invisible (spacing only)', value: 'invisible' },
      ], layout: 'radio' },
      initialValue: 'line',
    }),
  ],
  preview: { select: { style: 'style' }, prepare: (value: any) => ({ title: `Divider (${value.style})` }) },
})
