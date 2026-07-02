import { api } from '../lib/api';
import type {
  User,
  Item,
  Location,
  SKU,
  Alert,
  LogEntry,
  LoginRequest,
  LoginResponse,
  PaginatedResponse,
  ItemFilter,
  SKUFilter,
  LocationFilter,
  BackupResponse,
  ImportResponse
} from '../types/api';

// Authentication API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login-json', {
      username: credentials.username,
      password: credentials.password,
      remember_me: credentials.remember_me || false
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  updateProfile: async (userId: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  }
};

// Users API
export const usersAPI = {
  getUsers: async (page: number = 1, size: number = 50): Promise<User[]> => {
    const skip = (page - 1) * size;
    const response = await api.get('/users/', { params: { skip, limit: size } });
    return response.data;
  },

  getUser: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};

// Items API
export const itemsAPI = {
  getItems: async (filter: ItemFilter = {}): Promise<Item[]> => {
    const response = await api.get('/items/', { params: filter });
    return response.data;
  },

  getItem: async (id: number): Promise<Item> => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  createItem: async (itemData: Partial<Item>): Promise<Item> => {
    const response = await api.post('/items/', itemData);
    return response.data;
  },

  updateItem: async (id: number, itemData: Partial<Item>): Promise<Item> => {
    const response = await api.put(`/items/${id}`, itemData);
    return response.data;
  },

  deleteItem: async (id: number): Promise<void> => {
    await api.delete(`/items/${id}`);
  },

  searchByUPC: async (upc: string): Promise<Item | null> => {
    try {
      const response = await api.get(`/items/upc/${upc}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
};

// Locations API
export const locationsAPI = {
  getLocations: async (filter: LocationFilter = {}): Promise<Location[]> => {
    const response = await api.get('/locations/', { params: filter });
    return response.data;
  },

  getLocation: async (id: number): Promise<Location> => {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  },

  createLocation: async (locationData: Partial<Location>): Promise<Location> => {
    const response = await api.post('/locations/', locationData);
    return response.data;
  },

  updateLocation: async (id: number, locationData: Partial<Location>): Promise<Location> => {
    const response = await api.put(`/locations/${id}`, locationData);
    return response.data;
  },

  deleteLocation: async (id: number): Promise<void> => {
    await api.delete(`/locations/${id}`);
  }
};

// SKUs (Inventory) API
export const skusAPI = {
  getSKUs: async (filter: SKUFilter = {}): Promise<SKU[]> => {
    const response = await api.get('/skus/', { params: filter });
    return response.data;
  },

  getSKU: async (id: number): Promise<SKU> => {
    const response = await api.get(`/skus/${id}`);
    return response.data;
  },

  createSKU: async (skuData: Partial<SKU>): Promise<SKU> => {
    const response = await api.post('/skus/', skuData);
    return response.data;
  },

  updateSKU: async (id: number, skuData: Partial<SKU>): Promise<SKU> => {
    const response = await api.put(`/skus/${id}`, skuData);
    return response.data;
  },

  deleteSKU: async (id: number): Promise<void> => {
    await api.delete(`/skus/${id}`);
  },

  updateQuantity: async (id: number, quantity: number): Promise<SKU> => {
    const response = await api.put(`/skus/${id}/quantity`, { quantity });
    return response.data;
  }
};

// Alerts API
export const alertsAPI = {
  getAlerts: async (page = 1, size = 20, activeOnly = true): Promise<Alert[]> => {
    const skip = (page - 1) * size;
    const response = await api.get('/alerts/', { 
      params: { 
        skip, 
        limit: size, 
        active_only: activeOnly 
      } 
    });
    return response.data;
  },

  markAsRead: async (id: number): Promise<Alert> => {
    const response = await api.patch(`/alerts/${id}/acknowledge`);
    return response.data;
  },

  markAsResolved: async (id: number): Promise<Alert> => {
    const response = await api.patch(`/alerts/${id}/resolve`);
    return response.data;
  }
};

// Scanner API
export const scannerAPI = {
  scanBarcode: async (upc: string, locationHint?: string, scannerId?: string): Promise<{ success: boolean; item?: Item; skus?: SKU[]; message: string; suggested_actions?: string[] }> => {
    const response = await api.post('/scanner/scan', { 
      upc, 
      location_hint: locationHint,
      scanner_id: scannerId 
    });
    return response.data;
  },

  logActivity: async (action: string, details: Record<string, unknown>): Promise<void> => {
    await api.post('/scanner/activity', { action, details });
  }
};

// Logs API
export const logsAPI = {
  getLogs: async (page = 1, size = 20, level?: string, module?: string): Promise<PaginatedResponse<LogEntry>> => {
    const skip = (page - 1) * size;
    const params: Record<string, unknown> = { skip, limit: size };
    if (level) params.level = level;
    if (module) params.module = module;
    
    const response = await api.get('/logs/', { params });
    return response.data;
  }
};

// Health API
export const healthAPI = {
  check: async (): Promise<{ status: string; service: string }> => {
    const response = await api.get('/health');
    return response.data;
  }
};

// Backup API (Admin Only)
export const backupAPI = {
  // Download a full database backup as a .json.gz file
  downloadBackup: async (): Promise<Blob> => {
    const response = await api.get('/backup/download', { responseType: 'blob' });
    return response.data;
  },

  // Restore from a .json.gz backup file
  restoreBackup: async (file: File, mode: 'merge' | 'replace' = 'merge', confirm = false): Promise<ImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(
      `/backup/restore?mode=${mode}&confirm=${confirm}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  // Get database status (table counts)
  getStatus: async (): Promise<{ tables: Record<string, number>; database_url: string; timestamp: string }> => {
    const response = await api.get('/backup/status');
    return response.data;
  },
};
