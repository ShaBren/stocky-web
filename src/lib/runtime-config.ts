// Runtime configuration loader
// This loads configuration from /config.js at runtime, allowing the same 
// Docker image to be deployed with different configurations

interface RuntimeConfig {
  apiBaseUrl: string;
  appName: string;
  appVersion: string;
  enableAnalytics: boolean;
  enableDebug: boolean;
  enableHttpsOnly: boolean;
  environment: string;
}

declare global {
  interface Window {
    APP_CONFIG?: RuntimeConfig;
  }
}

let runtimeConfig: RuntimeConfig | null = null;

/**
 * Load runtime configuration from /config.js
 * Falls back to build-time environment variables if config.js is not available
 */
export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (runtimeConfig) {
    return runtimeConfig;
  }

  try {
    // Try to load runtime configuration from /config.js
    const script = document.createElement('script');
    script.src = '/config.js?t=' + Date.now(); // Cache busting
    
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    // Check if runtime config was loaded
    if (window.APP_CONFIG) {
      runtimeConfig = window.APP_CONFIG;
      console.log('✅ Loaded runtime configuration:', runtimeConfig);
      return runtimeConfig;
    }
  } catch (error) {
    console.warn('⚠️ Failed to load runtime configuration, using build-time defaults:', error);
  }

  // Fallback to build-time environment variables
  runtimeConfig = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    appName: import.meta.env.VITE_APP_NAME || 'StockyWeb',
    appVersion: import.meta.env.VITE_APP_VERSION || '0.0.1',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
    enableHttpsOnly: import.meta.env.VITE_ENABLE_HTTPS_ONLY !== 'false',
    environment: import.meta.env.VITE_ENVIRONMENT || 'development'
  };

  console.log('📦 Using build-time configuration:', runtimeConfig);
  return runtimeConfig;
}

/**
 * Get the current runtime configuration
 * Must call loadRuntimeConfig() first
 */
export function getRuntimeConfig(): RuntimeConfig {
  if (!runtimeConfig) {
    throw new Error('Runtime configuration not loaded. Call loadRuntimeConfig() first.');
  }
  return runtimeConfig;
}

/**
 * Get API base URL from runtime config
 */
export function getApiBaseUrl(): string {
  return getRuntimeConfig().apiBaseUrl;
}