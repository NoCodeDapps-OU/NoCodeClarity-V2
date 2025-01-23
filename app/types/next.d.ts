import type { 
  AppRouterInstance, 
  NavigateOptions,
  ReadonlyURLSearchParams
} from 'next/navigation';

declare module 'next/navigation' {
  export type { 
    AppRouterInstance as Router,
    NavigateOptions,
    ReadonlyURLSearchParams
  };

  export function useRouter(): AppRouterInstance;
  export function useSearchParams(): ReadonlyURLSearchParams;
  export function usePathname(): string;
  export function useParams(): { [key: string]: string | string[] };
} 