import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: ['wtwqlzceohmftzhmwnic.supabase.co'],
  },
  // Add env configuration
  env: {
    NEXT_PUBLIC_VERCEL_CLIENT_ID: process.env.NEXT_PUBLIC_VERCEL_CLIENT_ID,
    VERCEL_CLIENT_SECRET: process.env.VERCEL_CLIENT_SECRET,
    NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    NEXT_PUBLIC_SUPABASE_CLIENT_ID: process.env.NEXT_PUBLIC_SUPABASE_CLIENT_ID,
    SUPABASE_CLIENT_SECRET: process.env.SUPABASE_CLIENT_SECRET
  },
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Experimental features
  experimental: {
    optimizeCss: false,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Configure optimization
  webpack: (config, { dev, isServer }) => {
    // Optimization for production builds
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;
