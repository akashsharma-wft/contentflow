import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const LANG_CODES = ['en', 'hi', 'kn']

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if route is public
  const isPublicRoute = (path: string): boolean => {
    // Static public routes (no language prefix)
    if (path === '/posts' || path.startsWith('/posts/')) return true
    if (path === '/api/webhooks' || path.startsWith('/api/webhooks/')) return true
    if (path === '/signup' || path.startsWith('/signup/')) return true
    if (path === '/login' || path.startsWith('/login/')) return true

    // Language-prefixed public routes: /hi/posts, /kn/posts, /en/signup, etc.
    const langMatch = path.match(/^\/([a-z]{2})\/(.+)$/)
    if (langMatch) {
      const lang = langMatch[1]
      const rest = langMatch[2]
      if (!LANG_CODES.includes(lang)) return false

      if (rest === 'posts' || rest.startsWith('posts/')) return true
      if (rest === 'signup' || rest.startsWith('signup/')) return true
      if (rest === 'login' || rest.startsWith('login/')) return true
    }

    return false
  }

  // Skip middleware for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    // Match everything except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
