import { env, buildApiUrl, debugLog } from '../utilities/env';

// API configuration using environment variables
const API_CONFIG = {
  baseURL: env.API_BASE_URL,
  timeout: env.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Generic fetch wrapper with environment-aware configuration
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = buildApiUrl(endpoint);
  
  debugLog('API Request:', { url, options });
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle responses that may not have JSON content
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (response.status === 204 || response.status === 201 && !contentType) {
      // No content responses (like successful DELETE or some POST operations)
      data = null;
    } else {
      // Try to parse as JSON, fallback to text if it fails
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }
    }
    
    debugLog('API Response:', data);
    
    return data;
  } catch (error) {
    if (env.ENABLE_DEBUG) {
      console.error('API Error:', error);
    }
    throw error;
  }
};

// Convenience methods for different HTTP verbs
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  put: <T = any>(endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

// Environment info for debugging
export const getEnvironmentInfo = () => ({
  environment: env.NODE_ENV,
  apiBaseUrl: env.API_BASE_URL,
  appName: env.APP_NAME,
  appVersion: env.APP_VERSION,
  debugEnabled: env.ENABLE_DEBUG,
  analyticsEnabled: env.ENABLE_ANALYTICS,
});
