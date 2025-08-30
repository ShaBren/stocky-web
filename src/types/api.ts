// API Types for StockyWeb
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'member' | 'scanner' | 'read_only';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: number;
  name: string;
  description?: string;
  upc?: string;
  default_storage_type: StorageType;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: number;
  name: string;
  description?: string;
  storage_type: StorageType;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface SKU {
  id: number;
  item_id: number;
  location_id: number;
  quantity: number;
  unit: string;
  expiry_date?: string;
  purchase_date?: string;
  purchase_price?: number;
  notes?: string;
  low_stock_threshold?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  item?: Item;
  location?: Location;
}

export interface Alert {
  id: number;
  type: AlertType;
  title: string;
  message: string;
  sku_id?: number;
  is_read: boolean;
  is_resolved: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
  sku?: SKU;
}

export interface LogEntry {
  id: number;
  action: string;
  details: Record<string, any>;
  user_id: number;
  created_at: string;
  user?: User;
}

export const StorageType = {
  PANTRY: 'pantry',
  REFRIGERATOR: 'refrigerator',
  FREEZER: 'freezer',
  COUNTER: 'counter',
  GARAGE: 'garage',
  OTHER: 'other'
} as const;

export type StorageType = typeof StorageType[keyof typeof StorageType];

export const AlertType = {
  LOW_STOCK: 'low_stock',
  EXPIRED: 'expired',
  EXPIRING_SOON: 'expiring_soon',
  SYSTEM: 'system'
} as const;

export type AlertType = typeof AlertType[keyof typeof AlertType];

// API Request/Response types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface APIResponse<T> {
  data: T;
  message?: string;
}

// Search and filter types
export interface ItemFilter {
  search?: string;
  storage_type?: StorageType;
  is_active?: boolean;
  page?: number;
  size?: number;
}

export interface SKUFilter {
  search?: string;
  location_id?: number;
  item_id?: number;
  low_stock?: boolean;
  expiring_soon?: boolean;
  page?: number;
  size?: number;
}

export interface LocationFilter {
  search?: string;
  storage_type?: StorageType;
  is_active?: boolean;
  page?: number;
  size?: number;
}
