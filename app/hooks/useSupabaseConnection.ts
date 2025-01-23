import { useState, useCallback, useEffect } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import { useToast } from '@chakra-ui/react';

interface SupabaseProject {
  id: string;
  name: string;
  organization_id: string;
  status: 'active' | 'paused' | 'inactive';
}

interface SupabaseConnectionData {
  isConnected: boolean;
  orgName: string | null;
  orgId: string | null;
  projects: SupabaseProject[];
}

export function useSupabaseConnection() {
  const { supabase, session } = useSupabase();
  const [connectionData, setConnectionData] = useState<SupabaseConnectionData>({
    isConnected: false,
    orgName: null,
    orgId: null,
    projects: []
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

  const fetchProjects = useCallback(async (accessToken: string) => {
    try {
      // Check local storage cache first
      const cachedData = localStorage.getItem(`supabase_projects_cache`);
      if (cachedData) {
        const { data: cachedProjects, timestamp } = JSON.parse(cachedData);
        // Cache is valid for 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return cachedProjects;
        }
      }

      const response = await fetch('/api/supabase/projects', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Supabase projects');
      }

      const projects = await response.json();
      
      // Update local storage cache
      localStorage.setItem(`supabase_projects_cache`, JSON.stringify({
        data: projects,
        timestamp: Date.now()
      }));

      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      // If there's an error, try to use cached data as fallback
      const cachedData = localStorage.getItem(`supabase_projects_cache`);
      if (cachedData) {
        const { data: cachedProjects } = JSON.parse(cachedData);
        return cachedProjects;
      }
      return [];
    }
  }, []);

  const checkConnection = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession?.user?.id) {
      console.log('No user ID available for connection check');
      return;
    }

    try {
      const { data: connection, error } = await supabase
        .from('supabase_connections')
        .select('*')
        .eq('user_id', currentSession.user.id)
        .eq('connected', true)
        .maybeSingle();

      if (error) throw error;

      if (connection?.access_token) {
        const projects = await fetchProjects(connection.access_token);
        setConnectionData({
          isConnected: !!connection,
          orgName: connection?.org_name || null,
          orgId: connection?.org_id || null,
          projects: projects || []
        });
      } else {
        setConnectionData({
          isConnected: !!connection,
          orgName: connection?.org_name || null,
          orgId: connection?.org_id || null,
          projects: []
        });
      }
    } catch (error) {
      console.error('Error checking Supabase connection:', error);
      setConnectionData({
        isConnected: false,
        orgName: null,
        orgId: null,
        projects: []
      });
    }
  }, [supabase, fetchProjects]);

  const connectSupabase = useCallback(async () => {
    if (!session?.user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to connect Supabase',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const width = 600;
      const height = 800;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const clientId = process.env.NEXT_PUBLIC_SUPABASE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/auth/supabase/callback`;
      const returnTo = `${window.location.pathname}${window.location.search}`;
      
      const authUrl = `https://api.supabase.com/v1/oauth/authorize?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=all` +
        `&state=${encodeURIComponent(returnTo)}`;

      const authWindow = window.open(
        authUrl,
        'Supabase Connection',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!authWindow) {
        throw new Error('Failed to open authentication window');
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
        if (event.origin !== window.location.origin) return;
        
        if (event.data?.type === 'SUPABASE_CONNECTION_SUCCESS') {
          clearInterval(closeCheckInterval);
          const url = new URL(event.data.url);
          const orgName = url.searchParams.get('org');
          
          if (orgName) {
            // Update local state immediately
            setConnectionData({
              isConnected: true,
              orgName,
              orgId: null, // Will be updated by checkConnection
              projects: [] // Will be updated by checkConnection
            });
            
            // Check connection to get full data
            await checkConnection();
            
            // Show success message
            toast({
              title: 'Success',
              description: 'Supabase account connected successfully',
              status: 'success',
              duration: 3000,
            });
          }
          
          window.removeEventListener('message', handleMessage);
          setIsLoading(false);
        }
      };

      window.addEventListener('message', handleMessage);

      // Add cleanup timeout
      const cleanup = setTimeout(() => {
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
      }, 300000); // 5 minutes timeout

      return () => {
        clearTimeout(cleanup);
        window.removeEventListener('message', handleMessage);
      };

    } catch (error) {
      console.error('Error connecting Supabase:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect Supabase account',
        status: 'error',
        duration: 3000,
      });
      setIsLoading(false);
    }
  }, [session?.user?.id, supabase, toast]);

  const disconnectSupabase = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('supabase_connections')
        .update({
          connected: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id);

      if (error) throw error;

      setConnectionData({
        isConnected: false,
        orgName: null,
        orgId: null,
        projects: []
      });

      toast({
        title: 'Success',
        description: 'Supabase account disconnected successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error disconnecting Supabase:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect Supabase account',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, supabase, toast]);

  // Listen for real-time changes
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('supabase_connection_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supabase_connections',
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
    connectSupabase,
    disconnectSupabase,
    checkConnection
  };
} 