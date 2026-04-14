import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { componentType?: string } }) =>
    !types.includes(parent?.componentType ?? ''),
})

export const dataTableComponentFields = [

  defineField({
    name: 'dataTable',
    title: 'Data Table Config',
    type: 'object',
    ...shownFor('dataTable'),
    fields: [
      defineField({ name: 'heading',     title: 'Heading',     type: 'string' }),
      defineField({ name: 'description', title: 'Description', type: 'string' }),
      defineField({
        name: 'columns', title: 'Columns', type: 'array',
        of: [{
          type: 'object',
          fields: [
            defineField({ name: 'key',      title: 'Key (machine name)', type: 'string', validation: R => R.required() }),
            defineField({ name: 'label',    title: 'Column Label',       type: 'string', validation: R => R.required() }),
            defineField({ name: 'sortable', title: 'Sortable',           type: 'boolean', initialValue: false }),
            defineField({
              name: 'align', title: 'Alignment', type: 'string',
              options: { list: [
                { title: 'Left',   value: 'left'   },
                { title: 'Center', value: 'center' },
                { title: 'Right',  value: 'right'  },
              ]},
              initialValue: 'left',
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'key' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string, subtitle: v.subtitle as string }) },
        }],
      }),
      defineField({
        name: 'rows', title: 'Rows', type: 'array',
        of: [{
          type: 'object',
          fields: [
            defineField({
              name: 'cells', title: 'Cell Values', type: 'array',
              description: 'Each cell corresponds to a column (same order).',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'key',   title: 'Column Key', type: 'string' }),
                  defineField({ name: 'value', title: 'Value',      type: 'string' }),
                ],
              }],
            }),
          ],
          preview: { select: { cells: 'cells' }, prepare: ({ cells }: { cells?: { value?: string }[] }) => ({ title: cells?.map(c => c.value).join(' | ') ?? 'Row' }) },
        }],
      }),
      defineField({ name: 'striped',    title: 'Striped Rows',   type: 'boolean', initialValue: true  }),
      defineField({ name: 'bordered',   title: 'Bordered',       type: 'boolean', initialValue: false }),
      defineField({ name: 'pagination', title: 'Pagination',     type: 'boolean', initialValue: false }),
      defineField({ name: 'pageSize',   title: 'Rows per page',  type: 'number',  initialValue: 10 }),
    ],
  }),

]
