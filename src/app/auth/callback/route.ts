import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    try {
      // Exchange the code for a session
      const { data: { session }, error: sessionError } = 
        await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) throw sessionError;

      // Only create/update profile if we have a valid session
      if (session?.user) {
        // Check if user profile already exists
        const { data: existingProfile } = await supabase
          .from('users')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!existingProfile) {
          // Create new profile only if it doesn't exist
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata.name || '',
              username: session.user.user_metadata.username || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (profileError) {
            console.error('Error creating user profile:', profileError);
          }
        } else {
          // Update existing profile with latest metadata
          const { error: updateError } = await supabase
            .from('users')
            .update({
              name: session.user.user_metadata.name || '',
              username: session.user.user_metadata.username || '',
              updated_at: new Date().toISOString(),
            })
            .eq('id', session.user.id);

          if (updateError) {
            console.error('Error updating user profile:', updateError);
          }
        }
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
      // Continue with redirect even if profile creation fails
    }
  }

  // Always redirect to the home page
  return NextResponse.redirect(new URL('/', requestUrl.origin));
} 