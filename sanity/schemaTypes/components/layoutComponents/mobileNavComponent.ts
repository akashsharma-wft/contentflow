import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { componentType?: string } }) =>
    !types.includes(parent?.componentType ?? ''),
})

export const mobileNavComponentFields = [

  // ── Mobile Top Bar ───────────────────────────────────────────────────────────
  defineField({
    name: 'mobileNavTop',
    title: 'Mobile Top Bar Config',
    type: 'object',
    ...shownFor('mobileNavTop'),
    fields: [
      defineField({ name: 'logoText',        title: 'Logo Text',           type: 'string', initialValue: 'ContentFlow' }),
      defineField({ name: 'showLogo',        title: 'Show Logo',           type: 'boolean', initialValue: true }),
      defineField({ name: 'showMenuButton',  title: 'Show Hamburger Menu', type: 'boolean', initialValue: true }),
      defineField({
        name: 'actions', title: 'Action Icons (right side)', type: 'array',
        of: [{
          type: 'object',
          fields: [
            defineField({
              name: 'type', title: 'Action Type', type: 'string',
              options: { list: [
                { title: 'Search',       value: 'search'  },
                { title: 'Notification', value: 'notify'  },
                { title: 'Profile',      value: 'profile' },
                { title: 'Settings',     value: 'settings'},
              ]},
              validation: R => R.required(),
            }),
            defineField({ name: 'label', title: 'Aria Label', type: 'string' }),
          ],
          preview: { select: { title: 'type' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string }) },
        }],
      }),
    ],
  }),

  // ── Mobile Bottom Bar ────────────────────────────────────────────────────────
  defineField({
    name: 'mobileNavBottom',
    title: 'Mobile Bottom Bar Config',
    type: 'object',
    ...shownFor('mobileNavBottom'),
    fields: [
      defineField({
        name: 'items', title: 'Bottom Nav Items', type: 'array',
        description: 'Max 5 items for clean mobile UX.',
        of: [{
          type: 'object',
          fields: [
            defineField({ name: 'label',      title: 'Label',           type: 'string', validation: R => R.required() }),
            defineField({ name: 'href',       title: 'URL',             type: 'string', validation: R => R.required() }),
            defineField({ name: 'icon',       title: 'Icon (Lucide)',   type: 'string' }),
            defineField({ name: 'activeIcon', title: 'Active Icon',     type: 'string', description: 'Optional filled variant' }),
            defineField({ name: 'adminOnly',  title: 'Admin only',      type: 'boolean', initialValue: false }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string, subtitle: v.subtitle as string }) },
        }],
        validation: R => R.max(5),
      }),
      defineField({ name: 'showLabels', title: 'Show Labels Below Icons', type: 'boolean', initialValue: true }),
    ],
  }),

]
