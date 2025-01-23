import type { StacksAccountChangeEvent, BalanceUpdateEvent } from '@/wallet.types';

declare global {
  interface WindowEventMap {
    'stx_accountsChanged': StacksAccountChangeEvent;
    'stacks-balance-update': BalanceUpdateEvent;
    'StacksProvider': Event;
  }
} 