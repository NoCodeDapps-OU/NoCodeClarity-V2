import type { AppProps } from 'next/app';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import SupabaseProvider from '@/providers/SupabaseProvider';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';
import type { Database } from '@/types/database.types';
import ErrorBoundary from '@/components/ErrorBoundary';

const theme = extendTheme({
  colors: {
    brand: {
      orange: '#FFA500',
      blue: '#0F1929',
      cardBg: '#1A202C',
      purple: '#6A0DAD',
    },
  },
  fonts: {
    heading: 'League Spartan, sans-serif',
    body: 'League Spartan, sans-serif',
  },
  styles: {
    global: {
      'html, body': {
        minHeight: '100vh',
        width: '100%',
        overflow: 'auto',
      },
      body: {
        bg: '#2D1B4E',
        color: 'white',
      },
      '@keyframes blob': {
        '0%, 100%': {
          transform: 'translate(-25%, -25%) rotate(0deg) scale(1)',
        },
        '33%': {
          transform: 'translate(-15%, -35%) rotate(120deg) scale(1.1)',
        },
        '66%': {
          transform: 'translate(-35%, -15%) rotate(240deg) scale(0.9)',
        },
      },
    },
  },
  components: {
    Button: {
      variants: {
        solid: {
          bg: 'brand.orange',
          color: 'white',
          _hover: { bg: '#ff824d' },
        },
        ghost: {
          color: 'gray.700',
          _hover: { bg: 'gray.100' },
        }
      }
    }
  }
});

function getPageTitle(pathname: string): string {
  switch (pathname) {
    case '/':
      return 'NoCodeClarity';
    case '/frontend':
      return 'NOCC | Frontend';
    case '/backend':
      return 'NOCC | Backend';
    case '/smart-contracts':
      return 'NOCC | Smart Contracts';
    case '/ai-agents':
      return 'NOCC | AI Agents';
    case '/profile':
      return 'NOCC | Profile';
    default:
      return 'NoCodeClarity';
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const pageTitle = getPageTitle(router.pathname);
  const [supabaseClient] = useState(() => createPagesBrowserClient<Database>());

  useEffect(() => {
    // Handle Supabase auth state changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabaseClient]);

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
      <SupabaseProvider>
        <ChakraProvider theme={theme}>
          <ErrorBoundary>
            <Head>
              <title>{pageTitle}</title>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ErrorBoundary>
        </ChakraProvider>
      </SupabaseProvider>
    </SessionContextProvider>
  );
}

export default MyApp;