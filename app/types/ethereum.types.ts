import { Eip1193Provider } from 'ethers';

export type EthereumProvider = Eip1193Provider & {
  isMetaMask?: boolean;
  selectedAddress?: string;
  chainId?: string;
  on(event: string, callback: (...args: any[]) => void): void;
  removeListener(event: string, callback: (...args: any[]) => void): void;
  removeAllListeners(event: string): void;
  request<T = any>(args: { method: string; params?: any[] }): Promise<T>;
  setMaxListeners?(n: number): void;
  getMaxListeners?(): number;
  listenerCount?(eventName: string): number;
};

export {}; 