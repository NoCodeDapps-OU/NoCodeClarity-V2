import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';
import { useUserStore } from '@/stores/userStore';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

type UserProfile = Database['public']['Tables']['users']['Row'];
type MutationContext = { previousProfile: UserProfile | null };

const STALE_TIME = 5 * 60 * 1000;  // 5 minutes
const GC_TIME = 30 * 60 * 1000; // 30 minutes

export function useGlobalData() {
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient<Database>();
  const { user, setUser, setProfile } = useUserStore();

  const queryKey = ['profile', user?.id] as const;

  // User profile query with SWR-like behavior
  const { data: profile, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProfile(data);
        // Store encrypted session in cookie
        Cookies.set('user_session', btoa(JSON.stringify(data)), {
          expires: 30,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }
      
      return data as UserProfile | null;
    },
    enabled: !!user?.id,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

  // Token refresh mechanism
  useEffect(() => {
    const refreshToken = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) return;

      if (session.expires_at) {
        const expiresIn = new Date(session.expires_at).getTime() - Date.now();
        if (expiresIn < 24 * 60 * 60 * 1000) {
          await supabase.auth.refreshSession();
        }
      }
    };

    const interval = setInterval(refreshToken, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [supabase.auth]);

  // Optimistic updates for profile
  const updateProfile = useMutation<
    UserProfile | null,
    Error,
    Partial<UserProfile>,
    MutationContext
  >({
    mutationFn: async (updates) => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });

      // Get the current value and store it
      const previousProfile = queryClient.getQueryData<UserProfile>(queryKey);

      // Update the cache with new data
      if (previousProfile) {
        queryClient.setQueryData<UserProfile>(queryKey, {
          ...previousProfile,
          ...newData
        });
      }

      // Return context with the previous value
      return { previousProfile: previousProfile || null };
    },
    onError: (_err, _newData, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData<UserProfile>(queryKey, context.previousProfile);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    profile,
    isLoading,
    updateProfile,
    queryClient,
  };
} 