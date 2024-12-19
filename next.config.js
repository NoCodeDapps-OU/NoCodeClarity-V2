/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: ['wtwqlzceohmftzhmwnic.supabase.co'],
  },
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Experimental features
  experimental: {
    // Remove scrollRestoration as it's causing the warning
    // scrollRestoration: true,
    optimizeCss: false,
    // Add other stable experimental features from Next.js 15
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

    // Add custom webpack config for HMR
    if (dev && !isServer) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    
    return config;
  },
}

module.exports = nextConfig 