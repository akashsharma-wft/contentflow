// sanity/schemaTypes/sections/systemSections/authPageSections.ts
//
// Field definitions for sections that appear on login / signup pages.
// Exported as a flat array — spread into the `section` document's fields array.
//
// Sections: authHero · authForm

import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { sectionType?: string } }) =>
    !types.includes(parent?.sectionType ?? ''),
})

export const authPageSectionFields = [

  // ── Auth Hero (left branding panel) ─────────────────────────────────────────
  defineField({
    name: 'authHero',
    title: 'Auth Hero Content',
    type: 'object',
    ...shownFor('authHero'),
    fields: [
      defineField({ name: 'badge',    title: 'Badge',    type: 'string', description: 'Small pill above the headline' }),
      defineField({ name: 'headline', title: 'Headline', type: 'string', validation: R => R.required() }),
      defineField({
        name: 'features', title: 'Feature Bullets', type: 'array',
        of: [{
          type: 'object',
          fields: [
            defineField({ name: 'icon', title: 'Icon', type: 'string',
              description: 'Lucide icon name — e.g. "Zap", "Globe", "GitBranch", "Eye", "LayoutGrid"' }),
            defineField({ name: 'text', title: 'Text', type: 'string', validation: R => R.required() }),
          ],
          preview: {
            select: { title: 'text', subtitle: 'icon' },
            prepare: (v: Record<string, unknown>) => ({ title: v.title as string, subtitle: v.subtitle as string }),
          },
        }],
      }),
      defineField({ name: 'footerNote', title: 'Footer Note', type: 'string', initialValue: 'Powered by Supabase Auth' }),
    ],
  }),

  // ── Auth Form (right panel) ──────────────────────────────────────────────────
  defineField({
    name: 'authForm',
    title: 'Auth Form Content',
    type: 'object',
    ...shownFor('authForm'),
    fields: [
      defineField({
        name: 'mode', title: 'Mode', type: 'string',
        options: { list: [{ title: 'Login', value: 'login' }, { title: 'Signup', value: 'signup' }], layout: 'radio' },
        initialValue: 'login',
        validation: R => R.required(),
      }),
      defineField({ name: 'heading',            title: 'Heading',             type: 'string' }),
      defineField({ name: 'googleLabel',         title: 'Google Button Label', type: 'string', initialValue: 'Continue with Google' }),
      defineField({ name: 'dividerLabel',        title: 'OR Divider Label',    type: 'string', initialValue: 'or' }),
      defineField({ name: 'nameLabel',           title: 'Name Label',          type: 'string', description: 'Signup only', initialValue: 'Name' }),
      defineField({ name: 'namePlaceholder',     title: 'Name Placeholder',    type: 'string', description: 'Signup only', initialValue: 'Your full name' }),
      defineField({ name: 'emailLabel',          title: 'Email Label',         type: 'string', initialValue: 'Email' }),
      defineField({ name: 'emailPlaceholder',    title: 'Email Placeholder',   type: 'string', initialValue: 'you@example.com' }),
      defineField({ name: 'passwordLabel',       title: 'Password Label',      type: 'string', initialValue: 'Password' }),
      defineField({ name: 'passwordPlaceholder', title: 'Password Placeholder', type: 'string', initialValue: 'Your password' }),
      defineField({ name: 'submitLabel',         title: 'Submit Label',        type: 'string', initialValue: 'Sign in' }),
      defineField({ name: 'footerText',          title: 'Footer Text',         type: 'string', initialValue: "Don't have an account?" }),
      defineField({ name: 'footerLinkLabel',     title: 'Footer Link Label',   type: 'string', initialValue: 'Request access' }),
      defineField({ name: 'footerLinkHref',      title: 'Footer Link URL',     type: 'string', initialValue: '/signup' }),
      defineField({ name: 'showGoogleOAuth',     title: 'Show Google OAuth',   type: 'boolean', initialValue: true }),
      defineField({ name: 'showEmailPassword',   title: 'Show Email/Password', type: 'boolean', initialValue: true }),
    ],
  }),

]
