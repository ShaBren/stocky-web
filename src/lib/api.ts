import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { getApiBaseUrl } from './runtime-config';

// API Configuration - will be set after runtime config loads
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:8000/api/v1';
const TOKEN_REFRESH_BUFFER = 300; // 5 minutes before expiry
const ENABLE_AUTO_REFRESH = true; // Can be disabled if backend doesn't support refresh

// Create axios instance - will be reconfigured after runtime config loads
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Initialize API with runtime configuration
 * Must be called after runtime config is loaded
 */
export function initializeApi(): void {
  const newBaseUrl = getApiBaseUrl();
  console.log('🔍 DEBUG - getApiBaseUrl() returned:', newBaseUrl);
  console.log('🔍 DEBUG - Old API_BASE_URL:', API_BASE_URL);
  API_BASE_URL = newBaseUrl;
  api.defaults.baseURL = API_BASE_URL;
  console.log('🔗 API client reconfigured with base URL:', API_BASE_URL);
  console.log('🔍 DEBUG - axios.defaults.baseURL is now:', api.defaults.baseURL);
}

// Token management
let authToken: string | null = localStorage.getItem('stocky_auth_token');
let refreshPromise: Promise<string> | null = null;

// Check if token is expired or about to expire (within 5 minutes)
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < (currentTime + TOKEN_REFRESH_BUFFER);
  } catch {
    return true;
  }
};

// Refresh token function
const refreshToken = async (): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const newToken = response.data.access_token;
      setAuthToken(newToken);
      return newToken;
    } catch (error: any) {
      // If the refresh endpoint doesn't exist (404) or refresh failed,
      // redirect to login
      console.warn('Token refresh failed:', error.response?.status, error.message);
      setAuthToken(null);
      window.location.href = '/login';
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('stocky_auth_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('stocky_auth_token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Initialize token if it exists
if (authToken) {
  setAuthToken(authToken);
}

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Ensure we're always using the correct base URL from runtime config
    const currentBaseUrl = api.defaults.baseURL;
    if (config.baseURL !== currentBaseUrl) {
      console.log('🔧 Correcting base URL:', {
        was: config.baseURL,
        now: currentBaseUrl
      });
      config.baseURL = currentBaseUrl;
    }
    
    // Ensure we're using HTTPS if the base URL is HTTPS
    if (currentBaseUrl?.startsWith('https://') && config.url?.startsWith('http://')) {
      console.warn('🔧 Converting HTTP URL to HTTPS to match base URL');
      config.url = config.url.replace('http://', 'https://');
    }
    
    // Debug: Log the actual request URL being made
    const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
    console.log('🚀 Making request to:', fullUrl);
    
    if (ENABLE_AUTO_REFRESH && authToken && isTokenExpired(authToken)) {
      try {
        await refreshToken();
      } catch (error) {
        // Token refresh failed, will be handled by response interceptor
        console.warn('Token refresh failed:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Check if this was a redirect response and log it
    if (response.request && response.request.responseURL) {
      const requestUrl = response.config.url;
      const responseUrl = response.request.responseURL;
      
      // If the final URL is different from what we requested, it was redirected
      if (requestUrl && !responseUrl.endsWith(requestUrl)) {
        console.warn('🔄 Redirect detected:', {
          requested: `${response.config.baseURL}${requestUrl}`,
          final: responseUrl
        });
        
        // Check if redirect changed protocol from HTTPS to HTTP
        if (responseUrl.startsWith('http://') && response.config.baseURL?.startsWith('https://')) {
          console.error('🚨 HTTPS→HTTP redirect detected! This may cause mixed content errors.');
        }
      }
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle redirect responses (3xx status codes)
    if (error.response && error.response.status >= 300 && error.response.status < 400) {
      const location = error.response.headers.location;
      if (location) {
        console.warn('🔄 Manual redirect handling for:', location);
        
        // If we get a redirect to HTTP when we expected HTTPS, fix it
        if (location.startsWith('http://') && originalRequest.baseURL?.startsWith('https://')) {
          const httpsLocation = location.replace('http://', 'https://');
          console.log('🔧 Converting HTTP redirect to HTTPS:', httpsLocation);
          
          // Make a new request to the HTTPS version
          const newRequest = {
            ...originalRequest,
            url: httpsLocation.replace(originalRequest.baseURL, ''),
            _redirect: true
          };
          
          return api(newRequest);
        }
      }
    }
    
    if (ENABLE_AUTO_REFRESH && error.response?.status === 401 && !originalRequest._retry && authToken) {
      originalRequest._retry = true;
      
      try {
        await refreshToken();
        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        setAuthToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response?.status === 401) {
      setAuthToken(null);
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
