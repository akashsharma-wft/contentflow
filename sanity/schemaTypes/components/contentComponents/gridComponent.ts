import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { componentType?: string } }) =>
    !types.includes(parent?.componentType ?? ''),
})

export const gridComponentFields = [

  defineField({
    name: 'grid',
    title: 'Grid Config',
    type: 'object',
    ...shownFor('grid'),
    fields: [
      defineField({ name: 'heading',    title: 'Heading',    type: 'string' }),
      defineField({ name: 'subheading', title: 'Subheading', type: 'string' }),
      defineField({
        name: 'columns', title: 'Columns', type: 'number',
        options: { list: [{ title: '2', value: 2 }, { title: '3', value: 3 }, { title: '4', value: 4 }] },
        initialValue: 3,
      }),
      defineField({
        name: 'cardStyle', title: 'Card Style', type: 'string',
        options: { list: [
          { title: 'Bordered',  value: 'bordered'  },
          { title: 'Filled',    value: 'filled'    },
          { title: 'Plain',     value: 'plain'     },
          { title: 'Elevated',  value: 'elevated'  },
        ], layout: 'radio' },
        initialValue: 'bordered',
      }),
      defineField({
        name: 'items', title: 'Grid Items', type: 'array',
        of: [{
          type: 'object',
          fields: [
            defineField({ name: 'heading',   title: 'Heading',    type: 'string', validation: R => R.required() }),
            defineField({ name: 'body',      title: 'Body',       type: 'text',  rows: 3 }),
            defineField({ name: 'icon',      title: 'Icon (Lucide name)', type: 'string' }),
            defineField({ name: 'image',     title: 'Image',      type: 'image', options: { hotspot: true } }),
            defineField({ name: 'linkLabel', title: 'Link Label', type: 'string' }),
            defineField({ name: 'linkHref',  title: 'Link URL',   type: 'string' }),
          ],
          preview: { select: { title: 'heading', subtitle: 'body' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string, subtitle: v.subtitle as string }) },
        }],
      }),
    ],
  }),

]
