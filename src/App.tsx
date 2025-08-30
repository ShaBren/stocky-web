import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { ItemsPage } from './pages/ItemsPage';
import { LocationsPage } from './pages/LocationsPage';
import { ScannerPage } from './pages/ScannerPage';
import { AlertsPage } from './pages/AlertsPage';
import { UsersPage } from './pages/UsersPage';
import { setAuthToken } from './lib/api';

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
    // Check for existing token
    const token = localStorage.getItem('stocky_auth_token');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (token: string) => {
    setAuthToken(token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
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
            <Layout onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/items" element={<ItemsPage />} />
                <Route path="/locations" element={<LocationsPage />} />
                <Route path="/scanner" element={<ScannerPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          )}
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
