import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Refresh session if exists
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Handle auth callback
  if (req.nextUrl.pathname === '/auth/callback') {
    return res;
  }

  // Only protect the profile page at middleware level
  // Other pages will handle auth state in their components
  if (req.nextUrl.pathname === '/profile') {
    if (!session) {
      const redirectUrl = new URL('/', req.url);
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (auth confirmation route)
     * - api/auth/vercel/callback (vercel oauth callback)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|api/auth/vercel/callback).*)',
    '/api/auth/vercel/callback'
  ],
}; 