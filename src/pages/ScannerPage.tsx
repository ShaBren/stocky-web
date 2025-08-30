import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skusAPI, itemsAPI, locationsAPI } from '../services/api';
import type { SKU, Item } from '../types/api';
import { 
  PlusIcon, 
  MinusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ScanJob {
  id: string;
  barcode: string;
  action: 'add' | 'remove';
  locationId: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
  timestamp: number;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
  timestamp: number;
}

export function ScannerPage() {
  const queryClient = useQueryClient();
  const [action, setAction] = useState<'add' | 'remove'>('add');
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [barcode, setBarcode] = useState('');
  const [scanJobs, setScanJobs] = useState<ScanJob[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Fetch locations for selection
  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsAPI.getLocations(),
    retry: 1
  });

  // Fetch current inventory data
  const { data: skusData } = useQuery({
    queryKey: ['skus'],
    queryFn: () => skusAPI.getSKUs({ page: 1, size: 1000 }),
    retry: 1
  });

  // Create/update SKU mutations
  const createSKUMutation = useMutation({
    mutationFn: (data: Partial<SKU>) => skusAPI.createSKU(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skus'] });
    }
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      skusAPI.updateQuantity(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skus'] });
    }
  });

  const createItemMutation = useMutation({
    mutationFn: (data: Partial<Item>) => itemsAPI.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    }
  });

  // Auto-focus barcode input on mount and after processing
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [isProcessing]);

  // Process scan job queue
  useEffect(() => {
    const processNextJob = async () => {
      if (isProcessing) return;
      
      const pendingJob = scanJobs.find(job => job.status === 'pending');
      if (!pendingJob) return;

      setIsProcessing(true);
      
      // Mark job as processing
      setScanJobs(prev => prev.map(job => 
        job.id === pendingJob.id ? { ...job, status: 'processing' } : job
      ));

      try {
        await processScanJob(pendingJob);
      } catch (error) {
        console.error('Error processing scan job:', error);
        setScanJobs(prev => prev.map(job => 
          job.id === pendingJob.id 
            ? { ...job, status: 'error', message: 'Unexpected error occurred' } 
            : job
        ));
        addToast('error', 'Unexpected error occurred');
      } finally {
        setIsProcessing(false);
      }
    };

    processNextJob();
  }, [scanJobs, isProcessing]);

  // Remove old toasts
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setToasts(prev => prev.filter(toast => now - toast.timestamp < 5000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addToast = (type: Toast['type'], message: string) => {
    const toast: Toast = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now()
    };
    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const processScanJob = async (job: ScanJob) => {
    const { barcode, action, locationId } = job;
    
    // Find existing SKU for this barcode and location
    // Note: This is a simplified lookup - in a real app, you'd need to
    // match by barcode field on the item or have a barcode lookup table
    const existingSKU = skusData?.find(sku => {
      return sku.location_id === locationId && 
             String(sku.item_id).includes(barcode.slice(-3)); // Simplified matching
    });

    if (action === 'add') {
      if (existingSKU) {
        // Increment existing SKU quantity
        await updateQuantityMutation.mutateAsync({
          id: existingSKU.id,
          quantity: existingSKU.quantity + 1
        });
        
        setScanJobs(prev => prev.map(j => 
          j.id === job.id 
            ? { ...j, status: 'completed', message: `Added 1 item (now ${existingSKU.quantity + 1})` }
            : j
        ));
        addToast('success', `Added 1 item (now ${existingSKU.quantity + 1})`);
      } else {
        // Create new item and SKU
        try {
          // First, create or find the item with this barcode
          const newItem = await createItemMutation.mutateAsync({
            name: `Item ${barcode}`,
            description: `Scanned item with barcode ${barcode}`
          });

          // Then create the SKU
          await createSKUMutation.mutateAsync({
            item_id: newItem.id,
            location_id: locationId,
            quantity: 1,
            unit: 'pieces'
          });

          setScanJobs(prev => prev.map(j => 
            j.id === job.id 
              ? { ...j, status: 'completed', message: 'Added new item (quantity: 1)' }
              : j
          ));
          addToast('success', 'Added new item (quantity: 1)');
        } catch (error) {
          setScanJobs(prev => prev.map(j => 
            j.id === job.id 
              ? { ...j, status: 'error', message: 'Failed to create item' }
              : j
          ));
          addToast('error', 'Failed to create item');
        }
      }
    } else if (action === 'remove') {
      if (!existingSKU) {
        setScanJobs(prev => prev.map(j => 
          j.id === job.id 
            ? { ...j, status: 'error', message: 'Item not found in this location' }
            : j
        ));
        addToast('error', 'Item not found in this location');
        return;
      }

      if (existingSKU.quantity <= 0) {
        setScanJobs(prev => prev.map(j => 
          j.id === job.id 
            ? { ...j, status: 'error', message: 'Item quantity is already 0' }
            : j
        ));
        addToast('warning', 'Item quantity is already 0');
        return;
      }

      // Decrement quantity
      await updateQuantityMutation.mutateAsync({
        id: existingSKU.id,
        quantity: existingSKU.quantity - 1
      });

      setScanJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, status: 'completed', message: `Removed 1 item (now ${existingSKU.quantity - 1})` }
          : j
      ));
      addToast('success', `Removed 1 item (now ${existingSKU.quantity - 1})`);
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barcode.trim()) return;
    if (!selectedLocationId) {
      addToast('error', 'Please select a location first');
      return;
    }

    // Add job to queue
    const job: ScanJob = {
      id: Date.now().toString(),
      barcode: barcode.trim(),
      action,
      locationId: selectedLocationId,
      status: 'pending',
      timestamp: Date.now()
    };

    setScanJobs(prev => [...prev, job]);
    setBarcode(''); // Clear input for next scan
    
    // Keep focus on input
    setTimeout(() => {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    }, 0);
  };

  const getLocationName = (id: number) => {
    return locationsData?.find(loc => loc.id === id)?.name || 'Unknown Location';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Barcode Scanner</h1>
        <p className="mt-2 text-gray-600">
          Scan items to add or remove from inventory
        </p>
      </div>

      {/* Configuration */}
      <div className="stocky-card p-6 space-y-6">
        {/* Action Selection */}
        <div>
          <label className="stocky-label">Action</label>
          <div className="flex space-x-4 mt-2">
            <button
              onClick={() => setAction('add')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                action === 'add'
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Items</span>
            </button>
            <button
              onClick={() => setAction('remove')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                action === 'remove'
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MinusIcon className="h-5 w-5" />
              <span>Remove Items</span>
            </button>
          </div>
        </div>

        {/* Location Selection */}
        <div>
          <label htmlFor="location" className="stocky-label">
            Location *
          </label>
          <select
            id="location"
            value={selectedLocationId || ''}
            onChange={(e) => setSelectedLocationId(e.target.value ? Number(e.target.value) : null)}
            className="stocky-input mt-1"
            required
          >
            <option value="">Select a location</option>
            {locationsData?.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        {/* Barcode Input */}
        <form onSubmit={handleBarcodeSubmit}>
          <label htmlFor="barcode" className="stocky-label">
            Barcode/UPC
          </label>
          <div className="mt-1 flex space-x-3">
            <input
              ref={barcodeInputRef}
              id="barcode"
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan or enter barcode..."
              className="stocky-input flex-1"
              disabled={!selectedLocationId}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!barcode.trim() || !selectedLocationId || isProcessing}
              className="stocky-button-primary"
            >
              {action === 'add' ? 'Add' : 'Remove'}
            </button>
          </div>
          {!selectedLocationId && (
            <p className="mt-1 text-sm text-gray-500">
              Select a location to enable barcode scanning
            </p>
          )}
        </form>
      </div>

      {/* Current Status */}
      {selectedLocationId && (
        <div className="stocky-card p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Current Settings</h3>
          <div className="flex items-center space-x-4 text-sm">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              action === 'add' 
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {action === 'add' ? 'Adding to' : 'Removing from'} {getLocationName(selectedLocationId)}
            </span>
            {isProcessing && (
              <span className="inline-flex items-center text-yellow-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                Processing...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {scanJobs.length > 0 && (
        <div className="stocky-card">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Scans</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {scanJobs.slice(-10).reverse().map((job) => (
              <div key={job.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 ${
                    job.status === 'completed' ? 'text-green-500' :
                    job.status === 'error' ? 'text-red-500' :
                    job.status === 'processing' ? 'text-yellow-500' :
                    'text-gray-400'
                  }`}>
                    {job.status === 'completed' && <CheckCircleIcon className="h-5 w-5" />}
                    {job.status === 'error' && <ExclamationCircleIcon className="h-5 w-5" />}
                    {job.status === 'processing' && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
                    )}
                    {job.status === 'pending' && (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {job.action === 'add' ? 'Add' : 'Remove'} • {job.barcode}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getLocationName(job.locationId)}
                      {job.message && ` • ${job.message}`}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(job.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm rounded-md shadow-lg p-4 flex items-center justify-between ${
              toast.type === 'success' ? 'bg-green-50 border border-green-200' :
              toast.type === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`flex-shrink-0 ${
                toast.type === 'success' ? 'text-green-500' :
                toast.type === 'error' ? 'text-red-500' :
                'text-yellow-500'
              }`}>
                {toast.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
                {toast.type === 'error' && <ExclamationCircleIcon className="h-5 w-5" />}
                {toast.type === 'warning' && <ExclamationCircleIcon className="h-5 w-5" />}
              </div>
              <p className={`text-sm font-medium ${
                toast.type === 'success' ? 'text-green-800' :
                toast.type === 'error' ? 'text-red-800' :
                'text-yellow-800'
              }`}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`ml-3 flex-shrink-0 ${
                toast.type === 'success' ? 'text-green-400 hover:text-green-600' :
                toast.type === 'error' ? 'text-red-400 hover:text-red-600' :
                'text-yellow-400 hover:text-yellow-600'
              }`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
