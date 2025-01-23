'use client';

import { useEffect } from 'react';

export function useHydrationFix() {
  useEffect(() => {
    // Fix hydration issues with wallet connections
    const fixWalletHydration = () => {
      const stacksCache = localStorage.getItem('stacks-wallet-connection');
      const rootstockCache = localStorage.getItem('rootstock-wallet-connection');

      if (stacksCache) {
        try {
          const { data, timestamp } = JSON.parse(stacksCache);
          if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
            localStorage.removeItem('stacks-wallet-connection');
          }
        } catch (e) {
          localStorage.removeItem('stacks-wallet-connection');
        }
      }

      if (rootstockCache) {
        try {
          const { data, timestamp } = JSON.parse(rootstockCache);
          if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
            localStorage.removeItem('rootstock-wallet-connection');
          }
        } catch (e) {
          localStorage.removeItem('rootstock-wallet-connection');
        }
      }
    };

    fixWalletHydration();
  }, []);
} 