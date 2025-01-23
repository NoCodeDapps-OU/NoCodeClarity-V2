'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import type { Database } from '@/types/database.types';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import SupabaseProvider from '@/providers/SupabaseProvider';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { GradientBackground } from '@/components/shared/Gradient';
import { useHydrationFix } from '@/hooks/useHydrationFix';

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

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // Use custom hook for hydration fix
  useHydrationFix();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same structure
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ flex: 1 }} />
      </div>
    );
  }

  return (
    <SupabaseProvider>
      <ChakraProvider theme={theme}>
        <ErrorBoundary>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <GradientBackground 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1
              }}
            />
            <Navbar />
            <main style={{ flex: 1, position: 'relative' }}>
              {children}
            </main>
            <Footer />
          </div>
        </ErrorBoundary>
      </ChakraProvider>
    </SupabaseProvider>
  );
} 