// Environment configuration utility
export const env = {
  // App Info
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Freight UI',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  
  // Feature Flags
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  // Environment Info
  NODE_ENV: import.meta.env.MODE,
} as const;

// Type for environment variables
export type Environment = typeof env;

// Helper functions
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';

// Debug logger that only works in development
export const debugLog = (...args: any[]) => {
  if (env.ENABLE_DEBUG && isDevelopment()) {
    console.log('[DEBUG]', ...args);
  }
};

// Environment-aware API URL builder
export const buildApiUrl = (endpoint: string) => {
  const baseUrl = env.API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};
