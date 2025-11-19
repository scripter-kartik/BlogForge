// next.config.ts - OPTIMIZED FOR PERFORMANCE
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Enable React strict mode for better debugging
  reactStrictMode: true,

  // ✅ Optimize images
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ✅ Compiler optimizations
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // ✅ Webpack optimizations
  webpack: (config, { isServer }) => {
    // Enable webpack caching for faster rebuilds
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };

    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // ✅ Experimental features for better performance
  experimental: {
    // Enable Server Actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize CSS
    optimizeCss: true,
    // Optimize package imports
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },

  // ✅ Production source maps (optional - disable for faster builds)
  productionBrowserSourceMaps: false,

  // ✅ Compress pages
  compress: true,

  // ✅ Power performance mode
  poweredByHeader: false,

  // ✅ Generate ETags for caching
  generateEtags: true,

  // ✅ HTTP headers for caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;