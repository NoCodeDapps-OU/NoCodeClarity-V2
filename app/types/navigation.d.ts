import 'next/navigation';

declare module 'next/navigation' {
  export interface NavigateOptions {
    scroll?: boolean;
    shallow?: boolean;
  }

  export interface AppRouterInstance {
    push(href: string, options?: NavigateOptions): void;
    replace(href: string, options?: NavigateOptions): void;
    refresh(): void;
    back(): void;
    forward(): void;
    prefetch(href: string): void;
  }
} 