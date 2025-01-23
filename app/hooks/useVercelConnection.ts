import { useState, useCallback, useEffect } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import { useToast } from '@chakra-ui/react';

interface VercelConnectionData {
  isConnected: boolean;
  username: string | null;
  vercelId: string | null;
}

export function useVercelConnection() {
  const { supabase, session } = useSupabase();
  const [connectionData, setConnectionData] = useState<VercelConnectionData>({
    isConnected: false,
    username: null,
    vercelId: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const toast = useToast();

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user) {
        // console.log('Session initialized:', {
        //   userId: currentSession.user.id,
        //   isAuthenticated: true
        // });
        checkConnection();
        setIsInitialized(true);
      } else {
        console.log('No active session found during initialization');
        setIsInitialized(true);
      }
    };

    initializeSession();
  }, [supabase.auth]);

  // Simple function to check connection status from Supabase
  const checkConnection = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession?.user?.id) {
      console.log('No user ID available for connection check');
      return;
    }

    try {
      // Check local storage cache first
      const cachedData = localStorage.getItem(`vercel_connection_${currentSession.user.id}`);
      if (cachedData) {
        const { data: cachedConnection, timestamp } = JSON.parse(cachedData);
        // Cache is valid for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setConnectionData({
            isConnected: !!cachedConnection,
            username: cachedConnection?.username || null,
            vercelId: cachedConnection?.vercel_id || null
          });
          return;
        }
      }

      const { data, error } = await supabase
        .from('vercel_connections')
        .select('*')
        .eq('user_id', currentSession.user.id)
        .eq('connected', true)
        .maybeSingle();

      // Update local storage cache
      localStorage.setItem(`vercel_connection_${currentSession.user.id}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));

      setConnectionData({
        isConnected: !!data,
        username: data?.username || null,
        vercelId: data?.vercel_id || null
      });
    } catch (error) {
      console.error('Error checking Vercel connection:', error);
      // If there's an error, try to use cached data as fallback
      const cachedData = localStorage.getItem(`vercel_connection_${currentSession.user.id}`);
      if (cachedData) {
        const { data: cachedConnection } = JSON.parse(cachedData);
        setConnectionData({
          isConnected: !!cachedConnection,
          username: cachedConnection?.username || null,
          vercelId: cachedConnection?.vercel_id || null
        });
      }
    }
  }, [supabase]);

  // Connect to Vercel
  const connectVercel = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    if (!currentSession?.user) {
      console.error('No active session found');
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to connect your Vercel account',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get client ID from environment variables
      const clientId = process.env.NEXT_PUBLIC_VERCEL_CLIENT_ID;
      
      if (!clientId) {
        throw new Error('Vercel client ID is not configured');
      }

      const baseUrl = window.location.origin;
      const callbackUrl = `${baseUrl}/api/auth/vercel/callback`;
      const authUrl = `https://vercel.com/integrations/${clientId.trim()}/new?redirect_uri=${encodeURIComponent(callbackUrl)}`;

      const width = 500;
      const height = 800;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const authWindow = window.open(
        authUrl,
        'Vercel Auth',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
      );

      if (!authWindow) {
        throw new Error('Failed to open authentication window. Please allow popups for this site.');
      }

      // Add window close check interval
      const closeCheckInterval = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(closeCheckInterval);
          setIsLoading(false);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);

      const handleMessage = async (event: MessageEvent) => {
        if (event.origin === window.location.origin && event.data?.type === 'vercel_auth_complete') {
          clearInterval(closeCheckInterval);
          console.log('Auth complete, received data:', event.data);
          authWindow?.close();
          window.removeEventListener('message', handleMessage);
          
          // Immediately update connection data and cache
          const newConnectionData = {
            isConnected: true,
            username: event.data.data.username,
            vercelId: event.data.data.vercelId
          };
          setConnectionData(newConnectionData);
          
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession?.user?.id) {
            localStorage.setItem(`vercel_connection_${currentSession.user.id}`, JSON.stringify({
              data: {
                username: event.data.data.username,
                vercel_id: event.data.data.vercelId,
                connected: true
              },
              timestamp: Date.now()
            }));
          }
          
          // Wait for database update and verify
          setTimeout(async () => {
            await checkConnection();
            setIsLoading(false);
            
            toast({
              title: 'Success',
              description: 'Vercel account connected successfully',
              status: 'success',
              duration: 3000,
            });
          }, 2000);
        }
      };

      window.addEventListener('message', handleMessage);

      const cleanup = setTimeout(() => {
        clearInterval(closeCheckInterval);
        window.removeEventListener('message', handleMessage);
        if (!authWindow.closed) {
          authWindow.close();
        }
        setIsLoading(false);
        toast({
          title: 'Connection Timeout',
          description: 'The connection attempt timed out. Please try again.',
          status: 'error',
          duration: 3000,
        });
      }, 300000);

      return () => {
        clearTimeout(cleanup);
        clearInterval(closeCheckInterval);
        window.removeEventListener('message', handleMessage);
      };

    } catch (error) {
      console.error('Vercel connection error:', error);
      setIsLoading(false);
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect Vercel account',
        status: 'error',
        duration: 3000,
      });
    }
  }, [supabase, toast, checkConnection]);

  // Disconnect from Vercel
  const disconnectVercel = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession?.user?.id) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('vercel_connections')
        .update({ connected: false })
        .eq('user_id', currentSession.user.id)
        .eq('connected', true);

      if (error) throw error;

      // Clear the cache when disconnecting
      localStorage.removeItem(`vercel_connection_${currentSession.user.id}`);

      setConnectionData({
        isConnected: false,
        username: null,
        vercelId: null
      });

      toast({
        title: 'Success',
        description: 'Vercel account disconnected successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error disconnecting Vercel:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect Vercel account',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  // Check connection on mount and when session changes
  useEffect(() => {
    if (session?.user?.id) {
      checkConnection();
    }
  }, [session?.user?.id, checkConnection]);

  // Listen for real-time changes
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('vercel_connection_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vercel_connections',
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
    connectVercel,
    disconnectVercel,
    checkConnection
  };
} 