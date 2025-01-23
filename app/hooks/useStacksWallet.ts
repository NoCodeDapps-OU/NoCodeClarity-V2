'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';
import type { 
  StacksAccountChangeEvent, 
  BalanceUpdateEvent,
  WalletData 
} from '@/types/wallet.types';
import { useUserStore } from '@/stores/userStore';
import { connectWebSocketClient } from '@stacks/blockchain-api-client';
import { STACKS_MAINNET } from '@stacks/network';
import { showConnect } from '@stacks/connect';
import { fetchCallReadOnlyFunction, standardPrincipalCV, cvToString } from '@stacks/transactions';
import type { 
  AuthOptions,
  FinishedAuthData 
} from '@stacks/connect';
import { useToast } from '@chakra-ui/react';
import { useSupabase } from '@/providers/SupabaseProvider';
import { NOCC_CONTRACT } from '@/lib/constants';

// Add this to suppress the legacy warning
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes?.('Legacy Leather request detected')) {
    return; // Suppress the specific warning
  }
  originalConsoleWarn.apply(console, args);
};

const STACKS_EVENTS = {
  ACCOUNT_CHANGE: 'stx_accountsChanged' as const,
  NETWORK_CHANGE: 'stx_networkChanged' as const
};

// Add type definition for custom events
type HTMLElementEvent<T extends HTMLElement> = Event & {
  target: T;
}

// Add event type declaration
declare global {
  interface WindowEventMap {
    'stx_accountsChanged': StacksAccountChangeEvent;
    'stacks-balance-update': BalanceUpdateEvent;
    'StacksProvider': Event;
  }
}

const getInitialWalletData = (): WalletData => ({
  isConnected: false,
  address: null,
  chainId: null
});

interface CachedWalletData {
  address: string;
  isConnected: boolean;
  chainId?: string | null;
}

const WALLET_CACHE_KEY = 'wallet-connection-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useStacksWallet(cachedData?: CachedWalletData) {
  const [walletData, setWalletData] = useState<WalletData>(() => {
    if (cachedData) {
      return {
        isConnected: cachedData.isConnected,
        address: cachedData.address,
        chainId: cachedData.chainId ?? null
      };
    }
    return getInitialWalletData();
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Then all useRef hooks
  const wsClientRef = useRef<any>(null);
  const wsConnectingRef = useRef<boolean>(false);
  const mounted = useRef(true);
  const previousAddress = useRef<string | null>(null);
  
  // Then all context hooks
  const { user, supabase, isAuthenticated } = useSupabase();
  const toast = useToast();

  // Cleanup function for WebSocket
  const cleanupWebSocket = useCallback(() => {
    if (wsClientRef.current?.webSocket) {
      try {
        if (wsClientRef.current.webSocket.readyState === WebSocket.OPEN) {
          wsClientRef.current.webSocket.close();
        }
      } catch (error) {
        console.warn('Error closing WebSocket:', error);
      }
      wsClientRef.current = null;
    }
    wsConnectingRef.current = false;
  }, []);

  // Update cleanup in useEffect
  useEffect(() => {
    mounted.current = true;
    
    return () => {
      mounted.current = false;
      cleanupWebSocket();
    };
  }, [cleanupWebSocket]);

  // Handle wallet changes
  useEffect(() => {
    if (walletData.address) {
      // Cleanup previous connection before establishing new one
      cleanupWebSocket();
      // Setup new WebSocket connection...
    }
  }, [walletData.address, cleanupWebSocket]);

  // Update fetchAndUpdateBalance to handle both STX and NOCC balances
  const fetchAndUpdateBalance = useCallback(async (address: string) => {
    try {
      // Fetch STX balance
      const response = await fetch(
        `https://api.mainnet.hiro.so/extended/v1/address/${address}/stx`
      );
      const balanceData = await response.json();
      
      // Fetch NOCC balance
      const noccResult = await fetchCallReadOnlyFunction({
        contractAddress: NOCC_CONTRACT.address,
        contractName: NOCC_CONTRACT.name,
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(address)],
        network: STACKS_MAINNET,
        senderAddress: address,
      });
      
      if (mounted.current) {
        // Dispatch both balance updates
        const event = new CustomEvent<BalanceUpdateEvent['detail']>('stacks-balance-update', {
          detail: { 
            address,
            balance: balanceData.balance.toString(),
            noccBalance: cvToString(noccResult)
          }
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.warn('Error fetching balances:', error);
    }
  }, []);

  // Then define setupWebSocket which uses fetchAndUpdateBalance
  const setupWebSocket = useCallback(async (address: string) => {
    try {
      // Close existing connection if any
      if (wsClientRef.current?.webSocket?.readyState === WebSocket.OPEN) {
        await wsClientRef.current.webSocket.close();
        wsClientRef.current = null;
      }

      // Connect to Stacks API WebSocket using mainnet
      const wsUrl = new URL(STACKS_MAINNET.client.baseUrl);
      wsUrl.protocol = 'wss:';
      
      const client = await connectWebSocketClient(
        `${wsUrl.toString()}extended/v1/ws`
      );
      wsClientRef.current = client;

      // Subscribe to balance updates for new address but only for transactions
      await client.subscribeAddressTransactions(address, async (event) => {
        // Only fetch balance when transaction is confirmed
        if (event.tx_status === 'success' && mounted.current) {
          await fetchAndUpdateBalance(address);
        }
      });

    } catch (error) {
      console.error('Error setting up WebSocket:', error);
    }
  }, [fetchAndUpdateBalance]);

  // Cleanup WebSocket on unmount or wallet change
  useEffect(() => {
    return () => {
      if (wsClientRef.current?.webSocket?.readyState === WebSocket.OPEN) {
        wsClientRef.current.webSocket.close();
      }
      wsClientRef.current = null;
    };
  }, [walletData.address]);

  // Add a function to fetch balance
  const dispatchBalanceUpdate = (address: string, balance: string) => {
    const event = new CustomEvent<BalanceUpdateEvent['detail']>('stacks-balance-update', {
      detail: { address, balance }
    });
    window.dispatchEvent(event);
  };

  const fetchBalance = useCallback(async (address: string) => {
    try {
      const response = await fetch(
        `https://api.mainnet.hiro.so/extended/v1/address/${address}/stx`
      );
      const balanceData = await response.json();
      
      if (mounted.current && balanceData.balance !== undefined) {
        dispatchBalanceUpdate(address, balanceData.balance.toString());
      }
    } catch (error) {
      console.warn('Error fetching balance:', error);
    }
  }, []);

  // Setup WebSocket connection for real-time balance updates
  useEffect(() => {
    if (!walletData.address || !walletData.isConnected) return;

    const setupWebSocket = async () => {
      try {
        // Connect to Stacks API WebSocket using mainnet
        const wsUrl = new URL(STACKS_MAINNET.client.baseUrl);
        wsUrl.protocol = 'wss:';
        
        const client = await connectWebSocketClient(
          `${wsUrl.toString()}extended/v1/ws`
        );
        wsClientRef.current = client;

        if (walletData.address) {
          // Subscribe to balance updates only for confirmed transactions
          await client.subscribeAddressTransactions(walletData.address, async (event) => {
            if (event.tx_status === 'success' && mounted.current) {
              // Only dispatch event, let the UI decide when to fetch
              window.dispatchEvent(new CustomEvent('stacks-balance-update', {
                detail: { 
                  address: walletData.address,
                  needsUpdate: true
                }
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
      }
    };

    setupWebSocket();

    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.webSocket.close();
        wsClientRef.current = null;
      }
    };
  }, [walletData.address, walletData.isConnected]);

  // Add account change handler
  const handleAccountChange = useCallback(async (event: StacksAccountChangeEvent) => {
    try {
      const address = event.detail.address;
      
      setWalletData(prev => ({
        ...prev,
        isConnected: true,
        address
      }));

      // Setup new WebSocket connection for new address
      await setupWebSocket(address);

      // Dispatch wallet state change event
      window.dispatchEvent(new CustomEvent('wallet_state_changed', {
        detail: {
          type: 'stacks',
          connected: true,
          address,
          timestamp: Date.now()
        }
      }));

    } catch (error) {
      console.error('Error handling account change:', error);
    }
  }, [setupWebSocket]);

  // Add event listeners for wallet changes
  useEffect(() => {
    const handleWalletEvents = (event: StacksAccountChangeEvent) => {
      const newAddress = event.detail.address;
      if (newAddress && newAddress !== walletData.address) {
        void handleAccountChange(event);
      }
    };

    const handleProviderAvailable = () => {
      window.addEventListener(STACKS_EVENTS.ACCOUNT_CHANGE, handleWalletEvents as EventListener);
    };

    if (window.StacksProvider) {
      handleProviderAvailable();
    } else {
      window.addEventListener('StacksProvider', handleProviderAvailable);
    }

    return () => {
      window.removeEventListener(STACKS_EVENTS.ACCOUNT_CHANGE, handleWalletEvents as EventListener);
      window.removeEventListener('StacksProvider', handleProviderAvailable);
    };
  }, [handleAccountChange, walletData.address]);

  const saveWalletConnection = async (address: string) => {
    if (!user?.id) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to connect your wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    try {
      const walletConnectionData = {
        user_id: user.id,
        wallet_type: 'stacks',
        wallet_address: address,
        connected: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('wallet_connections')
        .upsert(walletConnectionData, {
          onConflict: 'user_id,wallet_type'
        });

      if (error) {
        if (error.code === '42P01') {
          toast({
            title: 'Database Setup Required',
            description: 'Please run the database setup SQL in the Supabase SQL editor.',
            status: 'error',
            duration: 7000,
            isClosable: true,
            position: 'top-right'
          });
          console.error('Database setup error:', error);
        }
        throw error;
      }

      // Store in localStorage as backup
      localStorage.setItem('stacks_wallet_connection', JSON.stringify({
        address,
        connected: true,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Error saving wallet connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to save wallet connection',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      throw error;
    }
  };

  // Add event dispatch helper
  const dispatchWalletEvent = useCallback((address: string | null, connected: boolean) => {
    // Dispatch the existing event for backward compatibility
    window.dispatchEvent(new CustomEvent('stx_accountsChanged', {
      detail: { address, connected }
    }));
    
    // Dispatch a new event for the user menu
    window.dispatchEvent(new CustomEvent('wallet_state_changed', {
      detail: { 
        type: 'stacks',
        address,
        connected,
        timestamp: Date.now()
      }
    }));
  }, []);

  // Update connect wallet function
  const connectWallet = useCallback(async () => {
    if (isLoading || !user?.id) return;
    
    try {
      setIsLoading(true);
      
      await showConnect({
        appDetails: {
          name: 'NOCC',
          icon: window.location.origin + '/nocc-logo.png',
        },
        onFinish: async (data: FinishedAuthData) => {
          const address = data.userSession.loadUserData().profile.stxAddress.mainnet;
          
          // Update wallet data first
          setWalletData({
            isConnected: true,
            address
          });

          // Setup WebSocket before saving connection
          await setupWebSocket(address);
          
          // Save wallet connection after WebSocket setup
          await saveWalletConnection(address);
          
          toast({
            title: 'Wallet Connected',
            description: 'Successfully connected to Stacks wallet',
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: 'top-right'
          });

          // Dispatch balance update event after everything is set up
          window.dispatchEvent(new CustomEvent('stacks-balance-update', {
            detail: { address }
          }));

          // Dispatch event after successful connection
          dispatchWalletEvent(address, true);
        },
        onCancel: () => {
          setWalletData(getInitialWalletData());
          setIsLoading(false);
        },
        redirectTo: '/',
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWalletData(getInitialWalletData());
      setIsLoading(false);
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect Stacks wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }
  }, [isLoading, user?.id, saveWalletConnection, setupWebSocket, dispatchWalletEvent]);

  // Update disconnect wallet function
  const disconnectWallet = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // First update database
      const { error } = await supabase
        .from('wallet_connections')
        .update({ 
          connected: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('wallet_type', 'stacks');

      if (error) throw error;

      // Close WebSocket connection first
      if (wsClientRef.current?.webSocket?.readyState === WebSocket.OPEN) {
        await wsClientRef.current.webSocket.close();
        wsClientRef.current = null;
      }

      // Clear all wallet data
      setWalletData(getInitialWalletData());

      // Show success toast
      toast({
        title: 'Wallet Disconnected',
        description: 'Successfully disconnected Stacks wallet',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });

      // Dispatch event after disconnection
      dispatchWalletEvent(null, false);

      // Clear WebSocket connection
      cleanupWebSocket();

      // Clear all local storage items
      localStorage.removeItem('stacks_wallet_connection');
      localStorage.removeItem(WALLET_CACHE_KEY);

    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, supabase, toast, cleanupWebSocket, dispatchWalletEvent]);

  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const checkExistingConnection = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      // First check local cache for immediate UI update
      const cached = localStorage.getItem(WALLET_CACHE_KEY);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          // Use cached data immediately for faster UI update
          setWalletData({
            isConnected: cachedData.connected,
            address: cachedData.wallet_address,
            chainId: cachedData.chain_id ?? null
          });
          
          // If cache is still fresh and shows disconnected, don't query database
          if (Date.now() - timestamp < CACHE_DURATION / 2) {
            setIsLoading(false);
            if (!cachedData.connected) {
              return;
            }
            if (cachedData.connected && cachedData.wallet_address) {
              void setupWebSocket(cachedData.wallet_address);
            }
            return;
          }
        }
      }
      
      // Query database in background
      const { data: storedConnection, error } = await supabase
        .from('wallet_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('wallet_type', 'stacks')
        .maybeSingle();

      if (error) throw error;

      if (storedConnection?.connected) {
        setWalletData({
          isConnected: true,
          address: storedConnection.wallet_address,
          chainId: storedConnection.chain_id ?? null
        });
        
        // Update cache with fresh data
        localStorage.setItem(WALLET_CACHE_KEY, JSON.stringify({
          data: storedConnection,
          timestamp: Date.now()
        }));
        
        void setupWebSocket(storedConnection.wallet_address);
      } else {
        setWalletData(getInitialWalletData());
        // Clear cache if database shows disconnected
        localStorage.removeItem(WALLET_CACHE_KEY);
      }
    } catch (error) {
      console.error('Error checking existing connection:', error);
      setWalletData(getInitialWalletData());
      // Clear cache on error
      localStorage.removeItem(WALLET_CACHE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, supabase, setupWebSocket]);

  // Update the initial useEffect to use cached data immediately
  useEffect(() => {
    const checkWalletStatus = async () => {
      if (!user?.id) return;
      
      try {
        // Check local cache first for immediate display
        const cached = localStorage.getItem(WALLET_CACHE_KEY);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION && cachedData.connected) {
            setWalletData({
              isConnected: true,
              address: cachedData.wallet_address
            });
          }
        }
        
        // Then verify with database in background
        checkExistingConnection();
      } catch (error) {
        console.error('Error checking wallet status:', error);
        setWalletData(getInitialWalletData());
      }
    };

    checkWalletStatus();
  }, [user?.id, checkExistingConnection]);

  // Add a function to check localStorage on mount
  const checkLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('stacks_wallet_connection');
      if (stored) {
        const { address, connected, timestamp } = JSON.parse(stored);
        // Only use if less than 24 hours old
        if (connected && Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setWalletData({
            isConnected: true,
            address
          });
          void setupWebSocket(address);
          void fetchBalance(address);
        }
      }
    } catch (error) {
      console.error('Error checking localStorage:', error);
    }
  }, [setupWebSocket, fetchBalance]);

  // Update the useEffect for initialization
  useEffect(() => {
    if (user?.id) {
      void checkExistingConnection();
    } else {
      // If no user, try localStorage
      checkLocalStorage();
    }
    
    return () => {
      mounted.current = false;
    };
  }, [user?.id, checkExistingConnection, checkLocalStorage]);

  // Update the cleanup effect
  useEffect(() => {
    return () => {
      mounted.current = false;
      // Ensure WebSocket is closed on unmount
      if (wsClientRef.current?.webSocket?.readyState === WebSocket.OPEN) {
        wsClientRef.current.webSocket.close();
      }
      wsClientRef.current = null;
      wsConnectingRef.current = false;
    };
  }, []);

  // Update the effect that handles address changes
  useEffect(() => {
    if (walletData.address !== previousAddress.current) {
      previousAddress.current = walletData.address;
      dispatchWalletEvent(walletData.address, walletData.isConnected);
    }
  }, [walletData.address, walletData.isConnected, dispatchWalletEvent]);

  return {
    walletData,
    isLoading,
    connectWallet,
    disconnectWallet,
    formatAddress,
    isAuthenticated
  };
} 