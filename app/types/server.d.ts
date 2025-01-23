declare module 'next/server' {
  export interface NextRequest extends Request {
    nextUrl: URL;
    cookies: Map<string, string>;
    geo?: {
      city?: string;
      country?: string;
      region?: string;
    };
  }

  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: number | ResponseInit): NextResponse;
    static rewrite(url: string | URL, init?: ResponseInit): NextResponse;
    static next(init?: ResponseInit): NextResponse;
  }
}

declare module 'next/headers' {
  export function cookies(): {
    get(name: string): { value: string } | undefined;
    getAll(): { name: string; value: string }[];
    set(name: string, value: string, options?: any): void;
    delete(name: string): void;
  };

  export function headers(): Headers;
} 