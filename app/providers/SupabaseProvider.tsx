'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import type { Database } from '@/types/database.types';
import { createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import type { User, SupabaseClient, Session } from '@supabase/auth-helpers-nextjs';
import { useUserStore } from '@/stores/userStore';
import { handleError } from '@/lib/errorHandling';

interface SupabaseContextType {
  supabase: SupabaseClient<Database>;
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
}

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return {
    ...context,
    auth: context.supabase.auth,
    from: context.supabase.from.bind(context.supabase)
  };
};

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createClientComponentClient<Database>());
  const { setUser, user, reset } = useUserStore();
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        await handleError(async () => {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }, { 
          silent: false,
          retry: true,
          maxRetries: 3,
          retryDelay: 1000
        });
      }
    };

    // Get initial user
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      try {
        if (event === 'SIGNED_IN') {
          await handleError(async () => {
            setSession(newSession);
            setUser(newSession?.user ?? null);
          }, { silent: true });
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          reset();
          router.push('/');
        } else if (event === 'TOKEN_REFRESHED') {
          // Handle token refresh errors gracefully
          await handleError(async () => {
            setSession(newSession);
            setUser(newSession?.user ?? null);
          }, { silent: true });
        }
      } catch (error) {
        // For network errors, this will only show toast, not console error
        await handleError(async () => {
          throw error;
        }, { silent: false });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, setUser, reset]);

  return (
    <SupabaseContext.Provider value={{ 
      supabase, 
      user,
      session,
      isAuthenticated: !!user 
    }}>
      {children}
    </SupabaseContext.Provider>
  );
} 