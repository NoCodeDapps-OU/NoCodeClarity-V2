export type StacksAccountChangeEvent = CustomEvent<{
  address: string;
  connected: boolean;
}>;

export type BalanceUpdateEvent = CustomEvent<{
  address: string;
  balance: string;
  noccBalance?: string;
}>;

export interface WalletData {
  isConnected: boolean;
  address: string | null;
  chainId?: string | null;
}

export interface CachedWalletData {
  address: string;
  isConnected: boolean;
  chainId?: string | null;
}

export interface TokenBalances {
  stx: string;
  nocc: string;
  loading: boolean;
}

export interface WalletConnection {
  isConnected: boolean;
  address: string | null;
}

// Add Stacks specific types
export interface StacksProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  isStacksProvider?: boolean;
  selectedAddress?: string | null;
  chainId?: string;
  on(event: string, callback: (...args: any[]) => void): void;
  removeListener(event: string, callback: (...args: any[]) => void): void;
}

// Add proper typing for WebSocket events
export interface StacksWebSocketMessage {
  type: string;
  payload: {
    tx_status: string;
    tx_id: string;
  };
} 