import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsAPI } from '../services/api';
import type { Location, LocationFilter, StorageType } from '../types/api';
import { StorageType as StorageTypeEnum } from '../types/api';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface LocationFormData {
  name: string;
  description: string;
  storage_type: StorageType;
}

export function LocationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<LocationFilter>({ page: 1, size: 20 });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    description: '',
    storage_type: StorageTypeEnum.PANTRY
  });

  // Fetch locations data
  const { data: locationsData, isLoading: locationsLoading, error: locationsError } = useQuery({
    queryKey: ['locations', filter],
    queryFn: () => locationsAPI.getLocations(filter),
    retry: 1
  });

  // Mutations
  const createLocationMutation = useMutation({
    mutationFn: (locationData: Partial<Location>) => locationsAPI.createLocation(locationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setShowAddForm(false);
      resetForm();
    }
  });

  const updateLocationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Location> }) =>
      locationsAPI.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setEditingLocation(null);
      resetForm();
    }
  });

  const deleteLocationMutation = useMutation({
    mutationFn: (id: number) => locationsAPI.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
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
      storage_type: StorageTypeEnum.PANTRY
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      updateLocationMutation.mutate({ id: editingLocation.id, data: formData });
    } else {
      createLocationMutation.mutate(formData);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      description: location.description || '',
      storage_type: location.storage_type
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this location? This may affect existing inventory items.')) {
      deleteLocationMutation.mutate(id);
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

  const storageTypeIcons = {
    [StorageTypeEnum.PANTRY]: '🏪',
    [StorageTypeEnum.REFRIGERATOR]: '❄️',
    [StorageTypeEnum.FREEZER]: '🧊',
    [StorageTypeEnum.COUNTER]: '🏠',
    [StorageTypeEnum.GARAGE]: '🏠',
    [StorageTypeEnum.OTHER]: '📦'
  };

  if (locationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (locationsError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-medium">Unable to load locations data</p>
        <p className="text-sm">Please check your connection to the backend</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Storage Locations</h1>
          <p className="mt-2 text-gray-600">
            Manage your storage locations and organization
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingLocation(null);
            setShowAddForm(true);
          }}
          className="stocky-button-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Location</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="stocky-card p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="stocky-search-input"
            />
          </div>
          <select
            value={filter.storage_type || ''}
            onChange={(e) => setFilter({ ...filter, storage_type: e.target.value as StorageType || undefined, page: 1 })}
            className="stocky-input"
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
            {editingLocation ? 'Edit Location' : 'Add New Location'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Location Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="stocky-input"
                  placeholder="e.g. Main Pantry, Upstairs Freezer"
                />
              </div>
              <div>
                <label htmlFor="storage_type" className="block text-sm font-medium text-gray-700">
                  Storage Type *
                </label>
                <select
                  id="storage_type"
                  required
                  value={formData.storage_type}
                  onChange={(e) => setFormData({ ...formData, storage_type: e.target.value as StorageType })}
                  className="stocky-input"
                >
                  {Object.entries(storageTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {storageTypeIcons[value as StorageType]} {label}
                    </option>
                  ))}
                </select>
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
                className="stocky-input"
                placeholder="Additional details about this location..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingLocation(null);
                  resetForm();
                }}
                className="stocky-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLocationMutation.isPending || updateLocationMutation.isPending}
                className="stocky-button-primary disabled:opacity-50"
              >
                {createLocationMutation.isPending || updateLocationMutation.isPending
                  ? 'Saving...'
                  : editingLocation
                  ? 'Update Location'
                  : 'Add Location'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locationsData?.map((location) => (
          <div key={location.id} className="stocky-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {storageTypeIcons[location.storage_type]}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {location.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {storageTypeLabels[location.storage_type]}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(location)}
                  className="text-primary-600 hover:text-primary-900"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(location.id)}
                  disabled={deleteLocationMutation.isPending}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {location.description && (
              <p className="mt-3 text-sm text-gray-600">
                {location.description}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                location.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {location.is_active ? 'Active' : 'Inactive'}
              </span>
              <div className="flex items-center text-xs text-gray-500">
                <MapPinIcon className="h-4 w-4 mr-1" />
                <span>ID: {location.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {locationsData?.length === 0 && (
        <div className="text-center py-12">
          <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-gray-500 text-lg mt-4">No locations found</p>
          <p className="text-gray-400 text-sm mt-2">
            {filter.search || filter.storage_type
              ? 'Try adjusting your filters'
              : 'Add your first storage location to get started'}
          </p>
        </div>
      )}
    </div>
  );
}
