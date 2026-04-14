import { defineField } from 'sanity'

// Hide field unless parent.componentType matches
const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { componentType?: string } }) =>
    !types.includes(parent?.componentType ?? ''),
})

export const navbarComponentFields = [

  // ── Navbar ──────────────────────────────────────────────────────────────────
  defineField({
    name: 'navbar',
    title: 'Navbar Config',
    type: 'object',
    ...shownFor('navbar'),
    fields: [
      defineField({ name: 'logoText', title: 'Logo Text', type: 'string', initialValue: 'ContentFlow' }),
      defineField({
        name: 'variant', title: 'Variant', type: 'string',
        options: { list: [
          { title: 'Solid',       value: 'solid'       },
          { title: 'Transparent', value: 'transparent' },
          { title: 'Blur',        value: 'blur'        },
        ], layout: 'radio' },
        initialValue: 'solid',
      }),
      defineField({
        name: 'links', title: 'Nav Links', type: 'array',
        of: [{
          type: 'object',
          fields: [
            defineField({ name: 'label',    title: 'Label', type: 'string', validation: R => R.required() }),
            defineField({ name: 'href',     title: 'URL',   type: 'string', validation: R => R.required() }),
            defineField({ name: 'external', title: 'Open in new tab', type: 'boolean', initialValue: false }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string, subtitle: v.subtitle as string }) },
        }],
      }),
      defineField({
        name: 'ctaButton', title: 'CTA Button', type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Label', type: 'string' }),
          defineField({ name: 'href',  title: 'URL',   type: 'string' }),
        ],
      }),
      defineField({ name: 'showAuth', title: 'Show Auth Buttons (Login / Sign up)', type: 'boolean', initialValue: true }),
    ],
  }),

]
