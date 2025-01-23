import useSWR from 'swr';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';
import { useUserStore } from '@/stores/userStore';

// Create a singleton Supabase client
const supabase = createClientComponentClient<Database>();

// Cache key prefix
const USER_CACHE_KEY = 'user-profile';

// Optimized fetcher with error handling
const fetcher = async (userId: string) => {
  const cacheKey = `${USER_CACHE_KEY}-${userId}`;
  
  // Check localStorage cache first
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    // Use cache if it's less than 5 minutes old
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      return data;
    }
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;

  // Update cache
  if (data) {
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }

  return data;
};

export function useUser() {
  const { user, profile, setProfile, isLoading, setLoading } = useUserStore();

  const { data, error } = useSWR(
    user?.id ? `/api/user/${user.id}` : null,
    () => user?.id ? fetcher(user.id) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // Reduce from 60s to 30s
      fallbackData: profile,
      keepPreviousData: true, // Keep showing old data while fetching
      onSuccess: (data) => {
        if (data) {
          setProfile(data);
          setLoading(false);
        }
      },
      onError: () => {
        setLoading(false);
      }
    }
  );

  return {
    user,
    profile: profile || data,
    error,
    isLoading: isLoading && !profile && !data,
  };
} 