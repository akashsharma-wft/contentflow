import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { componentType?: string } }) =>
    !types.includes(parent?.componentType ?? ''),
})

export const footerComponentFields = [

  // ── Footer ──────────────────────────────────────────────────────────────────
  defineField({
    name: 'footer',
    title: 'Footer Config',
    type: 'object',
    ...shownFor('footer'),
    fields: [
      defineField({ name: 'logoText',  title: 'Logo Text',  type: 'string' }),
      defineField({ name: 'tagline',   title: 'Tagline',    type: 'string' }),
      defineField({ name: 'copyright', title: 'Copyright',  type: 'string', initialValue: '© 2025 ContentFlow. All rights reserved.' }),
      defineField({
        name: 'columns', title: 'Link Columns', type: 'array',
        of: [{
          type: 'object',
          fields: [
            defineField({ name: 'heading', title: 'Column Heading', type: 'string', validation: R => R.required() }),
            defineField({
              name: 'links', title: 'Links', type: 'array',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'label',    title: 'Label',           type: 'string' }),
                  defineField({ name: 'href',     title: 'URL',             type: 'string' }),
                  defineField({ name: 'external', title: 'New tab',         type: 'boolean', initialValue: false }),
                ],
                preview: { select: { title: 'label' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string }) },
              }],
            }),
          ],
          preview: { select: { title: 'heading' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string }) },
        }],
      }),
      defineField({
        name: 'socialLinks', title: 'Social Links', type: 'array',
        of: [{
          type: 'object',
          fields: [
            defineField({
              name: 'platform', title: 'Platform', type: 'string',
              options: { list: [
                { title: 'Twitter / X', value: 'twitter' },
                { title: 'GitHub',      value: 'github'   },
                { title: 'LinkedIn',    value: 'linkedin' },
                { title: 'YouTube',     value: 'youtube'  },
                { title: 'Instagram',   value: 'instagram'},
              ]},
            }),
            defineField({ name: 'href', title: 'URL', type: 'string' }),
          ],
          preview: { select: { title: 'platform' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string }) },
        }],
      }),
      defineField({ name: 'showLogo', title: 'Show Logo', type: 'boolean', initialValue: true }),
    ],
  }),

]
