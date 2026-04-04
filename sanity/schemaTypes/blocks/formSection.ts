import { defineType, defineField } from 'sanity'

// BLOCK: Form Section
// A reusable form block. Used on login, signup, settings pages.
// Each field is configured here — label, type, placeholder, required.
// The Next.js component reads this and renders the form dynamically.
// Actual auth logic (Supabase) stays in code — this only controls presentation.
export const formSection = defineType({
  name: 'formSection',
  title: 'Form Section',
  type: 'object',
  fields: [
    defineField({
      name: 'formId',
      title: 'Form ID',
      description: 'Internal identifier — used by Next.js to know which form logic to wire up. e.g. "login", "signup", "profile"',
      type: 'string',
      options: {
        list: [
          { title: 'Login form', value: 'login' },
          { title: 'Signup form', value: 'signup' },
          { title: 'Profile settings form', value: 'profile' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heading',
      title: 'Form Heading',
      type: 'string',
    }),
    defineField({
      name: 'subheading',
      title: 'Form Subheading',
      type: 'string',
    }),
    defineField({
      name: 'showGoogleOAuth',
      title: 'Show "Continue with Google" button?',
      type: 'boolean',
      initialValue: true,
      description: 'Toggle the Google OAuth button visibility. NOTE: Google OAuth must also be enabled in Supabase dashboard.',
    }),
    defineField({
      name: 'showEmailPassword',
      title: 'Show email + password fields?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'fields',
      title: 'Form Fields',
      description: 'Define the fields shown in this form. Order matters — fields render top to bottom.',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'fieldId',
              title: 'Field ID',
              description: 'Internal name — must match what the form expects e.g. "email", "password", "displayName"',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'placeholder',
              title: 'Placeholder',
              type: 'string',
            }),
            defineField({
              name: 'fieldType',
              title: 'Field Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Text', value: 'text' },
                  { title: 'Email', value: 'email' },
                  { title: 'Password', value: 'password' },
                  { title: 'Textarea', value: 'textarea' },
                  { title: 'URL', value: 'url' },
                ],
              },
              initialValue: 'text',
            }),
            defineField({
              name: 'required',
              title: 'Required?',
              type: 'boolean',
              initialValue: true,
            }),
            defineField({
              name: 'readOnly',
              title: 'Read only?',
              description: 'e.g. email in settings is read-only — managed by Supabase Auth',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'helperText',
              title: 'Helper Text (optional)',
              description: 'Small text shown below the field e.g. "Managed by Supabase Auth"',
              type: 'string',
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'fieldType' },
          },
        },
      ],
    }),
    defineField({
      name: 'submitLabel',
      title: 'Submit Button Label',
      type: 'string',
      initialValue: 'Submit',
    }),
    defineField({
      name: 'footerText',
      title: 'Footer Text (optional)',
      description: "e.g. \"Don't have an account?\"",
      type: 'string',
    }),
    defineField({
      name: 'footerLinkLabel',
      title: 'Footer Link Label (optional)',
      type: 'string',
    }),
    defineField({
      name: 'footerLinkHref',
      title: 'Footer Link URL (optional)',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'heading', id: 'formId' },
    prepare({ title, id }: { title?: string; id?: string }) {
      return { title: `Form: ${title ?? id ?? 'Untitled'}`, subtitle: `formId: ${id ?? '—'}` }
    },
  },
})
