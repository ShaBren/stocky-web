// TypeScript interfaces for Shopping Lists feature
// Based on the backend API schema

import type { User, Item } from './api';

export interface ShoppingListSummary {
  id: number;
  name: string;
  is_public: boolean;
  creator: User;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListResponse extends Omit<ShoppingListSummary, 'item_count'> {
  items: ShoppingListItemResponse[];
}

export interface ShoppingListItemResponse {
  id: number;
  item: Item;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListCreate {
  name: string;
  is_public: boolean;
}

export interface ShoppingListUpdate {
  name?: string;
  is_public?: boolean;
}

export interface ShoppingListDuplicate {
  name: string;
  is_public: boolean;
}

export interface ShoppingListItemCreate {
  item_id: number;
  quantity: number;
}

export interface ShoppingListItemUpdate {
  quantity: number;
}

export interface ShoppingListLogResponse {
  id: number;
  action_type: string;
  user: User;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ShoppingListsPaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

// Action types for logs
export type ShoppingListActionType = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'item_added' 
  | 'item_updated' 
  | 'item_removed' 
  | 'duplicated';

// Search/filter types
export interface ShoppingListFilters {
  search?: string;
  visibility?: 'all' | 'public' | 'private';
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

// UI state types
export interface ShoppingListFormData {
  name: string;
  is_public: boolean;
}

export interface AddItemFormData {
  item_id: number;
  quantity: number;
}