import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const TOKEN_REFRESH_BUFFER = 300; // 5 minutes before expiry
const ENABLE_AUTO_REFRESH = true; // Can be disabled if backend doesn't support refresh

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
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
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
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
