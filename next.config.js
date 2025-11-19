/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix for multiple lockfiles warning
  outputFileTracingRoot: require('path').join(__dirname),
  
  // Disable webpack cache to prevent the compilation warnings
  webpack: (config, { isServer }) => {
    // Disable cache for development to prevent the next.config.compiled.js warning
    if (!isServer) {
      config.cache = false;
    }
    return config;
  },
  
  // Image optimization configuration for Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  
  // Suppress NextAuth debug warnings in production
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
};

module.exports = nextConfig;