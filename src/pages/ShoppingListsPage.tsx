import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../services/api';
import { useShoppingLists } from '../hooks/useShoppingLists';
import { usePageTitle } from '../utils/usePageTitle';

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

  // Filter lists based on search and visibility
  const filteredLists = listsResponse?.items?.filter(list => {
    const matchesSearch = searchQuery === '' || 
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.creator.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVisibility = visibilityFilter === 'all' ||
      (visibilityFilter === 'public' && list.is_public) ||
      (visibilityFilter === 'private' && !list.is_public && list.creator.id === currentUser?.id);
    
    return matchesSearch && matchesVisibility;
  }) || [];

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
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + Create List
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search lists
          </label>
          <input
            type="text"
            name="search"
            id="search"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Search lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as 'all' | 'public' | 'private')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Lists</option>
            <option value="public">Public Lists</option>
            <option value="private">My Private Lists</option>
          </select>
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
          {filteredLists.length === 0 ? (
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
              {(!searchQuery && visibilityFilter === 'all') && (
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    + Create your first list
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLists.map((list) => (
                <div
                  key={list.id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {list.name}
                        </h3>
                        <div className="ml-2">
                          {list.is_public ? (
                            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {list.item_count} {list.item_count === 1 ? 'item' : 'items'}
                      </p>
                      <p className="text-sm text-gray-500">
                        by {list.creator.username}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Updated {new Date(list.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button
                        type="button"
                        className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        Duplicate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}