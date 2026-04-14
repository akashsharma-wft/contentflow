import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { componentType?: string } }) =>
    !types.includes(parent?.componentType ?? ''),
})

export const pricingComponentFields = [

  defineField({
    name: 'pricingTable',
    title: 'Pricing Table Config',
    type: 'object',
    ...shownFor('pricingTable'),
    fields: [
      defineField({ name: 'heading',       title: 'Heading',        type: 'string' }),
      defineField({ name: 'subheading',    title: 'Subheading',     type: 'string' }),
      defineField({ name: 'currency',      title: 'Currency Symbol', type: 'string', initialValue: '$' }),
      defineField({ name: 'billingToggle', title: 'Show Monthly / Yearly Toggle', type: 'boolean', initialValue: true }),
      defineField({
        name: 'plans', title: 'Plans', type: 'array',
        of: [{
          type: 'object',
          fields: [
            defineField({ name: 'name',         title: 'Plan Name',          type: 'string', validation: R => R.required() }),
            defineField({ name: 'description',  title: 'Description',        type: 'string' }),
            defineField({ name: 'monthlyPrice', title: 'Monthly Price',      type: 'string', description: 'e.g. "9" (number only, currency is set above)' }),
            defineField({ name: 'yearlyPrice',  title: 'Yearly Price',       type: 'string', description: 'e.g. "7"' }),
            defineField({ name: 'priceNote',    title: 'Price Note',         type: 'string', description: 'e.g. "per user/month"' }),
            defineField({ name: 'badge',        title: 'Badge',              type: 'string', description: 'e.g. "Popular", "Best Value"' }),
            defineField({ name: 'highlighted',  title: 'Highlight this plan', type: 'boolean', initialValue: false }),
            defineField({
              name: 'features', title: 'Features', type: 'array',
              of: [{
                type: 'object',
                fields: [
                  defineField({ name: 'text',     title: 'Feature Text', type: 'string', validation: R => R.required() }),
                  defineField({ name: 'included', title: 'Included',     type: 'boolean', initialValue: true }),
                ],
                preview: { select: { title: 'text', subtitle: 'included' }, prepare: (v: Record<string, unknown>) => ({ title: `${v.subtitle ? '✓' : '✗'} ${v.title as string}` }) },
              }],
            }),
            defineField({ name: 'ctaLabel', title: 'CTA Button Label', type: 'string', initialValue: 'Get started' }),
            defineField({ name: 'ctaHref',  title: 'CTA Button URL',   type: 'string' }),
          ],
          preview: { select: { title: 'name', subtitle: 'monthlyPrice' }, prepare: (v: Record<string, unknown>) => ({ title: v.title as string, subtitle: `$${v.subtitle as string}/mo` }) },
        }],
      }),
    ],
  }),

]
