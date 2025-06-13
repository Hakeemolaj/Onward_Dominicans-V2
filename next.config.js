/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for better SEO
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Configure trailing slash for consistency
  trailingSlash: true,

  // Asset prefix for deployment
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',

  // Disable server-side features for static export
  // rewrites and headers don't work with static export

  // Temporarily disable TypeScript checking for migration
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Preserve existing webpack config for admin dashboard
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    VITE_API_URL: process.env.VITE_API_URL || 'https://zrsfmghkjhxkjjzkigck.supabase.co/rest/v1',
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://zrsfmghkjhxkjjzkigck.supabase.co',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpyc2ZtZ2hramh4a2pqemtpZ2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjQwMDcsImV4cCI6MjA2NTE0MDAwN30.HGkX4r3NCfsyzk0pMsLS0N40K904zWA2CZyZ3Pr-bxM',
    VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY,
  },
};

export default nextConfig;
