import { Suspense } from 'react'
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
      {/* Suspense required because LoginForm uses useSearchParams */}
      <Suspense fallback={
        <div className="bg-[#13141c] border border-white/8 rounded-2xl p-8 animate-pulse h-80" />
      }>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}