import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../services/api';
import { getNavigationItems, getRoleName, getRoleBadgeColor } from '../utils/permissions';
import { ProfileModal } from './ProfileModal';
import { 
  HomeIcon, 
  CubeIcon, 
  MapPinIcon,
  QrCodeIcon,
  BellIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ArchiveBoxIcon,
  CogIcon,
  TagIcon,
  ArrowsRightLeftIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  onLogout: () => void;
}

// Icon mapping for navigation items
const iconMap = {
  HomeIcon,
  ArchiveBoxIcon,
  CubeIcon,
  MapPinIcon,
  QrCodeIcon,
  BellIcon,
  UsersIcon,
  CogIcon,
  TagIcon,
  ArrowsRightLeftIcon,
  ListBulletIcon,
};

export function Layout({ onLogout }: LayoutProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Get current user for role-based navigation
  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authAPI.getCurrentUser(),
    retry: 1
  });

  // Get navigation items based on user role
  const navigation = getNavigationItems(currentUser?.role);

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">StockyWeb</h1>
          </div>
          <nav className="flex-1 mt-6">
            <div className="px-3 space-y-1">
              {navigation.map((item) => {
                const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                );
              })}
            </div>
          </nav>
          
          {/* User Profile Section */}
          {currentUser && (
            <div className="p-3 border-t border-gray-200">
              <div className="flex items-center mb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
                  <p className="text-xs text-gray-500">@{currentUser.username}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(currentUser.role)}`}>
                    {getRoleName(currentUser.role)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 mb-2"
              >
                <UserIcon className="mr-3 h-5 w-5 flex-shrink-0" />
                Edit Profile
              </button>
            </div>
          )}
          
          <div className="p-3 border-t border-gray-200">
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
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto py-6">
            <div className="stocky-container">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Profile Modal */}
      {currentUser && (
        <ProfileModal
          user={currentUser}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}
