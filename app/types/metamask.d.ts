import type { EthereumProvider } from './ethereum.types';

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {}; 