import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
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
import { initializeApi } from './lib/api';
import { loadRuntimeConfig } from './lib/runtime-config';
import { authAPI } from './services/api';

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
    const initializeApp = async () => {
      try {
        await loadRuntimeConfig();
        initializeApi();

        // Check if we have a valid session by calling /auth/me
        try {
          await authAPI.getCurrentUser();
          setIsAuthenticated(true);
        } catch {
          // No valid session — stay on login page
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.warn('Backend logout failed:', error);
    }
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
