import { NavLink, Outlet } from 'react-router-dom';
import { 
  HomeIcon, 
  CubeIcon, 
  TagIcon,
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
  { name: 'Items', href: '/items', icon: TagIcon },
  { name: 'Locations', href: '/locations', icon: MapPinIcon },
  { name: 'Scanner', href: '/scanner', icon: QrCodeIcon },
  { name: 'Alerts', href: '/alerts', icon: BellIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
];

export function Layout({ children, onLogout }: LayoutProps) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
        <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">StockyWeb</h1>
          </div>
          <nav className="mt-6">
            <div className="px-3 space-y-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <HomeIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                Dashboard
              </NavLink>
              <NavLink
                to="/inventory"
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <CubeIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                Inventory
              </NavLink>
              <NavLink
                to="/items"
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <TagIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                Items
              </NavLink>
              <NavLink
                to="/locations"
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <MapPinIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                Locations
              </NavLink>
              <NavLink
                to="/scanner"
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <QrCodeIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                Scanner
              </NavLink>
              <NavLink
                to="/alerts"
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <BellIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                Alerts
              </NavLink>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <UsersIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                Users
              </NavLink>
            </div>
          </nav>
          <div className="absolute bottom-0 w-64 p-3 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 flex-shrink-0" />
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="py-6">
            <div className="stocky-container">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
