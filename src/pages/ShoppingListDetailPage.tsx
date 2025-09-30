import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../services/api';
import { useShoppingList, useShoppingListLogs, useUpdateShoppingListItem, useRemoveItemFromShoppingList } from '../hooks/useShoppingLists';
import { usePageTitle } from '../utils/usePageTitle';
import { hasPermission } from '../utils/permissions';
import { AddItemModal } from '../components/AddItemModal';
import type { ShoppingListItemResponse } from '../types/shoppingLists';

export function ShoppingListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const listId = parseInt(id || '0', 10);
  
  // Get current user for permission checks
  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authAPI.getCurrentUser(),
    retry: 1
  });

  // Fetch shopping list details
  const { 
    data: shoppingList, 
    isLoading, 
    error 
  } = useShoppingList(listId);

  // Fetch shopping list logs
  const { 
    data: logsResponse 
  } = useShoppingListLogs(listId, { limit: 50 });

  usePageTitle(shoppingList?.name || 'Shopping List');

  // Permission checks
  const canEdit = shoppingList && currentUser && (
    shoppingList.creator.id === currentUser.id || // Own list
    shoppingList.is_public || // Public list
    hasPermission(currentUser.role, 'canEditAnyShoppingList') // Admin
  );

  const canDelete = shoppingList && currentUser && (
    shoppingList.creator.id === currentUser.id || // Own list
    hasPermission(currentUser.role, 'canDeleteAnyShoppingList') // Admin
  );

  // Modal states and mutations
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const updateItemMutation = useUpdateShoppingListItem();
  const removeItemMutation = useRemoveItemFromShoppingList();

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateItemMutation.mutateAsync({
        listId,
        itemId,
        data: { quantity: newQuantity }
      });
    } catch (error) {
      console.error('Failed to update item quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItemMutation.mutateAsync({ listId, itemId });
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleCompleteItem = async (item: ShoppingListItemResponse, completed: boolean) => {
    // TODO: Implement completion logic when the API supports it
    // For now, just log the action
    console.log(`${completed ? 'Completed' : 'Uncompleted'} item:`, item.item.name);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Failed to load shopping list
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>The shopping list could not be found or you don't have permission to view it.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !shoppingList) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-sm text-gray-500">Loading shopping list...</p>
      </div>
    );
  }

  const activeItems = shoppingList.items || [];
  const logs = logsResponse?.items || [];

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div>
        <Link
          to="/shopping-lists"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Shopping Lists
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">{shoppingList.name}</h1>
            <div className="ml-2">
              {shoppingList.is_public ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Private
                </span>
              )}
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Created by {shoppingList.creator.username} • {activeItems.length} {activeItems.length === 1 ? 'item' : 'items'} • Updated {new Date(shoppingList.updated_at).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {canEdit && (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit List
            </button>
          )}
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Duplicate
          </button>
          {canDelete && (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Items Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Items</h2>
            {canEdit && (
              <button
                type="button"
                onClick={() => setShowAddItemModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Item
              </button>
            )}
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {activeItems.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding items to your shopping list.
              </p>
              {canEdit && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddItemModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add your first item
                  </button>
                </div>
              )}
            </div>
          ) : (
            activeItems.map((listItem) => (
              <div key={listItem.id} className="px-4 sm:px-6 py-4 sm:py-4">
                <div className="flex items-start sm:items-center space-x-3">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-1 sm:pt-0">
                    <input
                      id={`item-${listItem.id}`}
                      name={`item-${listItem.id}`}
                      type="checkbox"
                      checked={false} // TODO: Implement completion status when API supports it
                      onChange={(e) => handleCompleteItem(listItem, e.target.checked)}
                      className="h-5 w-5 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded touch-manipulation"
                      disabled={!canEdit}
                    />
                  </div>
                  
                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-base sm:text-sm font-medium text-gray-900 truncate">
                          {listItem.item.name}
                        </p>
                        <div className="mt-1 space-y-1">
                          {listItem.item.upc && (
                            <p className="text-sm text-gray-500">UPC: {listItem.item.upc}</p>
                          )}
                          {listItem.item.description && (
                            <p className="text-sm text-gray-500 line-clamp-2">{listItem.item.description}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Controls - Stack on mobile */}
                      {canEdit && (
                        <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-2 sm:ml-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(listItem.id, listItem.quantity - 1)}
                              disabled={listItem.quantity <= 1 || updateItemMutation.isPending}
                              className="inline-flex items-center justify-center w-8 h-8 sm:w-6 sm:h-6 border border-transparent rounded-md text-gray-400 hover:text-gray-600 active:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                              title="Decrease quantity"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="px-3 py-1 text-sm font-medium text-gray-900 bg-white rounded border min-w-[2.5rem] text-center">
                              {listItem.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(listItem.id, listItem.quantity + 1)}
                              disabled={updateItemMutation.isPending}
                              className="inline-flex items-center justify-center w-8 h-8 sm:w-6 sm:h-6 border border-transparent rounded-md text-gray-400 hover:text-gray-600 active:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                              title="Increase quantity"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(listItem.id)}
                            disabled={removeItemMutation.isPending}
                            className="inline-flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 border border-transparent rounded-lg sm:rounded-md text-red-400 hover:text-red-600 active:text-red-700 hover:bg-red-50 active:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                            title="Remove item"
                          >
                            <TrashIcon className="h-5 w-5 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* History Section */}
      {logs.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">History</h2>
          </div>
          <div className="px-6 py-4">
            <div className="flow-root">
              <ul className="-mb-8">
                {logs.map((log, logIdx) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {logIdx !== logs.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            log.action_type === 'created' ? 'bg-green-500' :
                            log.action_type === 'updated' ? 'bg-blue-500' :
                            log.action_type === 'item_added' ? 'bg-emerald-500' :
                            log.action_type === 'item_updated' ? 'bg-yellow-500' :
                            log.action_type === 'item_removed' ? 'bg-red-500' :
                            log.action_type === 'duplicated' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}>
                            {log.action_type === 'created' && (
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                            {log.action_type === 'updated' && (
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            )}
                            {log.action_type === 'item_added' && (
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                            {log.action_type === 'item_updated' && (
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 010 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 010-2h4z" />
                              </svg>
                            )}
                            {log.action_type === 'item_removed' && (
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            )}
                            {log.action_type === 'duplicated' && (
                              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">{log.user.username}</span>{' '}
                              {log.action_type === 'created' && 'created the list'}
                              {log.action_type === 'updated' && 'updated the list'}
                              {log.action_type === 'item_added' && `added ${log.details?.item_name || 'an item'}`}
                              {log.action_type === 'item_updated' && `updated ${log.details?.item_name || 'an item'}`}
                              {log.action_type === 'item_removed' && `removed ${log.details?.item_name || 'an item'}`}
                              {log.action_type === 'duplicated' && `duplicated from ${log.details?.source_list_name || 'another list'}`}
                            </p>
                            {log.details && (
                              <div className="mt-1 text-xs text-gray-400">
                                {log.action_type === 'item_added' && 
                                  (log.details as { quantity?: number }).quantity && 
                                  `Quantity: ${(log.details as { quantity: number }).quantity}`
                                }
                                {log.action_type === 'item_updated' && 
                                  (log.details as { quantity?: { from: number; to: number } }).quantity && 
                                  `Quantity: ${(log.details as { quantity: { from: number; to: number } }).quantity.from} → ${(log.details as { quantity: { from: number; to: number } }).quantity.to}`
                                }
                                {log.action_type === 'item_removed' && 
                                  (log.details as { quantity?: number }).quantity && 
                                  `Quantity was: ${(log.details as { quantity: number }).quantity}`
                                }
                              </div>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time>{new Date(log.timestamp).toLocaleDateString()}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        listId={id || '0'}
      />
    </div>
  );
}