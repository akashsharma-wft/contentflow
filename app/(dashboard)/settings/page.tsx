import { ProfileForm } from '@/features/settings/components/ProfileForm'

export const metadata = { title: 'Settings — ContentFlow' }

export default function SettingsPage() {
  return (
    <div className="py-6 max-w-[680px]">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">
          Account Settings
        </h1>
        <p className="text-white/35 text-sm mt-1">
          Manage your architectural preferences and profile identity.
        </p>
      </div>
      <ProfileForm />
    </div>
  )
}