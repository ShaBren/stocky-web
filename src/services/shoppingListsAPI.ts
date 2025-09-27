import { api } from '../lib/api';
import type {
  ShoppingListSummary,
  ShoppingListResponse,
  ShoppingListCreate,
  ShoppingListUpdate,
  ShoppingListDuplicate,
  ShoppingListItemResponse,
  ShoppingListItemCreate,
  ShoppingListItemUpdate,
  ShoppingListLogResponse,
  ShoppingListsPaginatedResponse
} from '../types/shoppingLists';

// Shopping Lists API service
export const shoppingListsAPI = {
  // List operations
  getLists: async (params?: { 
    skip?: number; 
    limit?: number; 
    include_deleted?: boolean; 
  }): Promise<ShoppingListsPaginatedResponse<ShoppingListSummary>> => {
    const response = await api.get('/shopping-lists/', { params });
    return response.data;
  },

  getList: async (listId: number): Promise<ShoppingListResponse> => {
    const response = await api.get(`/shopping-lists/${listId}/`);
    return response.data;
  },

  createList: async (data: ShoppingListCreate): Promise<ShoppingListResponse> => {
    const response = await api.post('/shopping-lists/', data);
    return response.data;
  },

  updateList: async (listId: number, data: ShoppingListUpdate): Promise<ShoppingListResponse> => {
    const response = await api.put(`/shopping-lists/${listId}/`, data);
    return response.data;
  },

  deleteList: async (listId: number): Promise<void> => {
    await api.delete(`/shopping-lists/${listId}/`);
  },

  duplicateList: async (listId: number, data: ShoppingListDuplicate): Promise<ShoppingListResponse> => {
    const response = await api.post(`/shopping-lists/${listId}/duplicate/`, data);
    return response.data;
  },

  // Item operations
  addItem: async (listId: number, data: ShoppingListItemCreate): Promise<ShoppingListItemResponse> => {
    const response = await api.post(`/shopping-lists/${listId}/items/`, data);
    return response.data;
  },

  updateItem: async (
    listId: number, 
    itemId: number, 
    data: ShoppingListItemUpdate
  ): Promise<ShoppingListItemResponse> => {
    const response = await api.put(`/shopping-lists/${listId}/items/${itemId}/`, data);
    return response.data;
  },

  removeItem: async (listId: number, itemId: number): Promise<void> => {
    await api.delete(`/shopping-lists/${listId}/items/${itemId}/`);
  },

  // Logs
  getLogs: async (
    listId: number, 
    params?: { 
      skip?: number; 
      limit?: number; 
      action_type?: string; 
    }
  ): Promise<ShoppingListsPaginatedResponse<ShoppingListLogResponse>> => {
    const response = await api.get(`/shopping-lists/${listId}/logs/`, { params });
    return response.data;
  }
};