import { AuthShell } from '@/features/auth/components/AuthShell'
import { LoginForm } from '@/features/auth/components/LoginForm'

export const metadata = { title: 'Sign in — ContentFlow' }

export default function LoginPage() {
  return (
    <AuthShell
      mode="signin"
      headline="CMS-driven publishing for engineering teams."
      subheadline="Welcome back"
      badge={null}
    >
      <LoginForm />
    </AuthShell>
  )
}