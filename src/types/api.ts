// API Types for StockyWeb
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'SCANNER' | 'READ_ONLY';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: number;
  name: string;
  description?: string;
  upc?: string;
  default_storage_type?: StorageType;
  is_active: boolean;
  uda_fetched: boolean;
  uda_fetch_attempted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: number;
  name: string;
  description?: string;
  storage_type: StorageType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SKU {
  id: number;
  item_id: number;
  location_id: number;
  quantity: number;
  unit?: string;
  expiry_date?: string;
  notes?: string;
  is_active: boolean;
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
  details: Record<string, unknown>;
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
  remember_me?: boolean;
}

export interface LoginResponse {
  user_id: number;
  username: string;
  role: string;
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

// Backup and Restore Types
export interface BackupResponse {
  backup_size: number;
  timestamp: string;
  tables_included: string[];
  message: string;
}

export interface ImportRequest {
  backup_data: string; // base64-encoded-gzipped-sql-data
  force: boolean;
}

export interface ImportResponse {
  success: boolean;
  message: string;
  tables_affected: string[];
  records_imported: number;
  timestamp: string;
}

export interface BackupUploadData {
  file: File;
  force?: boolean;
}
