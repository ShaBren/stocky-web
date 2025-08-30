import { useQuery } from '@tanstack/react-query';
import { skusAPI, alertsAPI, healthAPI } from '../services/api';
import { 
  CubeIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export function DashboardPage() {
  const { data: skusData } = useQuery({
    queryKey: ['skus', { page: 1, size: 1 }],
    queryFn: () => skusAPI.getSKUs({ page: 1, size: 1 })
  });

  const { data: lowStockData } = useQuery({
    queryKey: ['skus', { low_stock: true, page: 1, size: 10 }],
    queryFn: () => skusAPI.getSKUs({ low_stock: true, page: 1, size: 10 })
  });

  const { data: alertsData } = useQuery({
    queryKey: ['alerts', { unread_only: true, page: 1, size: 10 }],
    queryFn: () => alertsAPI.getAlerts(1, 10, true)
  });

  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: healthAPI.check
  });

  const stats = [
    {
      name: 'Total Items in Inventory',
      value: skusData?.total || 0,
      icon: CubeIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Low Stock Items',
      value: lowStockData?.total || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Unread Alerts',
      value: alertsData?.total || 0,
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
      {alertsData && alertsData.items.length > 0 && (
        <div className="stocky-card">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Alerts
            </h3>
            <div className="space-y-3">
              {alertsData.items.slice(0, 5).map((alert) => (
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
      {lowStockData && lowStockData.items.length > 0 && (
        <div className="stocky-card">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Low Stock Items
            </h3>
            <div className="space-y-3">
              {lowStockData.items.slice(0, 5).map((sku) => (
                <div key={sku.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {sku.item?.name || 'Unknown Item'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {sku.location?.name || 'Unknown Location'}
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
