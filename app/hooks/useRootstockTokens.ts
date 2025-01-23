import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { useRootstockWallet } from '@/hooks/useRootstockWallet';
import type { EthereumProvider } from '@/types/ethereum.types';

interface TokenBalances {
  rbtc: string;
  loading: boolean;
}

const CACHE_KEY = 'rootstock-token-balances';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useRootstockTokens() {
  const { walletData } = useRootstockWallet();
  const [balances, setBalances] = useState<TokenBalances>({
    rbtc: '0',
    loading: true
  });
  const lastFetchTime = useRef<number>(0);

  const getCachedBalances = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Error reading cached balances:', error);
    }
    return null;
  };

  const setCachedBalances = (data: TokenBalances) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      lastFetchTime.current = Date.now();
    } catch (error) {
      console.warn('Error caching balances:', error);
    }
  };

  const fetchBalances = useCallback(async () => {
    const provider = window.ethereum as EthereumProvider | undefined;
    if (!walletData.isConnected || !provider) {
      setBalances(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setBalances(prev => ({ ...prev, loading: true }));
      const ethersProvider = new ethers.BrowserProvider(provider);
      const balance = await ethersProvider.getBalance(walletData.address);
      
      const newBalances = {
        rbtc: formatRBTCBalance(ethers.formatEther(balance)),
        loading: false
      };
      
      setBalances(newBalances);
      setCachedBalances(newBalances);
    } catch (error) {
      console.error('Error fetching RBTC balance:', error);
      const cached = getCachedBalances();
      if (cached) {
        setBalances(cached);
      } else {
        setBalances({
          rbtc: '0',
          loading: false
        });
      }
    }
  }, [walletData.isConnected, walletData.address]);

  const refreshBalance = useCallback(async () => {
    if (!walletData.isConnected || !walletData.address) return;
    
    try {
      setBalances(prev => ({ ...prev, loading: true }));
      await fetchBalances();
    } finally {
      setBalances(prev => ({ ...prev, loading: false }));
    }
  }, [walletData.isConnected, walletData.address, fetchBalances]);

  useEffect(() => {
    if (!walletData.isConnected || !walletData.address) {
      setBalances({ rbtc: '0', loading: false });
      return;
    }

    const init = async () => {
      try {
        // Check cache first for immediate UI update
        const cachedBalances = getCachedBalances();
        if (cachedBalances) {
          setBalances(cachedBalances);
          
          // If cache is fresh enough, don't fetch immediately
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            const { timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION / 2) {
              return;
            }
          }
        }
        
        // Fetch in background without blocking UI
        void (async () => {
          try {
            setBalances(prev => ({ ...prev, loading: true }));
            await fetchBalances();
          } finally {
            setBalances(prev => ({ ...prev, loading: false }));
          }
        })();
      } catch (error) {
        console.error('Error initializing balances:', error);
        setBalances(prev => ({ ...prev, loading: false }));
      }
    };

    void init();

    // Listen for balance update events
    const handleBalanceUpdate = () => {
      void fetchBalances();
    };

    window.addEventListener('rsk_balance_update', handleBalanceUpdate);
    return () => {
      window.removeEventListener('rsk_balance_update', handleBalanceUpdate);
    };
  }, [walletData.isConnected, walletData.address, fetchBalances]);

  return {
    ...balances,
    refreshBalance
  };
}

function formatRBTCBalance(balanceStr: string): string {
  try {
    const balance = parseFloat(balanceStr);
    
    if (balance >= 1_000_000_000) {
      return `${(balance / 1_000_000_000).toFixed(1)}B`;
    } else if (balance >= 1_000_000) {
      return `${(balance / 1_000_000).toFixed(1)}M`;
    } else if (balance >= 1_000) {
      return `${(balance / 1_000).toFixed(1)}k`;
    } else {
      return parseFloat(balance.toFixed(4)).toString();
    }
  } catch (error) {
    console.error('Error formatting RBTC balance:', error);
    return '0';
  }
} 