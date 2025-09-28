import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import ItemsPage from './pages/ItemsPage';
import LocationsPage from './pages/LocationsPage';
import ScannerPage from './pages/ScannerPage';
import AlertsPage from './pages/AlertsPage';
import UsersPage from './pages/UsersPage';
import BulkMovePage from './pages/BulkMovePage';
import AdminPage from './pages/AdminPage';
import { ShoppingListsPage } from './pages/ShoppingListsPage';
import { ShoppingListDetailPage } from './pages/ShoppingListDetailPage';
import { APIDebugPage } from './pages/APIDebugPage';
import { setAuthToken, initializeApi } from './lib/api';
import { loadRuntimeConfig } from './lib/runtime-config';
import { authAPI } from './services/api';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load runtime configuration first, then initialize app
    const initializeApp = async () => {
      try {
        // Load runtime configuration
        await loadRuntimeConfig();
        
        // Initialize API client with runtime config
        initializeApi();
        
        // Check for existing token
        const token = localStorage.getItem('stocky_auth_token');
        if (token) {
          try {
            const decoded: any = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            
            // Check if token is still valid (not expired)
            if (decoded.exp > currentTime) {
              setAuthToken(token);
              setIsAuthenticated(true);
              
              // Set up periodic token refresh
              setupTokenRefresh(decoded.exp);
            } else {
              // Token is expired, remove it
              localStorage.removeItem('stocky_auth_token');
            }
          } catch (error) {
            // Invalid token, remove it
            localStorage.removeItem('stocky_auth_token');
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Set up automatic token refresh
  const setupTokenRefresh = (expiration: number) => {
    const currentTime = Date.now() / 1000;
    const timeUntilRefresh = (expiration - currentTime - 600) * 1000; // Refresh 10 minutes before expiry (optimized for 30-minute tokens)
    
    if (timeUntilRefresh > 0) {
      const refreshTime = new Date(Date.now() + timeUntilRefresh);
      console.log(`🔄 Token refresh scheduled for: ${refreshTime.toLocaleTimeString()} (in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes)`);
    
      setTimeout(async () => {
        try {
          const response = await authAPI.refresh();
          setAuthToken(response.access_token);
          
          // Set up next refresh
          const newDecoded: any = jwtDecode(response.access_token);
          setupTokenRefresh(newDecoded.exp);
        } catch (error: any) {
          console.warn('Token refresh failed:', error);
          // If it's a 404, the backend doesn't support refresh
          if (error.response?.status === 404) {
            console.info('Token refresh not supported by backend');
            return;
          }
          handleLogout();
        }
      }, timeUntilRefresh);
    }
  };

  const handleLogin = (token: string) => {
    setAuthToken(token);
    setIsAuthenticated(true);
    
    // Set up automatic refresh for the new token
    try {
      const decoded: any = jwtDecode(token);
      setupTokenRefresh(decoded.exp);
    } catch (error) {
      console.warn('Failed to decode token for refresh setup:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend logout to clear HTTP-only cookies
      await authAPI.logout();
    } catch (error) {
      console.warn('Backend logout failed:', error);
      // Continue with client-side logout even if backend call fails
    }
    
    // Clear client-side tokens and state
    setAuthToken(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {!isAuthenticated ? (
            <Routes>
              <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<Layout onLogout={handleLogout} />}>
                <Route index element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/items" element={<ItemsPage />} />
                <Route path="/locations" element={<LocationsPage />} />
                <Route path="/scanner" element={<ScannerPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/bulk-move" element={<BulkMovePage />} />
                <Route path="/shopping-lists" element={<ShoppingListsPage />} />
                <Route path="/shopping-lists/:id" element={<ShoppingListDetailPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/api-debug" element={<APIDebugPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          )}
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
