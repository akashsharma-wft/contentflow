// sanity/schemaTypes/singletons/settingsPageConfig.ts
import { defineType, defineField } from 'sanity'

export const settingsPageConfig = defineType({
  name: 'settingsPageConfig',
  title: 'Settings Page',
  type: 'document',
  groups: [
    { name: 'copy', title: 'Copy & Labels', default: true },
    { name: 'danger', title: 'Danger Zone' },
  ],
  fields: [
    defineField({ name: 'heading', title: 'Page Heading', group: 'copy', type: 'string', initialValue: 'Account Settings' }),
    defineField({ name: 'subheading', title: 'Page Subheading', group: 'copy', type: 'string', initialValue: 'Manage your architectural preferences and profile identity.' }),
    defineField({ name: 'profileSectionLabel', title: 'Profile Section Label', group: 'copy', type: 'string', initialValue: 'Profile' }),
    defineField({ name: 'displayNameLabel', title: 'Display Name Field Label', group: 'copy', type: 'string', initialValue: 'Display name' }),
    defineField({ name: 'emailLabel', title: 'Email Field Label', group: 'copy', type: 'string', initialValue: 'Email address' }),
    defineField({ name: 'emailHelperText', title: 'Email Helper Text', group: 'copy', type: 'string', initialValue: 'Managed by Supabase Auth' }),
    defineField({ name: 'bioLabel', title: 'Bio Field Label', group: 'copy', type: 'string', initialValue: 'Bio' }),
    defineField({ name: 'bioMaxLength', title: 'Bio Max Character Length', group: 'copy', type: 'number', initialValue: 200 }),
    defineField({ name: 'websiteLabel', title: 'Website Field Label', group: 'copy', type: 'string', initialValue: 'Website' }),
    defineField({ name: 'uploadPhotoLabel', title: 'Upload Photo Button Label', group: 'copy', type: 'string', initialValue: 'Upload photo' }),
    defineField({ name: 'saveLabel', title: 'Save Button Label', group: 'copy', type: 'string', initialValue: 'Save changes' }),
    defineField({ name: 'discardLabel', title: 'Discard Button Label', group: 'copy', type: 'string', initialValue: 'Discard' }),
    defineField({ name: 'dangerZoneHeading', title: 'Danger Zone Heading', group: 'danger', type: 'string', initialValue: 'Danger Zone' }),
    defineField({ name: 'dangerZoneBody', title: 'Danger Zone Description', group: 'danger', type: 'string', initialValue: 'Permanently delete your account and all associated architectural data. This action cannot be undone.' }),
    defineField({ name: 'dangerZoneWarning', title: 'Danger Zone Warning Text', group: 'danger', type: 'string', initialValue: 'Warning: All API keys will be invalidated.' }),
    defineField({ name: 'deleteAccountLabel', title: 'Delete Account Button Label', group: 'danger', type: 'string', initialValue: 'Delete Account' }),
  ],
  preview: { prepare: () => ({ title: 'Settings Page' }) },
})