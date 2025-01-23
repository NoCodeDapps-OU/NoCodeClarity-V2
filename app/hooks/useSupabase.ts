'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState, useCallback, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Create a singleton instance outside the hook
const supabaseClient = createClientComponentClient<Database>();

interface SupabaseState {
  session: Session | null;
  loading: boolean;
}

export function useSupabase() {
  // Initialize state directly without a separate initialState object
  const [state, setState] = useState<SupabaseState>({
    session: null,
    loading: true
  });
  
  // Memoize the client instance
  const supabase = useMemo(() => supabaseClient, []);

  // Memoize the auth state handler
  const handleAuthChange = useCallback((_event: string, newSession: Session | null) => {
    setState(prev => ({
      ...prev,
      session: newSession,
      loading: false
    }));
  }, []);

  // Initialize session
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setState({
            session: initialSession,
            loading: false
          });
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) {
          setState({
            session: null,
            loading: false
          });
        }
      }
    };

    // Initialize session
    void initSession();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Cleanup
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth, handleAuthChange]);

  return {
    supabase,
    session: state.session,
    loading: state.loading,
    isAuthenticated: !!state.session
  };
} 