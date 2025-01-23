import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, error_description);
    return NextResponse.redirect(
      new URL(`/?error=${error}&description=${error_description}`, requestUrl.origin)
    );
  }

  if (!code) {
    console.error('No code provided in callback');
    return NextResponse.redirect(new URL('/?error=no_code', requestUrl.origin));
  }

  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      console.error('Session error:', sessionError);
      throw sessionError;
    }

    // Exchange code for access token
    const supabaseClientId = process.env.NEXT_PUBLIC_SUPABASE_CLIENT_ID;
    const supabaseClientSecret = process.env.SUPABASE_CLIENT_SECRET;

    if (!supabaseClientId || !supabaseClientSecret) {
      console.error('Missing required environment variables for Supabase authentication');
      throw new Error('Missing required environment variables');
    }

    const tokenResponse = await fetch('https://api.supabase.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${supabaseClientId}:${supabaseClientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${requestUrl.origin}/api/auth/supabase/callback`
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Fetch organization data from Supabase
    const orgResponse = await fetch('https://api.supabase.com/v1/organizations', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      }
    });

    if (!orgResponse.ok) {
      throw new Error('Failed to fetch Supabase organization data');
    }

    const orgData = await orgResponse.json();
    const primaryOrg = orgData[0]; // Get first organization

    if (!primaryOrg) {
      throw new Error('No Supabase organization found');
    }

    // Store connection in database
    const { error: dbError } = await supabase
      .from('supabase_connections')
      .upsert({
        user_id: session.user.id,
        org_id: primaryOrg.id,
        org_name: primaryOrg.name,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        connected: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    // Redirect back to profile page with success state
    const state = requestUrl.searchParams.get('state') || '/profile';
    const successUrl = new URL(state, requestUrl.origin);
    successUrl.searchParams.set('success', 'supabase_connected');
    successUrl.searchParams.set('org', primaryOrg.name);
    
    // After successful database update, return HTML that will close this window and message the opener
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Supabase Connection Complete</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              // Post message to opener window instead of redirecting
              window.opener.postMessage({
                type: 'SUPABASE_CONNECTION_SUCCESS',
                url: '${successUrl.toString()}'
              }, '*');
              // Close this window
              window.close();
            } else {
              // If no opener, just redirect
              window.location.href = '${successUrl.toString()}';
            }
          </script>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('Error in Supabase callback:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    const errorMessage = encodeURIComponent(error instanceof Error ? error.message : 'Unknown error');
    const state = requestUrl.searchParams.get('state') || '/profile';
    const errorUrl = new URL(state, requestUrl.origin);
    errorUrl.searchParams.set('error', 'supabase_auth_failed');
    errorUrl.searchParams.set('details', errorMessage);
    
    return NextResponse.redirect(errorUrl);
  }
}
