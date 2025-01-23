import { useState, useEffect, useCallback, useRef } from 'react';
import { useStacksWallet } from '@/hooks/useStacksWallet';
import BigNumber from 'bignumber.js';
import { 
  fetchCallReadOnlyFunction, 
  standardPrincipalCV,
  ClarityValue,
  cvToString
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import type { TokenBalances } from '@/types/wallet.types';
import { handleError, isOnline } from '@/lib/errorHandling';
import { NOCC_CONTRACT } from '@/lib/constants';

// Extend the existing BalanceUpdateEvent type
declare global {
  interface BalanceUpdateEventDetail {
    address: string;
    balance?: string;
    noccBalance?: string;
    needsUpdate?: boolean;
  }
}

// Adjust intervals to prevent rate limiting
const REFRESH_INTERVAL = 30000; // 30 seconds
const STALE_TIME = 15000; // 15 seconds
const RETRY_DELAY = 5000; // 5 seconds

// Add rate limiting
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 30; // Max requests per minute

BigNumber.config({
  DECIMAL_PLACES: 6,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-10, 20]
});

// Add constants for error handling
const RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000;
const CACHE_KEY = 'stacks-token-balances';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const FETCH_DEBOUNCE = 1000; // 1 second debounce

// Add type guard for wallet address
const isValidAddress = (address: string | null): address is string => {
  return typeof address === 'string' && address.length > 0;
};

// Update the cache helpers to handle null addresses safely
const getCachedBalances = (address: string | null) => {
  if (!isValidAddress(address)) return null;
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}-${address}`);
    if (cached) {
      const { balances, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return balances;
      }
    }
  } catch (error) {
    console.warn('Error reading cached balances:', error);
  }
  return null;
};

const setCachedBalances = (address: string | null, balances: TokenBalances) => {
  if (!address) return;
  try {
    localStorage.setItem(`${CACHE_KEY}-${address}`, JSON.stringify({
      balances,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Error caching balances:', error);
  }
};

const clearCachedBalances = (address: string | null) => {
  if (!address) return;
  try {
    localStorage.removeItem(`${CACHE_KEY}-${address}`);
  } catch (error) {
    console.warn('Error clearing cached balances:', error);
  }
};

export function useStacksTokens() {
  const { walletData } = useStacksWallet();
  const [balances, setBalances] = useState<TokenBalances>({
    stx: '0',
    nocc: '0',
    loading: false
  });
  const lastFetchTime = useRef<number>(0);
  const isMounted = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch balances with rate limiting and caching
  const fetchBalances = useCallback(async (force = false) => {
    if (!isValidAddress(walletData.address) || !walletData.isConnected) return;

    const address = walletData.address;

    // Check cache first
    const now = Date.now();
    const cached = getCachedBalances(address);
    
    if (!force && cached) {
      const timeSinceLastFetch = now - lastFetchTime.current;
      if (timeSinceLastFetch < CACHE_DURATION) {
        setBalances(cached);
        return;
      }
    }

    // Clear any pending fetch
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Debounce the fetch
    fetchTimeoutRef.current = setTimeout(async () => {
      try {
        setBalances(prev => ({ ...prev, loading: true }));

        // Use local API route instead of direct calls
        const response = await fetch('/api/stacks/balance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address })
        });

        if (!response.ok) throw new Error('Failed to fetch balances');
        
        const data = await response.json();

        if (isMounted.current) {
          const newBalances = {
            stx: formatSTXAmount(data.stx),
            nocc: formatNOCCAmount(data.nocc),
            loading: false
          };

          setBalances(newBalances);
          lastFetchTime.current = now;
          setCachedBalances(address, newBalances);
        }
      } catch (error) {
        console.error('Error fetching balances:', error);
        if (cached && isMounted.current) {
          setBalances(cached);
        }
      } finally {
        if (isMounted.current) {
          setBalances(prev => ({ ...prev, loading: false }));
        }
      }
    }, FETCH_DEBOUNCE);

  }, [walletData.address, walletData.isConnected]);

  // Update the useEffect for initial fetch
  useEffect(() => {
    isMounted.current = true;

    // Only fetch on initial mount if we don't have cached data
    if (walletData.isConnected && walletData.address) {
      const cached = getCachedBalances(walletData.address);
      if (cached) {
        setBalances(cached);
      }
    } else {
      setBalances({ stx: '0', nocc: '0', loading: false });
    }

    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency array

  // Update balance update handler
  useEffect(() => {
    const handleBalanceUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<BalanceUpdateEventDetail>;
      if (!customEvent.detail?.needsUpdate || !walletData.isConnected || !walletData.address) return;
      
      // Don't auto-fetch, let the user trigger refresh manually
      // This prevents constant fetching on transaction updates
    };

    window.addEventListener('stacks-balance-update', handleBalanceUpdate);
    return () => {
      window.removeEventListener('stacks-balance-update', handleBalanceUpdate);
    };
  }, [walletData.isConnected, walletData.address]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      isMounted.current = false;
    };
  }, []);

  // Update the manual refresh function to force fetch
  const refreshAllBalances = useCallback(() => {
    if (!walletData.isConnected || !walletData.address) return;
    
    // Clear cache before fetching
    clearCachedBalances(walletData.address);
    return fetchBalances(true);
  }, [walletData.isConnected, walletData.address, fetchBalances]);

  return {
    stx: balances.stx,
    nocc: balances.nocc,
    loading: balances.loading,
    refreshBalance: fetchBalances,
    refreshAllBalances
  };
}

function formatSTXAmount(balanceStr: string): string {
  try {
    // Ensure we're working with a valid number
    const balance = typeof balanceStr === 'string' ? 
      parseInt(balanceStr, 10) : 
      Number(balanceStr);

    if (isNaN(balance)) return '0';
    
    // Convert to STX units (1 STX = 1,000,000 microSTX)
    const stxBalance = balance / 1_000_000;
    
    // Format based on size
    if (stxBalance >= 1_000_000_000) {
      return `${(stxBalance / 1_000_000_000).toFixed(1)}B`;
    } else if (stxBalance >= 1_000_000) {
      return `${(stxBalance / 1_000_000).toFixed(1)}M`;
    } else if (stxBalance >= 1_000) {
      return `${(stxBalance / 1_000).toFixed(1)}k`;
    } else {
      // For small numbers, show up to 4 decimal places but trim trailing zeros
      const formatted = stxBalance.toFixed(4);
      return formatted.replace(/\.?0+$/, '');
    }
  } catch (error) {
    console.error('Error formatting STX balance:', error);
    return '0';
  }
}

function formatNOCCAmount(balanceStr: string): string {
  try {
    // Handle the (ok u123) format
    const match = balanceStr.match(/\(ok u(\d+)\)/);
    const rawBalance = match ? parseInt(match[1], 10) : parseInt(balanceStr, 10);
    
    if (isNaN(rawBalance)) return '0';
    
    // Convert to NOCC units (1 NOCC = 1,000 microNOCC)
    const noccBalance = rawBalance / 1_000;
    
    // Format based on size
    if (noccBalance >= 1_000_000_000) {
      return `${(noccBalance / 1_000_000_000).toFixed(1)}B`;
    } else if (noccBalance >= 1_000_000) {
      return `${(noccBalance / 1_000_000).toFixed(1)}M`;
    } else if (noccBalance >= 1_000) {
      return `${(noccBalance / 1_000).toFixed(1)}k`;
    } else {
      // For small numbers, show 1 decimal place but trim trailing zeros
      const formatted = noccBalance.toFixed(1);
      return formatted.replace(/\.0$/, '');
    }
  } catch (error) {
    console.error('Error formatting NOCC balance:', error);
    return '0';
  }
}