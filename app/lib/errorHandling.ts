import { Toast } from '@chakra-ui/react';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  API = 'API',
  WALLET = 'WALLET',
  UNKNOWN = 'UNKNOWN'
}

// Error codes
export enum ErrorCode {
  OFFLINE = 'ERR_INTERNET_DISCONNECTED',
  CONNECTION_RESET = 'ERR_CONNECTION_RESET',
  NETWORK_IO = 'ERR_NETWORK_IO_SUSPENDED',
  TIMEOUT = 'ERR_TIMEOUT',
  RATE_LIMIT = 'ERR_RATE_LIMIT',
  TUNNEL_CONNECTION = 'ERR_TUNNEL_CONNECTION_FAILED'
}

interface ErrorHandlerOptions {
  silent?: boolean;
  retry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

// Cache management
const ERROR_CACHE_KEY = 'error-state';
const ERROR_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class NetworkError extends Error {
  type: ErrorType;
  code: ErrorCode;
  
  constructor(message: string, type: ErrorType, code: ErrorCode) {
    super(message);
    this.type = type;
    this.code = code;
    this.name = 'NetworkError';
  }
}

// Helper to check if online
export const isOnline = () => {
  return typeof window !== 'undefined' ? window.navigator.onLine : true;
};

// Retry logic with exponential backoff
const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (!isOnline()) break;
      await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, i)));
    }
  }
  
  throw lastError!;
};

// Main error handler
export const handleError = async <T>(
  operation: () => Promise<T>,
  {
    silent = false,
    retry: shouldRetry = true,
    maxRetries = 3,
    retryDelay = 1000
  }: ErrorHandlerOptions = {}
): Promise<T> => {
  try {
    if (!isOnline()) {
      throw new NetworkError(
        'No internet connection',
        ErrorType.NETWORK,
        ErrorCode.OFFLINE
      );
    }

    const result = shouldRetry 
      ? await retry(operation, maxRetries, retryDelay)
      : await operation();

    return result;
  } catch (error: any) {
    // Handle specific error types
    const networkError = parseNetworkError(error);
    
    // Only show toast for network errors, suppress console
    if (!silent) {
      showErrorToast(networkError);
    }

    // Cache error state
    cacheErrorState(networkError);

    // Prevent error from propagating to console for network issues
    if (networkError.type === ErrorType.NETWORK) {
      return Promise.reject(networkError);
    }

    throw networkError;
  }
};

// Parse network errors
const parseNetworkError = (error: any): NetworkError => {
  if (error instanceof NetworkError) return error;

  const message = error.message || 'An error occurred';
  let type = ErrorType.UNKNOWN;
  let code = ErrorCode.NETWORK_IO;

  // Check for network-related errors first
  if (
    message.includes('Failed to fetch') || 
    message.includes('NetworkError') ||
    message.includes('net::ERR')
  ) {
    type = ErrorType.NETWORK;
    if (message.includes('ERR_INTERNET_DISCONNECTED')) {
      code = ErrorCode.OFFLINE;
    } else if (message.includes('ERR_CONNECTION_RESET')) {
      code = ErrorCode.CONNECTION_RESET;
    } else if (message.includes('ERR_TUNNEL_CONNECTION_FAILED')) {
      code = ErrorCode.TUNNEL_CONNECTION;
    }
  }

  return new NetworkError(message, type, code);
};

// Show error toast with improved messages
const showErrorToast = (error: NetworkError) => {
  const messages = {
    [ErrorCode.OFFLINE]: 'No internet connection. Please check your network.',
    [ErrorCode.CONNECTION_RESET]: 'Connection lost. Please check your internet connection.',
    [ErrorCode.NETWORK_IO]: 'Network error. Please check your internet connection.',
    [ErrorCode.TIMEOUT]: 'Request timed out. Please check your internet connection.',
    [ErrorCode.RATE_LIMIT]: 'Too many requests. Please wait a moment.',
    [ErrorCode.TUNNEL_CONNECTION]: 'VPN or proxy connection error. Please check your connection settings.'
  };

  Toast({
    title: error.type === ErrorType.NETWORK ? 'Network Error' : 'Connection Error',
    description: messages[error.code] || error.message,
    status: 'error',
    duration: 5000,
    isClosable: true,
    position: 'top-right'
  });
};

// Cache error state
const cacheErrorState = (error: NetworkError) => {
  try {
    localStorage.setItem(ERROR_CACHE_KEY, JSON.stringify({
      error: {
        message: error.message,
        type: error.type,
        code: error.code
      },
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Failed to cache error state:', e);
  }
};

// Get cached error state
export const getCachedErrorState = () => {
  try {
    const cached = localStorage.getItem(ERROR_CACHE_KEY);
    if (cached) {
      const { error, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ERROR_CACHE_DURATION) {
        return new NetworkError(error.message, error.type, error.code);
      }
    }
  } catch (e) {
    console.warn('Failed to get cached error state:', e);
  }
  return null;
}; 