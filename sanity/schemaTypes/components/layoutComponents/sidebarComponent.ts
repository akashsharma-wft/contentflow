import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { componentType?: string } }) =>
    !types.includes(parent?.componentType ?? ''),
})

const NAV_ITEM_FIELDS = [
  defineField({ name: 'label',     title: 'Label', type: 'string', validation: R => R.required() }),
  defineField({ name: 'href',      title: 'URL',   type: 'string', validation: R => R.required() }),
  defineField({ name: 'icon',      title: 'Icon (Lucide name)', type: 'string', description: 'e.g. "LayoutDashboard", "FileText", "Settings"' }),
  defineField({ name: 'adminOnly', title: 'Admin only', type: 'boolean', initialValue: false }),
]

export const sidebarComponentFields = [

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  defineField({
    name: 'sidebar',
    title: 'Sidebar Config',
    type: 'object',
    ...shownFor('sidebar'),
    fields: [
      defineField({ name: 'logoText',  title: 'Logo Text',  type: 'string', initialValue: 'ContentFlow' }),
      defineField({ name: 'logoHref',  title: 'Logo Link',  type: 'string', initialValue: '/'           }),
      defineField({
        name: 'navItems', title: 'Navigation Items', type: 'array',
        of: [{
          type: 'object',
          fields: NAV_ITEM_FIELDS,
          preview: { select: { title: 'label', subtitle: 'href' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string, subtitle: v.subtitle as string }) },
        }],
      }),
      defineField({
        name: 'footerItems', title: 'Footer Items (bottom of sidebar)', type: 'array',
        of: [{
          type: 'object',
          fields: NAV_ITEM_FIELDS,
          preview: { select: { title: 'label' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string }) },
        }],
      }),
      defineField({ name: 'collapsible',      title: 'Collapsible',              type: 'boolean', initialValue: true  }),
      defineField({ name: 'showUserProfile',  title: 'Show user profile in footer', type: 'boolean', initialValue: true  }),
      defineField({ name: 'defaultCollapsed', title: 'Collapsed by default',     type: 'boolean', initialValue: false }),
    ],
  }),

]
