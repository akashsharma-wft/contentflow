import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { componentType?: string } }) =>
    !types.includes(parent?.componentType ?? ''),
})

export const listComponentFields = [

  defineField({
    name: 'list',
    title: 'List Config',
    type: 'object',
    ...shownFor('list'),
    fields: [
      defineField({ name: 'heading', title: 'Heading', type: 'string' }),
      defineField({
        name: 'style', title: 'List Style', type: 'string',
        options: { list: [
          { title: 'Bullet',    value: 'bullet'    },
          { title: 'Numbered',  value: 'numbered'  },
          { title: 'Checklist', value: 'checklist' },
          { title: 'Icon',      value: 'icon'      },
          { title: 'Plain',     value: 'plain'     },
        ], layout: 'radio' },
        initialValue: 'bullet',
      }),
      defineField({
        name: 'columns', title: 'Columns', type: 'number',
        options: { list: [{ title: '1', value: 1 }, { title: '2', value: 2 }, { title: '3', value: 3 }] },
        initialValue: 1,
      }),
      defineField({
        name: 'items', title: 'Items', type: 'array',
        of: [{
          type: 'object',
          fields: [
            defineField({ name: 'text',        title: 'Text',        type: 'string', validation: R => R.required() }),
            defineField({ name: 'description', title: 'Description', type: 'string' }),
            defineField({ name: 'icon',        title: 'Icon (Lucide name)', type: 'string' }),
            defineField({ name: 'badge',       title: 'Badge',       type: 'string' }),
          ],
          preview: { select: { title: 'text', subtitle: 'description' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string, subtitle: v.subtitle as string }) },
        }],
      }),
    ],
  }),

]
