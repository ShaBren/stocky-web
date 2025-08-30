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
  const [formData, setFormData] = useState({
    item_id: '',
    location_id: '',
    quantity: '',
    unit: '',
    expiry_date: '',
    low_stock_threshold: '',
    notes: ''
  });

  // Fetch inventory data
  const { data: skusData, isLoading: skusLoading, error: skusError } = useQuery({
    queryKey: ['skus', filter],
    queryFn: () => skusAPI.getSKUs(filter),
    retry: 1
  });

  // Fetch items and locations for dropdowns
  const { data: itemsData } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsAPI.getItems(),
    retry: 1
  });

  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsAPI.getLocations(),
    retry: 1
  });

  // Create lookup maps for items and locations
  const itemsMap = new Map(itemsData?.map(item => [item.id, item]) || []);
  const locationsMap = new Map(locationsData?.map(location => [location.id, location]) || []);

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

  const createSKUMutation = useMutation({
    mutationFn: (data: any) => skusAPI.createSKU(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skus'] });
      setShowAddForm(false);
      setFormData({
        item_id: '',
        location_id: '',
        quantity: '',
        unit: '',
        expiry_date: '',
        low_stock_threshold: '',
        notes: ''
      });
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      item_id: Number(formData.item_id),
      location_id: Number(formData.location_id),
      quantity: Number(formData.quantity),
      unit: formData.unit,
      expiry_date: formData.expiry_date || null,
      low_stock_threshold: formData.low_stock_threshold ? Number(formData.low_stock_threshold) : null,
      notes: formData.notes || null
    };

    createSKUMutation.mutate(submitData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="stocky-search-input"
            />
          </div>
          <div className="md:col-span-3">
            <select
              value={filter.location_id || ''}
              onChange={(e) => setFilter({ ...filter, location_id: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
              className="stocky-input"
            >
              <option value="">All Locations</option>
              {locationsData?.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3 flex items-center space-x-2">
            <input
              type="checkbox"
              id="lowStock"
              checked={filter.low_stock || false}
              onChange={(e) => setFilter({ ...filter, low_stock: e.target.checked, page: 1 })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
          <table className="stocky-table">
            <thead className="stocky-table-header">
              <tr>
                <th className="stocky-table-header-cell">
                  Item
                </th>
                <th className="stocky-table-header-cell">
                  Location
                </th>
                <th className="stocky-table-header-cell">
                  Quantity
                </th>
                <th className="stocky-table-header-cell">
                  Unit
                </th>
                <th className="stocky-table-header-cell">
                  Expiry Date
                </th>
                <th className="stocky-table-header-cell">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="stocky-table-body">
              {skusData?.map((sku) => (
                <tr key={sku.id} className={isLowStock(sku) ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {isLowStock(sku) && (
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {itemsMap.get(sku.item_id)?.name || 'Unknown Item'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {itemsMap.get(sku.item_id)?.description || ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {locationsMap.get(sku.location_id)?.name || 'Unknown Location'}
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
                  <td className="stocky-table-cell">
                    {sku.unit}
                  </td>
                  <td className="stocky-table-cell">
                    {sku.expiry_date ? new Date(sku.expiry_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="stocky-table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingSku(sku)}
                        className="stocky-icon-button"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sku.id)}
                        disabled={deleteSKUMutation.isPending}
                        className="stocky-icon-button text-red-600 hover:text-red-700 disabled:opacity-50"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {skusData?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No inventory items found</p>
          <p className="text-gray-400 text-sm mt-2">
            {filter.search || filter.location_id || filter.low_stock
              ? 'Try adjusting your filters'
              : 'Add your first inventory item to get started'}
          </p>
        </div>
      )}

      {/* Add Inventory Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add Inventory Item
              </h3>
              <form onSubmit={handleFormSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="item_id" className="stocky-label">
                      Item *
                    </label>
                    <select
                      id="item_id"
                      name="item_id"
                      value={formData.item_id}
                      onChange={handleInputChange}
                      required
                      className="stocky-input"
                    >
                      <option value="">Select an item</option>
                      {itemsData?.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="location_id" className="stocky-label">
                      Location *
                    </label>
                    <select
                      id="location_id"
                      name="location_id"
                      value={formData.location_id}
                      onChange={handleInputChange}
                      required
                      className="stocky-input"
                    >
                      <option value="">Select a location</option>
                      {locationsData?.map(location => (
                        <option key={location.id} value={location.id}>{location.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="quantity" className="stocky-label">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="stocky-input"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label htmlFor="unit" className="stocky-label">
                      Unit *
                    </label>
                    <input
                      type="text"
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      required
                      className="stocky-input"
                      placeholder="e.g. pieces, kg, litres"
                    />
                  </div>
                  <div>
                    <label htmlFor="expiry_date" className="stocky-label">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      id="expiry_date"
                      name="expiry_date"
                      value={formData.expiry_date}
                      onChange={handleInputChange}
                      className="stocky-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="low_stock_threshold" className="stocky-label">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      id="low_stock_threshold"
                      name="low_stock_threshold"
                      value={formData.low_stock_threshold}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="stocky-input"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="notes" className="stocky-label">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="stocky-input"
                    placeholder="Additional notes about this inventory item..."
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="stocky-button-secondary"
                    disabled={createSKUMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="stocky-button-primary"
                    disabled={createSKUMutation.isPending}
                  >
                    {createSKUMutation.isPending ? 'Adding...' : 'Add Inventory'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
