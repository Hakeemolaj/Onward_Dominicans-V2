// Application configuration
export const config = {
  // API Configuration - Use Supabase REST API by default
  apiUrl: import.meta.env.VITE_API_URL || (import.meta.env.VITE_SUPABASE_URL ? import.meta.env.VITE_SUPABASE_URL + '/rest/v1' : 'http://localhost:3001/api'),

  // Supabase Configuration
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://zrsfmghkjhxkjjzkigck.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // Feature Flags
  features: {
    // Show API demo section (development only)
    showApiDemo: import.meta.env.DEV || import.meta.env.VITE_SHOW_API_DEMO === 'true',
    
    // Enable admin features
    enableAdmin: import.meta.env.VITE_ENABLE_ADMIN === 'true',
    
    // Show debug information
    showDebug: import.meta.env.DEV,
  },
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // External APIs
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
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
