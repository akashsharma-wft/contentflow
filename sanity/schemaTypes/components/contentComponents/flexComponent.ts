import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { componentType?: string } }) =>
    !types.includes(parent?.componentType ?? ''),
})

export const flexComponentFields = [

  defineField({
    name: 'flex',
    title: 'Flex Layout Config',
    type: 'object',
    ...shownFor('flex'),
    fields: [
      defineField({ name: 'heading', title: 'Heading', type: 'string' }),
      defineField({
        name: 'direction', title: 'Direction', type: 'string',
        options: { list: [{ title: 'Row', value: 'row' }, { title: 'Column', value: 'column' }], layout: 'radio' },
        initialValue: 'row',
      }),
      defineField({ name: 'wrap', title: 'Wrap', type: 'boolean', initialValue: true }),
      defineField({
        name: 'gap', title: 'Gap', type: 'string',
        options: { list: [
          { title: 'None',   value: 'none' },
          { title: 'Small',  value: 'sm'   },
          { title: 'Medium', value: 'md'   },
          { title: 'Large',  value: 'lg'   },
        ], layout: 'radio' },
        initialValue: 'md',
      }),
      defineField({
        name: 'align', title: 'Align Items', type: 'string',
        options: { list: [
          { title: 'Start',   value: 'start'   },
          { title: 'Center',  value: 'center'  },
          { title: 'End',     value: 'end'     },
          { title: 'Stretch', value: 'stretch' },
        ]},
        initialValue: 'stretch',
      }),
      defineField({
        name: 'justify', title: 'Justify Content', type: 'string',
        options: { list: [
          { title: 'Start',         value: 'start'  },
          { title: 'Center',        value: 'center' },
          { title: 'End',           value: 'end'    },
          { title: 'Space Between', value: 'between'},
          { title: 'Space Around',  value: 'around' },
        ]},
        initialValue: 'start',
      }),
      defineField({
        name: 'items', title: 'Flex Items', type: 'array',
        of: [{
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Heading', type: 'string' }),
            defineField({ name: 'body',    title: 'Body',    type: 'text', rows: 3 }),
            defineField({ name: 'image',   title: 'Image',   type: 'image', options: { hotspot: true } }),
            defineField({ name: 'width',   title: 'Width (Tailwind class)', type: 'string', description: 'e.g. "w-1/2", "w-1/3" — leave empty for auto' }),
          ],
          preview: { select: { title: 'heading', subtitle: 'body' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string ?? 'Flex Item', subtitle: v.subtitle as string }) },
        }],
      }),
    ],
  }),

]
