import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { componentType?: string } }) =>
    !types.includes(parent?.componentType ?? ''),
})

export const cardsComponentFields = [

  defineField({
    name: 'cards',
    title: 'Cards Config',
    type: 'object',
    ...shownFor('cards'),
    fields: [
      defineField({ name: 'heading', title: 'Heading', type: 'string' }),
      defineField({
        name: 'layout', title: 'Layout', type: 'string',
        options: { list: [
          { title: 'Grid 2-up',   value: 'grid-2'     },
          { title: 'Grid 3-up',   value: 'grid-3'     },
          { title: 'Featured',    value: 'featured'   },
          { title: 'Horizontal',  value: 'horizontal' },
        ], layout: 'radio' },
        initialValue: 'grid-3',
      }),
      defineField({
        name: 'items', title: 'Cards', type: 'array',
        of: [{
          type: 'object',
          fields: [
            defineField({ name: 'heading',  title: 'Heading',   type: 'string', validation: R => R.required() }),
            defineField({ name: 'body',     title: 'Body',      type: 'text',  rows: 3 }),
            defineField({ name: 'badge',    title: 'Badge',     type: 'string' }),
            defineField({ name: 'image',    title: 'Image',     type: 'image', options: { hotspot: true } }),
            defineField({
              name: 'tags', title: 'Tags', type: 'array',
              of: [{ type: 'string' }],
              options: { layout: 'tags' },
            }),
            defineField({ name: 'ctaLabel', title: 'CTA Label', type: 'string' }),
            defineField({ name: 'ctaHref',  title: 'CTA URL',   type: 'string' }),
          ],
          preview: { select: { title: 'heading', subtitle: 'badge' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string, subtitle: v.subtitle as string }) },
        }],
      }),
    ],
  }),

]
