import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = await headers();
    const accessToken = headersList.get('Authorization')?.split(' ')[1];

    if (!accessToken) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const response = await fetch('https://api.supabase.com/v1/projects', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch projects', { status: response.status });
    }

    const projects = await response.json();
    
    // Add cache headers (5 minutes)
    return NextResponse.json(projects, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching Supabase projects:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 