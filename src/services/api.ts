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
  LocationFilter
} from '../types/api';

// Authentication API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post('/auth/login/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  refresh: async (): Promise<LoginResponse> => {
    const response = await api.post('/auth/refresh/');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout/');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  updateProfile: async (userId: number, data: Partial<User & { current_password?: string; new_password?: string }>): Promise<User> => {
    const response = await api.put(`/users/${userId}/`, data);
    return response.data;
  }
};

// Users API
export const usersAPI = {
  getUsers: async (page = 1, size = 20): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users/', { params: { page, size } });
    return response.data;
  },

  getUser: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}/`, userData);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}/`);
  }
};

// Items API
export const itemsAPI = {
  getItems: async (filter: ItemFilter = {}): Promise<Item[]> => {
    const response = await api.get('/items/', { params: filter });
    return response.data;
  },

  getItem: async (id: number): Promise<Item> => {
    const response = await api.get(`/items/${id}/`);
    return response.data;
  },

  createItem: async (itemData: Partial<Item>): Promise<Item> => {
    const response = await api.post('/items/', itemData);
    return response.data;
  },

  updateItem: async (id: number, itemData: Partial<Item>): Promise<Item> => {
    const response = await api.put(`/items/${id}/`, itemData);
    return response.data;
  },

  deleteItem: async (id: number): Promise<void> => {
    await api.delete(`/items/${id}/`);
  },

  searchByUPC: async (upc: string): Promise<Item | null> => {
    try {
      const response = await api.get(`/items/upc/${upc}/`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
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
    const response = await api.get(`/locations/${id}/`);
    return response.data;
  },

  createLocation: async (locationData: Partial<Location>): Promise<Location> => {
    const response = await api.post('/locations/', locationData);
    return response.data;
  },

  updateLocation: async (id: number, locationData: Partial<Location>): Promise<Location> => {
    const response = await api.put(`/locations/${id}/`, locationData);
    return response.data;
  },

  deleteLocation: async (id: number): Promise<void> => {
    await api.delete(`/locations/${id}/`);
  }
};

// SKUs (Inventory) API
export const skusAPI = {
  getSKUs: async (filter: SKUFilter = {}): Promise<SKU[]> => {
    const response = await api.get('/skus/', { params: filter });
    return response.data;
  },

  getSKU: async (id: number): Promise<SKU> => {
    const response = await api.get(`/skus/${id}/`);
    return response.data;
  },

  createSKU: async (skuData: Partial<SKU>): Promise<SKU> => {
    const response = await api.post('/skus/', skuData);
    return response.data;
  },

  updateSKU: async (id: number, skuData: Partial<SKU>): Promise<SKU> => {
    const response = await api.put(`/skus/${id}/`, skuData);
    return response.data;
  },

  deleteSKU: async (id: number): Promise<void> => {
    await api.delete(`/skus/${id}/`);
  },

  updateQuantity: async (id: number, quantity: number): Promise<SKU> => {
    const response = await api.put(`/skus/${id}/quantity/`, { quantity });
    return response.data;
  }
};

// Alerts API
export const alertsAPI = {
  getAlerts: async (page = 1, size = 20, unread_only = false): Promise<Alert[]> => {
    const response = await api.get('/alerts/', { params: { page, size, unread_only } });
    return response.data;
  },

  markAsRead: async (id: number): Promise<Alert> => {
    const response = await api.patch(`/alerts/${id}/read/`);
    return response.data;
  },

  markAsResolved: async (id: number): Promise<Alert> => {
    const response = await api.patch(`/alerts/${id}/resolve/`);
    return response.data;
  }
};

// Scanner API
export const scannerAPI = {
  scanBarcode: async (barcode: string, locationId?: number): Promise<{ item?: Item; sku?: SKU }> => {
    const response = await api.post('/scanner/scan/', { barcode, location_id: locationId });
    return response.data;
  },

  logActivity: async (action: string, details: Record<string, any>): Promise<void> => {
    await api.post('/scanner/activity/', { action, details });
  }
};

// Logs API
export const logsAPI = {
  getLogs: async (page = 1, size = 20): Promise<PaginatedResponse<LogEntry>> => {
    const response = await api.get('/logs/', { params: { page, size } });
    return response.data;
  }
};

// Health API
export const healthAPI = {
  check: async (): Promise<{ status: string; service: string }> => {
    const response = await api.get('/health/');
    return response.data;
  }
};
