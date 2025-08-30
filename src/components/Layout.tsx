import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  CubeIcon, 
  BuildingStorefrontIcon, 
  MapPinIcon,
  QrCodeIcon,
  BellIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Inventory', href: '/inventory', icon: CubeIcon },
  { name: 'Items', href: '/items', icon: BuildingStorefrontIcon },
  { name: 'Locations', href: '/locations', icon: MapPinIcon },
  { name: 'Scanner', href: '/scanner', icon: QrCodeIcon },
  { name: 'Alerts', href: '/alerts', icon: BellIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
];

export function Layout({ children, onLogout }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-white shadow-lg">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
          <h1 className="text-xl font-bold text-white">StockyWeb</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout button */}
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="stocky-container py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
