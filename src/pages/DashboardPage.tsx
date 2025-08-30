import { useQuery } from '@tanstack/react-query';
import { skusAPI, itemsAPI, locationsAPI } from '../services/api';
import { usePageTitle } from '../utils/usePageTitle';
import type { Item, Location } from '../types/api';
import { 
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  usePageTitle('Dashboard');
  // Data queries
  const { data: skusData, error: skusError } = useQuery({
    queryKey: ['skus'],
    queryFn: () => skusAPI.getSKUs(),
    retry: 1
  });

  // Filter low stock SKUs
  const lowStockData = skusData?.filter(sku => {
    // Only consider items low stock if they have a threshold AND quantity is below it
    return sku.low_stock_threshold != null && sku.quantity <= sku.low_stock_threshold;
  }) || [];

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

  const itemsMap = new Map((itemsData || []).map((item: Item) => [item.id, item]));
  const locationsMap = new Map((locationsData || []).map((location: Location) => [location.id, location]));

  const stats = [
    {
      name: 'Total Items in Inventory',
      value: skusData?.reduce((total, sku) => total + sku.quantity, 0) || 0,
      icon: CubeIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Low Stock Items',
      value: lowStockData.length,
      icon: ExclamationTriangleIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'System Status',
      value: 'Online',
      icon: CheckCircleIcon,
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your kitchen inventory management system
        </p>
      </div>

      {/* Error Display */}
      {skusError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Unable to load inventory data</p>
          <p className="text-sm">{skusError.message || 'Please check your connection to the backend'}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="stocky-card p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Items */}
      {lowStockData.length > 0 && (
        <div className="stocky-card">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Low Stock Items
            </h3>
            <div className="space-y-3">
              {lowStockData.slice(0, 5).map((sku) => (
                <div key={sku.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {itemsMap.get(sku.item_id)?.name || 'Unknown Item'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {locationsMap.get(sku.location_id)?.name || 'Unknown Location'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {sku.quantity} {sku.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      Threshold: {sku.low_stock_threshold}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
