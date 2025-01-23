import { useState, useCallback, useEffect } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import { useToast } from '@chakra-ui/react';

interface GithubConnectionData {
  isConnected: boolean;
  username: string | null;
  githubId: string | null;
}

export function useGithubConnection() {
  const { supabase, session } = useSupabase();
  const [connectionData, setConnectionData] = useState<GithubConnectionData>({
    isConnected: false,
    username: null,
    githubId: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const toast = useToast();

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        checkConnection();
        setIsInitialized(true);
      } else {
        console.log('No active session found during initialization');
        setIsInitialized(true);
      }
    };

    initializeSession();
  }, [supabase.auth]);

  // Check connection status from Supabase
  const checkConnection = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession?.user?.id) {
      console.log('No user ID available for connection check');
      return;
    }

    try {
      // Check local storage cache first
      const cachedData = localStorage.getItem(`github_connection_${currentSession.user.id}`);
      if (cachedData) {
        const { data: cachedConnection, timestamp } = JSON.parse(cachedData);
        // Cache is valid for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setConnectionData({
            isConnected: !!cachedConnection,
            username: cachedConnection?.username || null,
            githubId: cachedConnection?.github_id || null
          });
          return;
        }
      }

      const { data, error } = await supabase
        .from('github_connections')
        .select('*')
        .eq('user_id', currentSession.user.id)
        .eq('connected', true)
        .maybeSingle();

      if (error) throw error;

      // Update local storage cache
      localStorage.setItem(`github_connection_${currentSession.user.id}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));

      setConnectionData({
        isConnected: !!data,
        username: data?.username || null,
        githubId: data?.github_id || null
      });
    } catch (error) {
      console.error('Error checking GitHub connection:', error);
      // If there's an error, try to use cached data as fallback
      const cachedData = localStorage.getItem(`github_connection_${currentSession.user.id}`);
      if (cachedData) {
        const { data: cachedConnection } = JSON.parse(cachedData);
        setConnectionData({
          isConnected: !!cachedConnection,
          username: cachedConnection?.username || null,
          githubId: cachedConnection?.github_id || null
        });
      }
    }
  }, [supabase]);

  // Connect GitHub
  const connectGithub = useCallback(async () => {
    if (!session?.user?.id) {
      console.error('No active session found');
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to connect your GitHub account',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Define the GitHub OAuth URL with proper client ID and state
      const state = Math.random().toString(36).substring(7);
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

      if (!clientId) {
        throw new Error('GitHub client ID is not configured');
      }

      const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/github/callback`);
      const scope = encodeURIComponent('read:user repo');
      
      const authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${clientId}` +
        `&redirect_uri=${redirectUri}` +
        `&scope=${scope}` + 
        `&state=${state}`;

      // Debug log
      console.log('Opening GitHub OAuth URL:', authUrl);
      
      // Open popup window for GitHub OAuth
      const width = 600;
      const height = 800;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        authUrl,
        'github-oauth',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      if (!popup) {
        throw new Error('Failed to open popup window. Please allow popups for this site.');
      }

      // Add window close check interval
      const closeCheckInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(closeCheckInterval);
          setIsLoading(false);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);

      // Listen for the callback message
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type !== 'github_auth_complete') return;

        clearInterval(closeCheckInterval);
        window.removeEventListener('message', handleMessage);
        popup.close();

        // Immediately update connection data and cache
        const newConnectionData = {
          isConnected: true,
          username: event.data.data.username,
          githubId: event.data.data.githubId
        };
        setConnectionData(newConnectionData);

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession?.user?.id) {
          localStorage.setItem(`github_connection_${currentSession.user.id}`, JSON.stringify({
            data: {
              username: event.data.data.username,
              github_id: event.data.data.githubId,
              connected: true
            },
            timestamp: Date.now()
          }));
        }

        // Add success toast
        toast({
          title: 'Success',
          description: 'GitHub account connected successfully',
          status: 'success',
          duration: 3000,
        });

        // Wait for database update and verify
        setTimeout(async () => {
          await checkConnection();
          setIsLoading(false);
        }, 2000);
      };

      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('Error connecting GitHub:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to connect GitHub account',
        status: 'error',
        duration: 3000,
      });
      setIsLoading(false);
    }
  }, [session, toast, checkConnection]);

  // Disconnect GitHub
  const disconnectGithub = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession?.user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('github_connections')
        .update({ connected: false })
        .eq('user_id', currentSession.user.id)
        .eq('connected', true);

      if (error) throw error;

      // Clear the cache when disconnecting
      localStorage.removeItem(`github_connection_${currentSession.user.id}`);

      setConnectionData({
        isConnected: false,
        username: null,
        githubId: null
      });

      toast({
        title: 'Success',
        description: 'GitHub account disconnected successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error disconnecting GitHub:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect GitHub account',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  // Listen for real-time changes
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('github_connection_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'github_connections',
          filter: `user_id=eq.${session.user.id}`
        },
        () => {
          checkConnection();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [session?.user?.id, supabase, checkConnection]);

  return {
    connectionData,
    isLoading,
    isInitialized,
    connectGithub,
    disconnectGithub,
    checkConnection
  };
} 