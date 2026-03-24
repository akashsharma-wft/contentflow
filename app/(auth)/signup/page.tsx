import { AuthShell } from '@/features/auth/components/AuthShell'
import { SignupForm } from '@/features/auth/components/SignupForm'

export const metadata = { title: 'Create account — ContentFlow' }

export default function SignupPage() {
  return (
    <AuthShell
      mode="signup"
      headline="CMS-driven publishing for engineering teams."
      subheadline="Create your account"
      badge="ENGINEERING FIRST"
    >
      <SignupForm />
    </AuthShell>
  )
}