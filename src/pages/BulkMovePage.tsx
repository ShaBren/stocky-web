import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsAPI, skusAPI, itemsAPI } from '../services/api';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { SearchableDropdown } from '../components/SearchableDropdown';
import { usePageTitle } from '../utils/usePageTitle';
import { parseValidationErrors } from '../utils/errorHandling';
import { 
  ArrowRightIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface BulkMoveData {
  fromLocationId: number;
  toLocationId: number;
  selectedSkuIds: number[];
}

export default function BulkMovePage() {
  usePageTitle('Bulk Move Items');
  
  const queryClient = useQueryClient();
  const [fromLocationId, setFromLocationId] = useState<number | null>(null);
  const [toLocationId, setToLocationId] = useState<number | null>(null);
  const [selectedSkuIds, setSelectedSkuIds] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Fetch locations data
  const { data: locationsData, isLoading: locationsLoading, error: locationsError } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsAPI.getLocations(),
    retry: 1
  });

  // Fetch SKUs data for the selected from location
  const { data: skusData, isLoading: skusLoading, error: skusError } = useQuery({
    queryKey: ['skus', fromLocationId],
    queryFn: () => skusAPI.getSKUs(),
    enabled: !!fromLocationId,
    retry: 1,
    select: (data) => data.filter(sku => sku.location_id === fromLocationId)
  });

  // Fetch items data to get item names
  const { data: itemsData } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemsAPI.getItems(),
    retry: 1
  });

  // Create lookup maps
  const itemsMap = useMemo(() => 
    new Map(itemsData?.map(item => [item.id, item]) || []), 
    [itemsData]
  );
  
  const locationsMap = useMemo(() => 
    new Map(locationsData?.map(location => [location.id, location]) || []), 
    [locationsData]
  );

  // Bulk move mutation
  const bulkMoveMutation = useMutation({
    mutationFn: async (moveData: BulkMoveData) => {
      const promises = moveData.selectedSkuIds.map(skuId => 
        skusAPI.updateSKU(skuId, { location_id: moveData.toLocationId })
      );
      return Promise.all(promises);
    },
    onSuccess: (data) => {
      const movedCount = data.length;
      const fromLocation = locationsMap.get(fromLocationId!);
      const toLocation = locationsMap.get(toLocationId!);
      
      setSuccessMessage(
        `Successfully moved ${movedCount} item${movedCount !== 1 ? 's' : ''} from ${fromLocation?.name} to ${toLocation?.name}`
      );
      setSelectedSkuIds(new Set());
      setErrors([]);
      
      // Refresh the SKUs data
      queryClient.invalidateQueries({ queryKey: ['skus'] });
    },
    onError: (error) => {
      const validationErrors = parseValidationErrors(error);
      setErrors(validationErrors);
      setSuccessMessage('');
    }
  });

  // Location options for dropdowns
  const locationOptions = locationsData?.map(location => ({
    value: location.id,
    label: location.name
  })) || [];

  // Available "from" locations (exclude the selected "to" location)
  const fromLocationOptions = locationOptions.filter(option => 
    option.value !== toLocationId
  );

  // Available "to" locations (exclude the selected "from" location)
  const toLocationOptions = locationOptions.filter(option => 
    option.value !== fromLocationId
  );

  // Handle location selection
  const handleFromLocationChange = (value: string | number) => {
    const locationId = Number(value);
    setFromLocationId(locationId);
    setSelectedSkuIds(new Set());
    setErrors([]);
    setSuccessMessage('');
  };

  const handleToLocationChange = (value: string | number) => {
    const locationId = Number(value);
    setToLocationId(locationId);
    setErrors([]);
    setSuccessMessage('');
  };

  // Handle SKU selection
  const handleSkuSelect = (skuId: number) => {
    const newSelected = new Set(selectedSkuIds);
    if (newSelected.has(skuId)) {
      newSelected.delete(skuId);
    } else {
      newSelected.add(skuId);
    }
    setSelectedSkuIds(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedSkuIds.size === skusData?.length) {
      setSelectedSkuIds(new Set());
    } else {
      setSelectedSkuIds(new Set(skusData?.map(sku => sku.id) || []));
    }
  };

  // Handle bulk move
  const handleBulkMove = () => {
    if (!fromLocationId || !toLocationId || selectedSkuIds.size === 0) {
      setErrors(['Please select both locations and at least one item to move.']);
      return;
    }

    if (fromLocationId === toLocationId) {
      setErrors(['Source and destination locations cannot be the same.']);
      return;
    }

    bulkMoveMutation.mutate({
      fromLocationId,
      toLocationId,
      selectedSkuIds: Array.from(selectedSkuIds)
    });
  };

  if (locationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  if (locationsError) {
    return <ErrorDisplay errors={[locationsError.message || 'Failed to load locations']} />;
  }

  const canMove = fromLocationId && toLocationId && selectedSkuIds.size > 0 && !bulkMoveMutation.isPending;
  const allSelected = skusData && selectedSkuIds.size === skusData.length && skusData.length > 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Move Items</h1>
        <p className="mt-2 text-gray-600">
          Move multiple items from one location to another. Select the source and destination locations, 
          then choose which items to move.
        </p>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {errors.length === 1 ? 'Error' : 'Errors'}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Location Selection */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Select Locations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Location *
            </label>
            <SearchableDropdown
              value={fromLocationId || ''}
              onChange={handleFromLocationChange}
              options={fromLocationOptions}
              placeholder="Select source location..."
              required
            />
          </div>
          
          <div className="flex justify-center">
            <ArrowRightIcon className="h-8 w-8 text-gray-400" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Location *
            </label>
            <SearchableDropdown
              value={toLocationId || ''}
              onChange={handleToLocationChange}
              options={toLocationOptions}
              placeholder="Select destination location..."
              required
            />
          </div>
        </div>
      </div>

      {/* Items List */}
      {fromLocationId && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Items in {locationsMap.get(fromLocationId)?.name}
              </h2>
              {skusData && skusData.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
          </div>

          {skusLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading items...</p>
            </div>
          ) : skusError ? (
            <div className="p-6">
              <ErrorDisplay errors={[skusError.message || 'Failed to load items']} />
            </div>
          ) : !skusData || skusData.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No items found in this location.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {skusData.map((sku) => {
                const item = itemsMap.get(sku.item_id);
                const isSelected = selectedSkuIds.has(sku.id);
                
                return (
                  <div 
                    key={sku.id} 
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSkuSelect(sku.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {item?.name || `Item ID: ${sku.item_id}`}
                            </h3>
                            {item?.description && (
                              <p className="text-sm text-gray-500">{item.description}</p>
                            )}
                            <div className="mt-1 text-xs text-gray-400">
                              SKU ID: {sku.id}
                              {sku.unit && ` • Unit: ${sku.unit}`}
                              {sku.expiry_date && ` • Expires: ${new Date(sku.expiry_date).toLocaleDateString()}`}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              Qty: {sku.quantity}
                            </p>
                            {sku.notes && (
                              <p className="text-xs text-gray-500 max-w-32 truncate">
                                {sku.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Move Button */}
          {skusData && skusData.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {selectedSkuIds.size} of {skusData.length} items selected
                </p>
                <button
                  onClick={handleBulkMove}
                  disabled={!canMove}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    canMove
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {bulkMoveMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Moving...
                    </div>
                  ) : (
                    `Move ${selectedSkuIds.size} Item${selectedSkuIds.size !== 1 ? 's' : ''}`
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}