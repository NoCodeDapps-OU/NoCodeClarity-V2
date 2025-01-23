import { useState, useCallback, useEffect, useRef } from 'react';
import { ethers, Eip1193Provider } from 'ethers';
import { useSupabase } from '@/hooks/useSupabase';
import { Database } from '@/types/database.types';
import type { EthereumProvider } from '@/types/ethereum.types';
import { useToast } from '@chakra-ui/react';

interface WalletData {
  isConnected: boolean;
  address: string;
  chainId: string;
  balance: string;
}

type WalletConnectionInsert = Database['public']['Tables']['wallet_connections']['Insert'];

// Initial states as functions to ensure consistent initialization
const getInitialWalletData = () => ({
  isConnected: false,
  address: '',
  chainId: '',
  balance: '0'
});

interface CachedWalletData {
  address: string;
  isConnected: boolean;
}

const ROOTSTOCK_CACHE_KEY = 'rootstock-connection-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useRootstockWallet(cachedData?: CachedWalletData) {
  // Move all hook calls to the top level
  const { supabase, session } = useSupabase();
  const [walletData, setWalletData] = useState<WalletData>(() => {
    if (cachedData) {
      return {
        isConnected: cachedData.isConnected,
        address: cachedData.address,
        chainId: '',
        balance: '0'
      };
    }
    return getInitialWalletData();
  });
  const [isLoading, setIsLoading] = useState(false);
  const providerRef = useRef<EthereumProvider | null>(null);
  const previousAddress = useRef<string | null>(null);
  const toast = useToast();

  // Get provider helper
  const getProvider = useCallback((): EthereumProvider | null => {
    if (!window.ethereum) return null;
    if (!providerRef.current) {
      providerRef.current = window.ethereum;
    }
    return providerRef.current;
  }, []);

  // Define disconnectWallet before it's used
  const disconnectWallet = useCallback(async () => {
    try {
      const provider = getProvider();
      if (provider) {
        try {
          await provider.request({
            method: 'eth_accounts',
            params: []
          });
        } catch (e) {
          console.log('Could not clear accounts:', e);
        }
      }

      // Update database connection status
      if (session?.user?.id) {
        const { error } = await supabase
          .from('wallet_connections')
          .update({ 
            connected: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id)
          .eq('wallet_type', 'rootstock');

        if (error) {
          console.error('Error updating wallet connection:', error);
          throw error;
        }
      }

      // Clear local state
      setWalletData(getInitialWalletData());
      
      // Clear all local storage items
      localStorage.removeItem('rootstock_wallet_connection');
      localStorage.removeItem(ROOTSTOCK_CACHE_KEY);
      
      window.dispatchEvent(new CustomEvent('rsk_accountsChanged', {
        detail: { address: null, connected: false }
      }));

      // Dispatch event for user menu
      window.dispatchEvent(new CustomEvent('wallet_state_changed', {
        detail: { 
          type: 'rootstock',
          address: null,
          connected: false,
          timestamp: Date.now()
        }
      }));

      // Add toast notification for disconnect
      toast({
        title: 'Wallet Disconnected',
        description: 'Successfully disconnected from MetaMask',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast({
        title: 'Disconnect Failed',
        description: 'Failed to disconnect wallet',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    }
  }, [getProvider, session?.user?.id, supabase, toast]);

  // Update checkExistingConnection to properly handle connection state
  const checkExistingConnection = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      // First check local cache for immediate UI update
      const cached = localStorage.getItem(ROOTSTOCK_CACHE_KEY);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          // Use cached data immediately for faster UI update
          setWalletData({
            isConnected: cachedData.connected,
            address: cachedData.wallet_address,
            chainId: cachedData.chain_id || '',
            balance: cachedData.balance || '0'
          });
          
          // Dispatch immediate UI update event
          window.dispatchEvent(new CustomEvent('wallet_state_changed', {
            detail: { 
              type: 'rootstock',
              address: cachedData.wallet_address,
              connected: cachedData.connected,
              timestamp: Date.now()
            }
          }));
          
          // If cache is still fresh, don't query database yet
          if (Date.now() - timestamp < CACHE_DURATION / 2) {
            setIsLoading(false);
            return;
          }
        }
      }
      
      // Query database in background without blocking UI
      void (async () => {
        const { data: storedConnection, error } = await supabase
          .from('wallet_connections')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('wallet_type', 'rootstock')
          .maybeSingle();

        if (error) throw error;

        if (storedConnection?.connected) {
          setWalletData(prev => ({
            isConnected: true,
            address: storedConnection.wallet_address,
            chainId: storedConnection.chain_id || prev.chainId,
            balance: storedConnection.balance || prev.balance
          }));
          
          // Update cache with fresh data
          localStorage.setItem(ROOTSTOCK_CACHE_KEY, JSON.stringify({
            data: storedConnection,
            timestamp: Date.now()
          }));

          // Dispatch update event only if data changed
          if (storedConnection.wallet_address !== walletData.address) {
            window.dispatchEvent(new CustomEvent('wallet_state_changed', {
              detail: { 
                type: 'rootstock',
                address: storedConnection.wallet_address,
                connected: true,
                timestamp: Date.now()
              }
            }));
          }
        }
      })();
    } catch (error) {
      console.error('Error checking existing connection:', error);
      setWalletData(getInitialWalletData());
      localStorage.removeItem(ROOTSTOCK_CACHE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, supabase, walletData.address]);

  // Set up event listeners
  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        await disconnectWallet();
        // Dispatch wallet state change event for disconnect
        window.dispatchEvent(new CustomEvent('wallet_state_changed', {
          detail: {
            type: 'rootstock',
            connected: false,
            address: null,
            timestamp: Date.now()
          }
        }));
      } else if (accounts[0] !== previousAddress.current) {
        checkExistingConnection();
        // Dispatch wallet state change event for new connection
        window.dispatchEvent(new CustomEvent('wallet_state_changed', {
          detail: {
            type: 'rootstock',
            connected: true,
            address: accounts[0],
            timestamp: Date.now()
          }
        }));
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    // Check connection on mount
    checkExistingConnection();

    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
    };
  }, [getProvider, checkExistingConnection]);

  // Connect wallet with integrated toast notifications
  const connectWallet = useCallback(async () => {
    if (!session?.user?.id) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to connect your wallet',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    try {
      setIsLoading(true);
      const provider = getProvider();
      
      if (!provider) {
        toast({
          title: 'Wallet Not Found',
          description: 'Please install MetaMask',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
        return;
      }

      // First disconnect any existing connection
      if (walletData.isConnected) {
        await disconnectWallet();
      }

      // Force MetaMask to show the account selection popup
      const accounts = await provider.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      }).then(() => {
        return provider.request({
          method: 'eth_requestAccounts',
          params: []
        });
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Get the chain ID
      const chainId = await provider.request({ method: 'eth_chainId' });

      // Get balance using ethers
      const ethersProvider = new ethers.BrowserProvider(provider);
      const balance = await ethersProvider.getBalance(accounts[0]);

      // Update wallet state with all required properties
      setWalletData({
        isConnected: true,
        address: accounts[0],
        chainId: chainId,
        balance: ethers.formatEther(balance)
      });

      // Store in localStorage
      localStorage.setItem('rootstock_wallet_connection', JSON.stringify({
        address: accounts[0],
        connected: true,
        timestamp: Date.now()
      }));

      // Update Supabase if user is authenticated
      if (session?.user?.id) {
        const walletConnection: WalletConnectionInsert = {
          user_id: session.user.id,
          wallet_type: 'rootstock',
          wallet_address: accounts[0],
          connected: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Use upsert with onConflict to handle the unique constraint
        const { error } = await supabase
          .from('wallet_connections')
          .upsert(walletConnection, {
            onConflict: 'user_id,wallet_type',
            ignoreDuplicates: false
          });

        if (error) {
          console.error('Error updating wallet connection:', error);
          // Don't throw here, as the wallet is still connected
        }
      }

      // Dispatch connection event
      window.dispatchEvent(new CustomEvent('rsk_accountsChanged', {
        detail: { address: accounts[0], connected: true }
      }));

      // Dispatch event for user menu
      window.dispatchEvent(new CustomEvent('wallet_state_changed', {
        detail: { 
          type: 'rootstock',
          address: accounts[0],
          connected: true,
          timestamp: Date.now()
        }
      }));

      toast({
        title: 'Wallet Connected',
        description: 'Successfully connected to MetaMask',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

    } catch (error: any) {
      // Handle user rejection specifically
      if (error?.code === 4001) {
        toast({
          title: 'Connection Cancelled',
          description: 'You declined the connection request',
          status: 'warning',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
        return;
      }

      console.error('Wallet connection error:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setIsLoading(false);
    }
  }, [getProvider, session?.user?.id, supabase, toast]);

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    walletData,
    isLoading,
    connectWallet,
    disconnectWallet,
    formatAddress
  };
} 