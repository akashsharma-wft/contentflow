// hooks/useUser.ts
//
// Thin shim over the AuthContext defined in components/providers.tsx.
// All 16+ call-sites use this hook unchanged — return shape is the same.
// The actual Supabase subscription lives in AuthProvider (one instance,
// persists across page navigations → no nav flicker on page transitions).

import { useAuthContext } from '@/components/providers'

export function useUser() {
  return useAuthContext()
}
