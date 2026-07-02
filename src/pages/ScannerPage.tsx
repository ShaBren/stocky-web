import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { scannerAPI, locationsAPI } from '../services/api';
import type { Item, SKU } from '../types/api';
import { usePageTitle } from '../utils/usePageTitle';
import {
  PlusIcon,
  MinusIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

interface ScanResult {
  id: string;
  barcode: string;
  status: 'success' | 'error';
  message: string;
  item?: Item | null;
  skus?: SKU[];
  mode?: string | null;
  timestamp: number;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
  timestamp: number;
}

const MODES = [
  { key: 'add', label: 'Add', icon: PlusIcon, color: 'green' },
  { key: 'remove', label: 'Remove', icon: MinusIcon, color: 'red' },
  { key: 'lookup', label: 'Lookup', icon: MagnifyingGlassIcon, color: 'blue' },
] as const;

export default function ScannerPage() {
  usePageTitle('Scanner');

  const queryClient = useQueryClient();
  const [mode, setMode] = useState<string>('add');
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [barcode, setBarcode] = useState('');
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScanItem, setLastScanItem] = useState<Item | null>(null);
  const [lastScanSKUs, setLastScanSKUs] = useState<SKU[]>([]);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const { data: locationsData } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsAPI.getLocations(),
    retry: 1,
  });

  useEffect(() => { barcodeInputRef.current?.focus(); }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setToasts(prev => prev.filter(t => now - t.timestamp < 5000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addToast = (type: Toast['type'], message: string) => {
    setToasts(prev => [...prev, { id: Date.now().toString(), type, message, timestamp: Date.now() }]);
  };

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    const cmd = JSON.stringify({ command: 'set_mode', payload: { mode: newMode } });
    scannerAPI.scanBarcode(cmd).catch(() => {});
  };

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = barcode.trim();
    if (!value) return;
    if (!selectedLocationId && mode !== 'lookup') {
      addToast('error', 'Please select a location first');
      return;
    }

    setIsProcessing(true);
    setBarcode('');

    try {
      const response = await scannerAPI.scanBarcode(
        value,
        selectedLocationId ? String(selectedLocationId) : undefined,
      );

      const result: ScanResult = {
        id: Date.now().toString(),
        barcode: value,
        status: response.success ? 'success' : 'error',
        message: response.message,
        item: response.item,
        skus: response.skus,
        mode: response.mode,
        timestamp: Date.now(),
      };

      setScanResults(prev => [result, ...prev].slice(0, 50));

      if (response.success && response.item) {
        setLastScanItem(response.item);
        setLastScanSKUs(response.skus || []);
      }

      response.suggested_actions?.forEach(action => addToast('success', action));
      if (!response.success) addToast('error', response.message);

      queryClient.invalidateQueries({ queryKey: ['skus'] });
    } catch {
      addToast('error', 'Scan request failed');
    } finally {
      setIsProcessing(false);
      barcodeInputRef.current?.focus();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Barcode Scanner</h1>
        <p className="mt-2 text-gray-600">Scan barcodes to manage inventory</p>
      </div>

      <div className="stocky-card p-6 space-y-4">
        <div>
          <label className="stocky-label">Mode</label>
          <div className="flex space-x-3 mt-2">
            {MODES.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => handleModeChange(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-colors ${
                  mode === key
                    ? `bg-${color}-50 border-${color}-300 text-${color}-700`
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {mode !== 'lookup' && (
          <div>
            <label htmlFor="location" className="stocky-label">Location *</label>
            <select
              id="location"
              value={selectedLocationId || ''}
              onChange={e => setSelectedLocationId(e.target.value ? Number(e.target.value) : null)}
              className="stocky-input mt-1"
            >
              <option value="">Select a location</option>
              {locationsData?.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleBarcodeSubmit}>
          <label htmlFor="barcode" className="stocky-label">Barcode / UPC</label>
          <div className="flex space-x-3 mt-1">
            <input
              ref={barcodeInputRef}
              id="barcode"
              type="text"
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              placeholder="Scan or type a barcode..."
              className="stocky-input flex-1"
              disabled={isProcessing}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isProcessing || !barcode.trim()}
              className="stocky-button-primary disabled:opacity-50"
            >
              {isProcessing ? '...' : 'Scan'}
            </button>
          </div>
        </form>
      </div>

      {lastScanItem && (
        <div className="stocky-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Last Scan</h2>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{lastScanItem.name}</p>
              <p className="text-sm text-gray-500">UPC: {lastScanItem.upc || '—'}</p>
            </div>
            <div className="text-sm text-gray-600">
              {lastScanSKUs.length > 0 ? (
                <ul className="space-y-1">
                  {lastScanSKUs.map(sku => (
                    <li key={sku.id} className="flex items-center space-x-1">
                      <span className="font-medium">{sku.quantity}</span>
                      <span>at location {sku.location_id}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-400">No inventory yet</span>
              )}
            </div>
          </div>
        </div>
      )}

      {scanResults.length > 0 && (
        <div className="stocky-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Recent Scans ({scanResults.length})
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {scanResults.map(result => (
              <div key={result.id} className={`flex items-center space-x-2 p-2 rounded text-sm ${
                result.status === 'success' ? 'bg-green-50' : 'bg-red-50'
              }`}>
                {result.status === 'success'
                  ? <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  : <ExclamationCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                }
                <span className="truncate">
                  [{result.mode || '?'}] {result.barcode}: {result.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <div key={toast.id} className={`px-4 py-2 rounded-md shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-green-600 text-white' :
            toast.type === 'error' ? 'bg-red-600 text-white' :
            'bg-yellow-500 text-white'
          }`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
