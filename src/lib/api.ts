import axios from 'axios';
import { getApiBaseUrl } from './runtime-config';

// API Configuration - will be set after runtime config loads
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:8000/api/v1';

// Create axios instance - will be reconfigured after runtime config loads
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // HttpOnly session cookie for auth
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
  API_BASE_URL = newBaseUrl;
  api.defaults.baseURL = API_BASE_URL;
}

let _appInitialized = false;

/** Mark the API client as initialized — 401 redirects are only active after this. */
export function markApiInitialized(): void {
  _appInitialized = true;
}

// Response interceptor — redirect to login on 401 (only after app initialized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (_appInitialized && error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);