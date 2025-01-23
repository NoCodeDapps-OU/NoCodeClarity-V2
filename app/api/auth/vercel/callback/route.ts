import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
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

    const callbackUrl = `${requestUrl.origin}/api/auth/vercel/callback`;

    const clientId = process.env.NEXT_PUBLIC_VERCEL_CLIENT_ID?.trim();
    const clientSecret = process.env.VERCEL_CLIENT_SECRET?.trim();

    // Debug logging
    console.log('Token Exchange Debug:', {
      hasClientId: !!clientId,
      clientIdLength: clientId?.length,
      hasClientSecret: !!clientSecret,
      code: code?.substring(0, 8) + '...',
      callbackUrl,
      origin: requestUrl.origin
    });

    const tokenResponse = await fetch('https://api.vercel.com/v2/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code'
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(`Token exchange failed: ${errorData.error || 'Unknown error'}`);
      } catch (e) {
        throw new Error(`Token exchange failed: ${errorText}`);
      }
    }

    const tokenData = await tokenResponse.json();
    
    // Get Vercel user info
    const userResponse = await fetch('https://api.vercel.com/v2/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch Vercel user data');
    }

    const userData = await userResponse.json();

    // Add debug logging
    console.log('Vercel User Data:', {
      id: userData.user?.id,
      username: userData.user?.username,
      hasData: !!userData.user
    });

    // Validate user data before database insert
    if (!userData.user?.id || !userData.user?.username) {
      throw new Error('Invalid Vercel user data received');
    }

    // Store connection in database
    const { error: dbError } = await supabase
      .from('vercel_connections')
      .upsert({
        user_id: session.user.id,
        vercel_id: userData.user.id,
        username: userData.user.username,
        access_token: tokenData.access_token,
        connected: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (dbError) throw dbError;

    // Add script to send message and close window
    const html = `
      <html>
        <head>
          <script>
            // Add a small delay to ensure database update is complete
            setTimeout(() => {
              window.opener.postMessage({ 
                type: 'vercel_auth_complete',
                data: {
                  username: '${userData.user.username}',
                  vercelId: '${userData.user.id}',
                  access_token: '${tokenData.access_token}'
                }
              }, window.location.origin);
              window.close();
            }, 1500);
          </script>
        </head>
        <body></body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('Error in Vercel callback:', error);
    
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    // Redirect with encoded error message and return to profile
    const errorMessage = encodeURIComponent(error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.redirect(
      new URL(`/profile?error=vercel_auth_failed&details=${errorMessage}`, requestUrl.origin)
    );
  }
} 