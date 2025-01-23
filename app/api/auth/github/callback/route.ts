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
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
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

    // Fetch user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch GitHub user data');
    }

    const userData = await userResponse.json();

    // Store connection in database
    const { error: dbError } = await supabase
      .from('github_connections')
      .upsert({
        user_id: session.user.id,
        github_id: userData.id.toString(),
        username: userData.login,
        access_token: tokenData.access_token,
        connected: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (dbError) throw dbError;

    // Return HTML with script to send message and close window
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GitHub Connection Complete</title>
          <script>
            window.onload = function() {
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'github_auth_complete',
                  data: {
                    username: '${userData.login}',
                    githubId: '${userData.id}',
                    access_token: '${tokenData.access_token}'
                  }
                }, window.location.origin);
                
                // Close the window after a short delay
                setTimeout(() => {
                  window.close();
                }, 1000);
              }
            }
          </script>
        </head>
        <body>
          <h3 style="font-family: system-ui; text-align: center; margin-top: 2rem;">
            GitHub connection successful! This window will close automatically.
          </h3>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('Error in GitHub callback:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    const errorMessage = encodeURIComponent(error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.redirect(
      new URL(`/profile?error=github_auth_failed&details=${errorMessage}`, requestUrl.origin)
    );
  }
} 