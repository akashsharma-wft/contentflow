// sanity/schemaTypes/singletons/adminPageConfig.ts
import { defineType, defineField } from 'sanity'

export const adminPageConfig = defineType({
  name: 'adminPageConfig',
  title: 'Admin Page',
  type: 'document',
  fields: [
    defineField({ name: 'heading', title: 'Page Heading', type: 'string', initialValue: 'Admin Panel' }),
    defineField({ name: 'subheading', title: 'Page Subheading', type: 'string', initialValue: 'All users and their subscription tiers — admin access only.' }),
    defineField({ name: 'totalUsersLabel', title: '"Total Users" Pill Label', type: 'string', initialValue: 'total users' }),
    defineField({ name: 'colUser', title: 'Column: User', type: 'string', initialValue: 'User' }),
    defineField({ name: 'colPlan', title: 'Column: Plan', type: 'string', initialValue: 'Plan' }),
    defineField({ name: 'colRole', title: 'Column: Role', type: 'string', initialValue: 'Role' }),
    defineField({ name: 'colJoined', title: 'Column: Joined', type: 'string', initialValue: 'Joined' }),
    defineField({ name: 'footerNote', title: 'Footer Note', type: 'string', initialValue: 'Data fetched via Supabase service role key — server-side only' }),
    defineField({ name: 'emptyLabel', title: 'Empty State Label', type: 'string', initialValue: 'No users found' }),
  ],
  preview: { prepare: () => ({ title: 'Admin Page' }) },
})