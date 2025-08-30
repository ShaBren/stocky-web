import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsAPI } from '../services/api';
import type { Item, ItemFilter, StorageType } from '../types/api';
import { StorageType as StorageTypeEnum } from '../types/api';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

interface ItemFormData {
  name: string;
  description: string;
  upc: string;
  default_storage_type: StorageType;
}

export function ItemsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ItemFilter>({ page: 1, size: 20 });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    description: '',
    upc: '',
    default_storage_type: StorageTypeEnum.PANTRY
  });

  // Fetch items data
  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = useQuery({
    queryKey: ['items', filter],
    queryFn: () => itemsAPI.getItems(filter),
    retry: 1
  });

  // Mutations
  const createItemMutation = useMutation({
    mutationFn: (itemData: Partial<Item>) => itemsAPI.createItem(itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setShowAddForm(false);
      resetForm();
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Item> }) =>
      itemsAPI.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setEditingItem(null);
      resetForm();
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => itemsAPI.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    }
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilter({ ...filter, search: term, page: 1 });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      upc: '',
      default_storage_type: StorageTypeEnum.PANTRY
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createItemMutation.mutate(formData);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      upc: item.upc || '',
      default_storage_type: item.default_storage_type
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(id);
    }
  };

  const storageTypeLabels = {
    [StorageTypeEnum.PANTRY]: 'Pantry',
    [StorageTypeEnum.REFRIGERATOR]: 'Refrigerator',
    [StorageTypeEnum.FREEZER]: 'Freezer',
    [StorageTypeEnum.COUNTER]: 'Counter',
    [StorageTypeEnum.GARAGE]: 'Garage',
    [StorageTypeEnum.OTHER]: 'Other'
  };

  if (itemsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (itemsError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Unable to load items data</p>
        <p className="text-sm">Please check your connection to the backend</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Items Catalog</h1>
          <p className="mt-2 text-gray-600">
            Manage your product catalog and item definitions
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingItem(null);
            setShowAddForm(true);
          }}
          className="stocky-button-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Item</span>
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
            value={filter.storage_type || ''}
            onChange={(e) => setFilter({ ...filter, storage_type: e.target.value as StorageType || undefined, page: 1 })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Storage Types</option>
            {Object.entries(storageTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="stocky-card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Item Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="upc" className="block text-sm font-medium text-gray-700">
                  UPC/Barcode
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    id="upc"
                    value={formData.upc}
                    onChange={(e) => setFormData({ ...formData, upc: e.target.value })}
                    className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  <QrCodeIcon className="h-5 w-5 absolute right-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="storage_type" className="block text-sm font-medium text-gray-700">
                Default Storage Type *
              </label>
              <select
                id="storage_type"
                required
                value={formData.default_storage_type}
                onChange={(e) => setFormData({ ...formData, default_storage_type: e.target.value as StorageType })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                {Object.entries(storageTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="stocky-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createItemMutation.isPending || updateItemMutation.isPending}
                className="stocky-button-primary disabled:opacity-50"
              >
                {createItemMutation.isPending || updateItemMutation.isPending
                  ? 'Saving...'
                  : editingItem
                  ? 'Update Item'
                  : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items Table */}
      <div className="stocky-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UPC/Barcode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default Storage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {itemsData?.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.upc || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {storageTypeLabels[item.default_storage_type]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteItemMutation.isPending}
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
      </div>

      {/* Empty State */}
      {itemsData?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items found</p>
          <p className="text-gray-400 text-sm mt-2">
            {filter.search || filter.storage_type
              ? 'Try adjusting your filters'
              : 'Add your first item to get started'}
          </p>
        </div>
      )}
    </div>
  );
}
