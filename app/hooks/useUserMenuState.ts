'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/providers/SupabaseProvider';
import { useUserStore } from '@/stores/userStore';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import { useRootstockWallet } from '@/hooks/useRootstockWallet';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export const useUserMenuState = () => {
  const router = useRouter();
  const { auth, from } = useSupabase();
  const { userMenu, setUserMenu, updateUserMenu } = useUserStore();
  const { walletData: stacksWallet } = useStacksWallet();
  const { walletData: rootstockWallet } = useRootstockWallet();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await auth.getUser();
        if (error) throw error;
        
        if (user && (!userMenu.userEmail || !userMenu.username)) {
          const { data: profile } = await from('users')
            .select('name')
            .eq('id', user.id)
            .single();
            
          setUserMenu({
            userEmail: user.email || null,
            username: profile?.name || null,
            loading: false,
            walletConnections: userMenu.walletConnections || {}
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        updateUserMenu({ loading: false });
      }
    };

    if (!userMenu.userEmail || !userMenu.username) {
      getUser();
    }

    const { data: { subscription } } = auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN') {
        getUser();
      } else if (event === 'SIGNED_OUT') {
        setUserMenu({
          userEmail: null,
          username: null,
          loading: false,
          walletConnections: {}
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [auth, from, userMenu.userEmail, userMenu.username, userMenu.walletConnections]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const handleWalletStateChange = (event: CustomEvent<{
      type: 'stacks' | 'rootstock';
      connected: boolean;
      address: string | null;
      timestamp?: number;
    }>) => {
      const { type, connected, address } = event.detail;
      
      updateUserMenu({
        walletConnections: {
          ...userMenu.walletConnections,
          [type]: {
            address: address || '',
            isConnected: connected
          }
        }
      });
    };

    const handleStacksChange = (event: CustomEvent) => {
      const { address, connected } = event.detail;
      updateUserMenu({
        walletConnections: {
          ...userMenu.walletConnections,
          stacks: {
            address: address || '',
            isConnected: connected
          }
        }
      });
    };

    const handleRootstockChange = (event: CustomEvent) => {
      const { address, connected } = event.detail;
      updateUserMenu({
        walletConnections: {
          ...userMenu.walletConnections,
          rootstock: {
            address: address || '',
            isConnected: connected
          }
        }
      });
    };

    window.addEventListener('wallet_state_changed', handleWalletStateChange as EventListener);
    window.addEventListener('stx_accountsChanged', handleStacksChange as EventListener);
    window.addEventListener('rsk_accountsChanged', handleRootstockChange as EventListener);
    
    return () => {
      window.removeEventListener('wallet_state_changed', handleWalletStateChange as EventListener);
      window.removeEventListener('stx_accountsChanged', handleStacksChange as EventListener);
      window.removeEventListener('rsk_accountsChanged', handleRootstockChange as EventListener);
    };
  }, [updateUserMenu, userMenu.walletConnections]);

  useEffect(() => {
    if (!hasMounted) return;

    updateUserMenu({
      walletConnections: {
        stacks: {
          address: stacksWallet?.address || '',
          isConnected: !!stacksWallet?.isConnected
        },
        rootstock: {
          address: rootstockWallet?.address || '',
          isConnected: !!rootstockWallet?.isConnected
        }
      }
    });
  }, [
    hasMounted,
    stacksWallet?.isConnected,
    stacksWallet?.address,
    rootstockWallet?.isConnected,
    rootstockWallet?.address,
    updateUserMenu
  ]);

  return {
    userEmail: userMenu.userEmail,
    username: userMenu.username,
    loading: userMenu.loading,
    walletConnections: userMenu.walletConnections,
    handleProfileClick: () => router.push('/profile'),
    handleSignOut: async () => {
      await auth.signOut();
      router.push('/');
    },
    getInitial: (email: string) => email.charAt(0).toUpperCase()
  };
}; 