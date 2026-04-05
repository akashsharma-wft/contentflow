// sections/SettingsSection.tsx
import { sanityClient } from '@/lib/sanity/client'
import { SETTINGS_PAGE_CONFIG_QUERY } from '@/lib/sanity/queries'
import { ProfileForm } from '@/features/settings/components/ProfileForm'

export type SettingsConfig = {
  heading?: string
  subheading?: string
  profileSectionLabel?: string
  displayNameLabel?: string
  emailLabel?: string
  emailHelperText?: string
  bioLabel?: string
  bioMaxLength?: number
  websiteLabel?: string
  uploadPhotoLabel?: string
  saveLabel?: string
  discardLabel?: string
  dangerZoneHeading?: string
  dangerZoneBody?: string
  dangerZoneWarning?: string
  deleteAccountLabel?: string
}

export async function SettingsSection() {
  const config = await sanityClient.fetch<SettingsConfig | null>(SETTINGS_PAGE_CONFIG_QUERY)

  return (
    <div className="space-y-1">
      <h1 className="text-white text-2xl font-bold tracking-tight">
        {config?.heading ?? 'Account Settings'}
      </h1>
      <p className="text-white/35 text-sm mb-5">
        {config?.subheading ?? 'Manage your architectural preferences and profile identity.'}
      </p>
      <ProfileForm config={config ?? {}} />
    </div>
  )
}