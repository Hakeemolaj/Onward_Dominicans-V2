// Application configuration - Compatible with both Vite and Next.js
const getEnvVar = (key: string, fallback: string = '') => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Browser environment - use process.env for Next.js or import.meta.env for Vite
    return (process.env as any)[key] || (window as any).__ENV__?.[key] || fallback;
  }

  // Server environment - use process.env
  return process.env[key] || fallback;
};

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

export const config = {
  // API Configuration - Use Supabase REST API by default
  apiUrl: getEnvVar('VITE_API_URL') || (getEnvVar('VITE_SUPABASE_URL') ? getEnvVar('VITE_SUPABASE_URL') + '/rest/v1' : 'http://localhost:3001/api'),

  // Supabase Configuration
  supabaseUrl: getEnvVar('VITE_SUPABASE_URL') || 'https://zrsfmghkjhxkjjzkigck.supabase.co',
  supabaseAnonKey: getEnvVar('VITE_SUPABASE_ANON_KEY') || '',

  // Feature Flags
  features: {
    // Show API demo section (development only)
    showApiDemo: isDev || getEnvVar('VITE_SHOW_API_DEMO') === 'true',

    // Enable admin features
    enableAdmin: getEnvVar('VITE_ENABLE_ADMIN') === 'true',

    // Show debug information
    showDebug: isDev,
  },

  // Environment
  isDevelopment: isDev,
  isProduction: isProd,

  // External APIs
  geminiApiKey: getEnvVar('VITE_GEMINI_API_KEY'),
};

// Security: Don't expose sensitive config in production
export const getPublicConfig = () => {
  if (config.isProduction) {
    return {
      apiUrl: config.apiUrl,
      features: {
        showApiDemo: false, // Always false in production
        enableAdmin: false, // Require proper authentication
        showDebug: false,
      },
      isDevelopment: false,
      isProduction: true,
    };
  }
  
  return config;
};
