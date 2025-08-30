import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skusAPI, itemsAPI, locationsAPI } from '../services/api';
import type { SKU, SKUFilter } from '../types/api';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export function InventoryPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<SKUFilter>({ page: 1, size: 20 });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSku, setEditingSku] = useState<SKU | null>(null);

  // Fetch inventory data
  const { data: skusData, isLoading: skusLoading, error: skusError } = useQuery({
    queryKey: ['skus', filter],
    queryFn: () => skusAPI.getSKUs(filter),
    retry: 1
  });

  // Fetch items and locations for dropdowns
  const { data: itemsData } = useQuery({
    queryKey: ['items', { page: 1, size: 100 }],
    queryFn: () => itemsAPI.getItems({ page: 1, size: 100 }),
    retry: 1
  });

  const { data: locationsData } = useQuery({
    queryKey: ['locations', { page: 1, size: 100 }],
    queryFn: () => locationsAPI.getLocations({ page: 1, size: 100 }),
    retry: 1
  });

  // Mutations
  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      skusAPI.updateQuantity(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skus'] });
    }
  });

  const deleteSKUMutation = useMutation({
    mutationFn: (id: number) => skusAPI.deleteSKU(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skus'] });
    }
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilter({ ...filter, search: term, page: 1 });
  };

  const handleQuantityUpdate = (sku: SKU, newQuantity: number) => {
    if (newQuantity >= 0) {
      updateQuantityMutation.mutate({ id: sku.id, quantity: newQuantity });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      deleteSKUMutation.mutate(id);
    }
  };

  const isLowStock = (sku: SKU) => {
    return sku.low_stock_threshold && sku.quantity <= sku.low_stock_threshold;
  };

  if (skusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (skusError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Unable to load inventory data</p>
        <p className="text-sm">Please check your connection to the backend</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your stock quantities and locations
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="stocky-button-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Inventory</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="stocky-card p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={filter.location_id || ''}
            onChange={(e) => setFilter({ ...filter, location_id: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Locations</option>
            {locationsData?.items?.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="lowStock"
              checked={filter.low_stock || false}
              onChange={(e) => setFilter({ ...filter, low_stock: e.target.checked, page: 1 })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="lowStock" className="text-sm text-gray-700">
              Low Stock Only
            </label>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="stocky-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {skusData?.items?.map((sku) => (
                <tr key={sku.id} className={isLowStock(sku) ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {isLowStock(sku) && (
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {sku.item?.name || 'Unknown Item'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {sku.item?.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sku.location?.name || 'Unknown Location'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityUpdate(sku, sku.quantity - 1)}
                        disabled={sku.quantity <= 0 || updateQuantityMutation.isPending}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-medium disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                        {sku.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityUpdate(sku, sku.quantity + 1)}
                        disabled={updateQuantityMutation.isPending}
                        className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-medium disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sku.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sku.expiry_date ? new Date(sku.expiry_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setEditingSku(sku)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sku.id)}
                      disabled={deleteSKUMutation.isPending}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {skusData && skusData.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between">
              <button
                onClick={() => setFilter({ ...filter, page: Math.max(1, filter.page! - 1) })}
                disabled={filter.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {filter.page} of {skusData.pages} ({skusData.total} total items)
              </span>
              <button
                onClick={() => setFilter({ ...filter, page: Math.min(skusData.pages, filter.page! + 1) })}
                disabled={filter.page === skusData.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {skusData?.items?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No inventory items found</p>
          <p className="text-gray-400 text-sm mt-2">
            {filter.search || filter.location_id || filter.low_stock
              ? 'Try adjusting your filters'
              : 'Add your first inventory item to get started'}
          </p>
        </div>
      )}
    </div>
  );
}
