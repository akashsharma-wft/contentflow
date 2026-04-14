import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { componentType?: string } }) =>
    !types.includes(parent?.componentType ?? ''),
})

export const formComponentFields = [

  defineField({
    name: 'form',
    title: 'Form Config',
    type: 'object',
    ...shownFor('form'),
    fields: [
      defineField({ name: 'heading',        title: 'Heading',        type: 'string' }),
      defineField({ name: 'subheading',     title: 'Subheading',     type: 'text', rows: 2 }),
      defineField({
        name: 'method', title: 'HTTP Method', type: 'string',
        options: { list: [{ title: 'POST', value: 'post' }, { title: 'GET', value: 'get' }], layout: 'radio' },
        initialValue: 'post',
      }),
      defineField({ name: 'action', title: 'Action URL', type: 'string', description: 'e.g. /api/contact — leave empty for client-side handling' }),
      defineField({
        name: 'fields', title: 'Form Fields', type: 'array',
        of: [{
          type: 'object',
          fields: [
            defineField({ name: 'name',        title: 'Field Name (machine)', type: 'string', validation: R => R.required() }),
            defineField({ name: 'label',       title: 'Label',                type: 'string', validation: R => R.required() }),
            defineField({
              name: 'fieldType', title: 'Field Type', type: 'string',
              options: { list: [
                { title: 'Text',     value: 'text'     },
                { title: 'Email',    value: 'email'    },
                { title: 'Password', value: 'password' },
                { title: 'Textarea', value: 'textarea' },
                { title: 'URL',      value: 'url'      },
                { title: 'Tel',      value: 'tel'      },
                { title: 'Select',   value: 'select'   },
              ]},
              initialValue: 'text',
            }),
            defineField({ name: 'placeholder', title: 'Placeholder', type: 'string' }),
            defineField({ name: 'required',    title: 'Required',    type: 'boolean', initialValue: false }),
            defineField({ name: 'helperText',  title: 'Helper Text', type: 'string' }),
            defineField({
              name: 'options', title: 'Select Options (for Select type)', type: 'array',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'label', title: 'Label', type: 'string' }),
                  defineField({ name: 'value', title: 'Value', type: 'string' }),
                ],
              }],
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'fieldType' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string, subtitle: v.subtitle as string }) },
        }],
      }),
      defineField({ name: 'submitLabel',    title: 'Submit Button Label', type: 'string', initialValue: 'Submit' }),
      defineField({ name: 'successMessage', title: 'Success Message',     type: 'string', initialValue: 'Thank you! Your message has been sent.' }),
    ],
  }),

]
