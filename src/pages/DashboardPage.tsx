import { useQuery } from '@tanstack/react-query';
import { skusAPI, alertsAPI, healthAPI, itemsAPI, locationsAPI } from '../services/api';
import { 
  CubeIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export function DashboardPage() {
  const { data: skusData, error: skusError } = useQuery({
    queryKey: ['skus'],
    queryFn: () => skusAPI.getSKUs(),
    retry: 1
  });

  // Calculate low stock items client-side with proper threshold logic
  const lowStockData = skusData?.filter(sku => {
    // Only consider items low stock if they have a threshold AND quantity is below it
    return sku.low_stock_threshold != null && sku.quantity <= sku.low_stock_threshold;
  }) || [];

  const { data: alertsData } = useQuery({
    queryKey: ['alerts', { unread_only: true }],
    queryFn: () => alertsAPI.getAlerts(1, 100, true),
    retry: 1
  });

  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: healthAPI.check,
    retry: 1
  });

  // Fetch items and locations for lookup
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

  // Create lookup maps
  const itemsMap = new Map(itemsData?.map(item => [item.id, item]) || []);
  const locationsMap = new Map(locationsData?.map(location => [location.id, location]) || []);

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
      name: 'Unread Alerts',
      value: alertsData?.length || 0,
      icon: ClockIcon,
      color: 'bg-red-500'
    },
    {
      name: 'System Status',
      value: healthData?.status === 'healthy' ? 'Online' : 'Offline',
      icon: CheckCircleIcon,
      color: healthData?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
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

      {/* Recent Alerts */}
      {alertsData && alertsData.length > 0 && (
        <div className="stocky-card">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Alerts
            </h3>
            <div className="space-y-3">
              {alertsData.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
