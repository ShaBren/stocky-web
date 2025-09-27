import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, MagnifyingGlassIcon, EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../services/api';
import { useShoppingLists } from '../hooks/useShoppingLists';
import { hasPermission } from '../utils/permissions';
import { usePageTitle } from '../utils/usePageTitle';
import { CreateEditListModal } from '../components/CreateEditListModal';
import { DeleteListModal } from '../components/DeleteListModal';
import { DuplicateListModal } from '../components/DuplicateListModal';
import type { ShoppingListSummary } from '../types/shoppingLists';

export function ShoppingListsPage() {
  usePageTitle('Shopping Lists');
  
  // Get current user for permission checks
  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authAPI.getCurrentUser(),
    retry: 1
  });

  // Fetch shopping lists
  const { 
    data: listsResponse, 
    isLoading, 
    error 
  } = useShoppingLists({ limit: 100 });

  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'updated_at' | 'created_at' | 'item_count'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState<ShoppingListSummary | null>(null);
  const [deletingList, setDeletingList] = useState<ShoppingListSummary | null>(null);
  const [duplicatingList, setDuplicatingList] = useState<ShoppingListSummary | null>(null);

  // Filter and sort lists based on search, visibility, and sort options
  const filteredAndSortedLists = React.useMemo(() => {
    let filtered = listsResponse?.items?.filter(list => {
      const matchesSearch = searchQuery === '' || 
        list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        list.creator.username.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesVisibility = visibilityFilter === 'all' ||
        (visibilityFilter === 'public' && list.is_public) ||
        (visibilityFilter === 'private' && !list.is_public && list.creator.id === currentUser?.id);
      
      return matchesSearch && matchesVisibility;
    }) || [];

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
          break;
        case 'item_count':
          aValue = a.item_count;
          bValue = b.item_count;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [listsResponse?.items, searchQuery, visibilityFilter, sortBy, sortOrder, currentUser?.id]);

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
              Failed to load shopping lists
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>There was an error loading your shopping lists. Please try again.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Lists</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your shopping lists and collaborate with others
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {hasPermission(currentUser?.role, 'canCreateShoppingLists') && (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create List
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 sm:space-y-0 sm:flex sm:gap-4">
        {/* Search Input - Full width on mobile */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="search"
            id="search"
            className="block w-full pl-10 pr-4 py-3 sm:py-2 rounded-lg sm:rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm"
            placeholder="Search lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Mobile-first filter layout */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Visibility Filter - Stack on mobile, inline on desktop */}
          <div className="flex rounded-lg sm:rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setVisibilityFilter('all')}
              className={`flex-1 sm:flex-none px-4 py-3 sm:py-2 text-sm font-medium rounded-l-lg sm:rounded-l-md border touch-manipulation ${
                visibilityFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setVisibilityFilter('public')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-3 sm:py-2 text-sm font-medium border-t border-b -ml-px touch-manipulation ${
                visibilityFilter === 'public'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              <EyeIcon className="h-4 w-4 inline mr-1 sm:mr-1" />
              <span className="hidden sm:inline">Public</span>
            </button>
            <button
              type="button"
              onClick={() => setVisibilityFilter('private')}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-3 sm:py-2 text-sm font-medium rounded-r-lg sm:rounded-r-md border -ml-px touch-manipulation ${
                visibilityFilter === 'private'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              <EyeSlashIcon className="h-4 w-4 inline mr-1 sm:mr-1" />
              <span className="hidden sm:inline">Private</span>
            </button>
          </div>
          
          {/* Sort Dropdown */}
          <div className="min-w-0 sm:min-w-[200px]">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="block w-full px-3 py-3 sm:py-2 rounded-lg sm:rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm bg-white"
            >
              <option value="updated_at-desc">Recently Updated</option>
              <option value="created_at-desc">Recently Created</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="item_count-desc">Most Items</option>
              <option value="item_count-asc">Fewest Items</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading shopping lists...</p>
        </div>
      )}

      {/* Lists Grid */}
      {!isLoading && (
        <div>
          {filteredAndSortedLists.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No shopping lists</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || visibilityFilter !== 'all' 
                  ? 'No lists match your current filters.'
                  : 'Get started by creating your first shopping list.'
                }
              </p>
              {(!searchQuery && visibilityFilter === 'all' && hasPermission(currentUser?.role, 'canCreateShoppingLists')) && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create your first list
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedLists.map((list) => (
                <div
                  key={list.id}
                  className="bg-white overflow-hidden shadow-sm sm:shadow rounded-xl sm:rounded-lg hover:shadow-md active:shadow-lg transition-shadow duration-200 border border-gray-100 sm:border-0"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate pr-2">
                          {list.name}
                        </h3>
                        <div className="flex-shrink-0">
                          {list.is_public ? (
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                              <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                              <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {list.item_count} {list.item_count === 1 ? 'item' : 'items'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(list.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        by {list.creator.username}
                      </p>
                    </div>
                    
                    {/* Mobile-first action layout */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between sm:items-center">
                      <Link
                        to={`/shopping-lists/${list.id}`}
                        className="w-full sm:flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 px-4 py-3 sm:py-2 rounded-lg sm:rounded-md text-sm font-medium transition-colors duration-200 text-center touch-manipulation"
                      >
                        View List
                      </Link>
                      
                      {/* Action buttons - horizontal on mobile, vertical on desktop */}
                      <div className="flex justify-center sm:justify-end sm:ml-3 space-x-1">
                        <button
                          type="button"
                          onClick={() => setDuplicatingList(list)}
                          className="p-3 sm:p-2 text-gray-400 hover:text-blue-600 active:text-blue-700 transition-colors duration-200 rounded-lg touch-manipulation"
                          title="Duplicate list"
                        >
                          <DocumentDuplicateIcon className="h-5 w-5 sm:h-4 sm:w-4" />
                        </button>
                        {(hasPermission(currentUser?.role, 'canEditAnyShoppingList') || 
                          (list.is_public || list.creator.id === currentUser?.id)) && (
                          <button
                            type="button"
                            onClick={() => setEditingList(list)}
                            className="p-3 sm:p-2 text-gray-400 hover:text-gray-600 active:text-gray-700 transition-colors duration-200 rounded-lg touch-manipulation"
                            title="Edit list"
                          >
                            <PencilIcon className="h-5 w-5 sm:h-4 sm:w-4" />
                          </button>
                        )}
                        {(hasPermission(currentUser?.role, 'canDeleteAnyShoppingList') || 
                          list.creator.id === currentUser?.id) && (
                          <button
                            type="button"
                            onClick={() => setDeletingList(list)}
                            className="p-3 sm:p-2 text-gray-400 hover:text-red-600 active:text-red-700 transition-colors duration-200 rounded-lg touch-manipulation"
                            title="Delete list"
                          >
                            <TrashIcon className="h-5 w-5 sm:h-4 sm:w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateEditListModal
        isOpen={showCreateModal || editingList !== null}
        onClose={() => {
          setShowCreateModal(false);
          setEditingList(null);
        }}
        editingList={editingList || undefined}
      />

      <DeleteListModal
        isOpen={deletingList !== null}
        onClose={() => setDeletingList(null)}
        list={deletingList}
      />

      <DuplicateListModal
        isOpen={duplicatingList !== null}
        onClose={() => setDuplicatingList(null)}
        list={duplicatingList}
      />
    </div>
  );
}