// Permission management utilities for role-based access control

export type UserRole = 'admin' | 'member' | 'scanner' | 'read_only';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Permission definitions for each role
export const ROLE_PERMISSIONS = {
  admin: {
    // Full access to everything
    canAccessUsers: true,
    canAccessInventory: true,
    canAccessItems: true,
    canAccessLocations: true,
    canAccessScanner: true,
    canAccessAlerts: true,
    canAccessDashboard: true,
    canAccessAdmin: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canChangeOwnProfile: true,
    canBackupData: true,
    canRestoreData: true,
  },
  member: {
    // Full access except user management
    canAccessUsers: false,
    canAccessInventory: true,
    canAccessItems: true,
    canAccessLocations: true,
    canAccessScanner: true,
    canAccessAlerts: true,
    canAccessDashboard: true,
    canAccessAdmin: false,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canChangeOwnProfile: true,
    canBackupData: false,
    canRestoreData: false,
  },
  scanner: {
    // Only scanner access
    canAccessUsers: false,
    canAccessInventory: false,
    canAccessItems: false,
    canAccessLocations: false,
    canAccessScanner: true,
    canAccessAlerts: false,
    canAccessDashboard: false,
    canAccessAdmin: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canChangeOwnProfile: true,
    canBackupData: false,
    canRestoreData: false,
  },
  read_only: {
    // Read access only, no scanner or users
    canAccessUsers: false,
    canAccessInventory: true,
    canAccessItems: true,
    canAccessLocations: true,
    canAccessScanner: false,
    canAccessAlerts: true,
    canAccessDashboard: true,
    canAccessAdmin: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canChangeOwnProfile: true,
    canBackupData: false,
    canRestoreData: false,
  },
} as const;

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userRole: UserRole | undefined,
  permission: keyof typeof ROLE_PERMISSIONS.admin
): boolean {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole][permission] || false;
}

/**
 * Check if user can access a specific page
 */
export function canAccessPage(userRole: UserRole | undefined, page: string): boolean {
  if (!userRole) return false;
  
  switch (page.toLowerCase()) {
    case 'dashboard':
      return hasPermission(userRole, 'canAccessDashboard');
    case 'inventory':
      return hasPermission(userRole, 'canAccessInventory');
    case 'items':
      return hasPermission(userRole, 'canAccessItems');
    case 'locations':
      return hasPermission(userRole, 'canAccessLocations');
    case 'scanner':
      return hasPermission(userRole, 'canAccessScanner');
    case 'alerts':
      return hasPermission(userRole, 'canAccessAlerts');
    case 'users':
      return hasPermission(userRole, 'canAccessUsers');
    case 'admin':
      return hasPermission(userRole, 'canAccessAdmin');
    default:
      return false;
  }
}

/**
 * Get user-friendly role name
 */
export function getRoleName(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'member':
      return 'Member';
    case 'scanner':
      return 'Scanner';
    case 'read_only':
      return 'Read Only';
    default:
      return 'Unknown';
  }
}

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800';
    case 'member':
      return 'bg-blue-100 text-blue-800';
    case 'scanner':
      return 'bg-green-100 text-green-800';
    case 'read_only':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Check if user can perform CRUD operations
 */
export function canPerformAction(
  userRole: UserRole | undefined,
  action: 'create' | 'edit' | 'delete'
): boolean {
  if (!userRole) return false;
  
  switch (action) {
    case 'create':
      return hasPermission(userRole, 'canCreate');
    case 'edit':
      return hasPermission(userRole, 'canEdit');
    case 'delete':
      return hasPermission(userRole, 'canDelete');
    default:
      return false;
  }
}

/**
 * Get navigation items based on user role
 */
export function getNavigationItems(userRole: UserRole | undefined) {
  const baseItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: 'HomeIcon',
      show: canAccessPage(userRole, 'dashboard'),
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: 'ArchiveBoxIcon',
      show: canAccessPage(userRole, 'inventory'),
    },
    {
      name: 'Items',
      href: '/items',
      icon: 'CubeIcon',
      show: canAccessPage(userRole, 'items'),
    },
    {
      name: 'Locations',
      href: '/locations',
      icon: 'MapPinIcon',
      show: canAccessPage(userRole, 'locations'),
    },
    {
      name: 'Scanner',
      href: '/scanner',
      icon: 'QrCodeIcon',
      show: canAccessPage(userRole, 'scanner'),
    },
    {
      name: 'Alerts',
      href: '/alerts',
      icon: 'BellIcon',
      show: canAccessPage(userRole, 'alerts'),
    },
    {
      name: 'Users',
      href: '/users',
      icon: 'UsersIcon',
      show: canAccessPage(userRole, 'users'),
    },
    {
      name: 'Admin',
      href: '/admin',
      icon: 'CogIcon',
      show: canAccessPage(userRole, 'admin'),
    },
  ];

  return baseItems.filter(item => item.show);
}
