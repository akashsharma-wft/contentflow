// sanity/schemaTypes/sections/systemSections/adminPageSections.ts
//
// Field definitions for the /admin dashboard page.
// Exported as a flat array — spread into the `section` document's fields array.
//
// Sections: admin
//
// All text fields are plain strings. Multilingual support is achieved by
// creating one section document per language (en / hi / kn) in the seed.

import { defineField } from 'sanity'

const shownFor = (...types: string[]) => ({
  hidden: ({ parent }: { parent: { sectionType?: string } }) =>
    !types.includes(parent?.sectionType ?? ''),
})

export const adminPageSectionFields = [

  // ── Admin section (mounts AdminUsersTable) ────────────────────────────────
  defineField({
    name: 'admin',
    title: 'Admin Content',
    description: 'Labels and copy shown on the /admin page. Create one per language.',
    type: 'object',
    ...shownFor('admin'),
    fields: [
      // ── Header ────────────────────────────────────────────────────────────
      defineField({
        name: 'heading',
        title: 'Heading',
        description: 'Main page heading — e.g. "Admin Panel"',
        type: 'string',
        initialValue: 'Admin Panel',
      }),
      defineField({
        name: 'subheading',
        title: 'Subheading',
        description: 'Descriptive line below the heading.',
        type: 'string',
        initialValue: 'All users and their subscription tiers — admin access only.',
      }),

      // ── Summary badges ────────────────────────────────────────────────────
      defineField({
        name: 'totalUsersLabel',
        title: 'Total Users Suffix',
        description: 'Text appended after the user count — e.g. "total users".',
        type: 'string',
        initialValue: 'total users',
      }),
      defineField({
        name: 'proLabel',
        title: 'Pro Badge Label',
        description: 'Label for the pro-users badge — e.g. "pro".',
        type: 'string',
        initialValue: 'pro',
      }),
      defineField({
        name: 'freeLabel',
        title: 'Free Badge Label',
        description: 'Label for the free-users badge — e.g. "free".',
        type: 'string',
        initialValue: 'free',
      }),

      // ── Table columns ─────────────────────────────────────────────────────
      defineField({
        name: 'colUser',
        title: 'Column: User',
        type: 'string',
        initialValue: 'User',
      }),
      defineField({
        name: 'colPlan',
        title: 'Column: Plan',
        type: 'string',
        initialValue: 'Plan',
      }),
      defineField({
        name: 'colRole',
        title: 'Column: Role',
        type: 'string',
        initialValue: 'Role',
      }),
      defineField({
        name: 'colJoined',
        title: 'Column: Joined',
        type: 'string',
        initialValue: 'Joined',
      }),

      // ── Empty state ───────────────────────────────────────────────────────
      defineField({
        name: 'emptyLabel',
        title: 'Empty State Label',
        description: 'Shown when no users exist in the table.',
        type: 'string',
        initialValue: 'No users found',
      }),

      // ── Footer ────────────────────────────────────────────────────────────
      defineField({
        name: 'footerNote',
        title: 'Footer Note',
        description: 'Small note shown below the table — e.g. data source info.',
        type: 'string',
        initialValue: 'Data fetched via Supabase service role key — server-side only',
      }),

      // ── Invite form ───────────────────────────────────────────────────────
      defineField({
        name: 'inviteSectionHeading',
        title: 'Invite Section Heading',
        description: 'Heading above the invite form + pending panels.',
        type: 'string',
        initialValue: 'Admin Access',
      }),
      defineField({
        name: 'inviteFormTitle',
        title: 'Invite Form Title',
        type: 'string',
        initialValue: 'Invite User to Admin',
      }),
      defineField({
        name: 'inviteEmailLabel',
        title: 'Invite: Email Label',
        type: 'string',
        initialValue: 'Email address',
      }),
      defineField({
        name: 'inviteEmailPlaceholder',
        title: 'Invite: Email Placeholder',
        type: 'string',
        initialValue: 'user@example.com',
      }),
      defineField({
        name: 'inviteMessageLabel',
        title: 'Invite: Message Label',
        description: 'Label for the optional note field.',
        type: 'string',
        initialValue: 'Note (optional)',
      }),
      defineField({
        name: 'inviteSendLabel',
        title: 'Invite: Send Button Label',
        type: 'string',
        initialValue: 'Send Invite',
      }),

      // ── Pending invites panel ─────────────────────────────────────────────
      defineField({
        name: 'pendingInvitesHeading',
        title: 'Pending Invites Heading',
        type: 'string',
        initialValue: 'Pending Invites',
      }),
      defineField({
        name: 'inviteEmptyLabel',
        title: 'Pending Invites: Empty State',
        type: 'string',
        initialValue: 'No pending invites',
      }),
      defineField({
        name: 'cancelInviteLabel',
        title: 'Cancel Invite Button Label',
        type: 'string',
        initialValue: 'Cancel',
      }),

      // ── Pending requests panel ────────────────────────────────────────────
      defineField({
        name: 'pendingRequestsHeading',
        title: 'Pending Access Requests Heading',
        type: 'string',
        initialValue: 'Access Requests',
      }),
      defineField({
        name: 'requestEmptyLabel',
        title: 'Pending Requests: Empty State',
        type: 'string',
        initialValue: 'No pending access requests',
      }),
      defineField({
        name: 'approveLabel',
        title: 'Approve Button Label',
        type: 'string',
        initialValue: 'Approve',
      }),
      defineField({
        name: 'rejectLabel',
        title: 'Reject Button Label',
        type: 'string',
        initialValue: 'Reject',
      }),

      // ── Shared table columns ──────────────────────────────────────────────
      defineField({
        name: 'colEmail',
        title: 'Column: Email',
        type: 'string',
        initialValue: 'Email',
      }),
      defineField({
        name: 'colType',
        title: 'Column: Type',
        type: 'string',
        initialValue: 'Type',
      }),
      defineField({
        name: 'colSentAt',
        title: 'Column: Sent / Requested At',
        type: 'string',
        initialValue: 'Date',
      }),
      defineField({
        name: 'colActions',
        title: 'Column: Actions',
        type: 'string',
        initialValue: 'Actions',
      }),
    ],
  }),

]
