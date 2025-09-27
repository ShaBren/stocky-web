import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shoppingListsAPI } from '../services/shoppingListsAPI';
import type {
  ShoppingListCreate,
  ShoppingListUpdate,
  ShoppingListDuplicate,
  ShoppingListItemCreate,
  ShoppingListItemUpdate
} from '../types/shoppingLists';

// Query hooks for shopping lists
export function useShoppingLists(params?: { 
  skip?: number; 
  limit?: number; 
  include_deleted?: boolean; 
}) {
  return useQuery({
    queryKey: ['shopping-lists', params],
    queryFn: () => shoppingListsAPI.getLists(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10 * 1000, // Poll every 10 seconds
  });
}

export function useShoppingList(listId: number) {
  return useQuery({
    queryKey: ['shopping-lists', listId],
    queryFn: () => shoppingListsAPI.getList(listId),
    enabled: !!listId,
    refetchInterval: 10 * 1000, // Poll every 10 seconds for collaborative editing
  });
}

export function useShoppingListLogs(listId: number, params?: { 
  skip?: number; 
  limit?: number; 
  action_type?: string; 
}) {
  return useQuery({
    queryKey: ['shopping-lists', listId, 'logs', params],
    queryFn: () => shoppingListsAPI.getLogs(listId, params),
    enabled: !!listId,
  });
}

// Mutation hooks for shopping lists
export function useCreateShoppingList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ShoppingListCreate) => shoppingListsAPI.createList(data),
    onSuccess: () => {
      // Invalidate lists to show the new list
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useUpdateShoppingList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, data }: { listId: number; data: ShoppingListUpdate }) => 
      shoppingListsAPI.updateList(listId, data),
    onSuccess: (updatedList) => {
      // Update the specific list cache
      queryClient.setQueryData(['shopping-lists', updatedList.id], updatedList);
      // Invalidate the lists overview to update summary info
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'], exact: false });
    },
  });
}

export function useDeleteShoppingList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (listId: number) => shoppingListsAPI.deleteList(listId),
    onSuccess: () => {
      // Invalidate lists to remove the deleted list
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useDuplicateShoppingList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, data }: { listId: number; data: ShoppingListDuplicate }) =>
      shoppingListsAPI.duplicateList(listId, data),
    onSuccess: () => {
      // Invalidate lists to show the new duplicated list
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

// Mutation hooks for shopping list items
export function useAddShoppingListItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, data }: { listId: number; data: ShoppingListItemCreate }) =>
      shoppingListsAPI.addItem(listId, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific list to show the new item
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', variables.listId] });
      // Invalidate lists overview to update item counts
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'], exact: false });
      // Invalidate logs to show the add action
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', variables.listId, 'logs'] });
    },
  });
}

export function useUpdateShoppingListItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      listId, 
      itemId, 
      data 
    }: { 
      listId: number; 
      itemId: number; 
      data: ShoppingListItemUpdate;
    }) => shoppingListsAPI.updateItem(listId, itemId, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific list to show updated item
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', variables.listId] });
      // Invalidate logs to show the update action
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', variables.listId, 'logs'] });
    },
  });
}

export function useRemoveShoppingListItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: number; itemId: number }) =>
      shoppingListsAPI.removeItem(listId, itemId),
    onSuccess: (_, variables) => {
      // Invalidate the specific list to remove the item
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', variables.listId] });
      // Invalidate lists overview to update item counts
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'], exact: false });
      // Invalidate logs to show the remove action
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', variables.listId, 'logs'] });
    },
  });
}

// Add item to shopping list
export function useAddItemToShoppingList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, itemData }: { listId: number; itemData: ShoppingListItemCreate }) =>
      shoppingListsAPI.addItem(listId, itemData),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch the specific list
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', variables.listId] });
      // Invalidate lists overview
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      // Invalidate logs to show the add action
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', variables.listId, 'logs'] });
    },
  });
}

// Remove item from shopping list
export function useRemoveItemFromShoppingList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ listId, itemId }: { listId: number; itemId: number }) =>
      shoppingListsAPI.removeItem(listId, itemId),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch the specific list
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', variables.listId] });
      // Invalidate lists overview
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      // Invalidate logs to show the remove action
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', variables.listId, 'logs'] });
    },
  });
}

