import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

  await supabase.auth.signOut();

  return NextResponse.redirect(new URL('/', request.url), {
    status: 302,
  });
} 