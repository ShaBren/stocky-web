// Permission management utilities for role-based access control

export type UserRole = 'ADMIN' | 'MEMBER';

// Permission definitions for each role
export const ROLE_PERMISSIONS = {
  ADMIN: {
    // Full access to everything
    canAccessUsers: true,
    canAccessInventory: true,
    canAccessItems: true,
    canAccessLocations: true,
    canAccessScanner: true,
    canAccessAlerts: true,
    canAccessDashboard: true,
    canAccessAdmin: true,
    canAccessBulkMove: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canChangeOwnProfile: true,
    canBackupData: true,
    canRestoreData: true,
  },
  MEMBER: {
    // Full access except user management and admin functions
    canAccessUsers: false,
    canAccessInventory: true,
    canAccessItems: true,
    canAccessLocations: true,
    canAccessScanner: true,
    canAccessAlerts: true,
    canAccessDashboard: true,
    canAccessAdmin: false,
    canAccessBulkMove: false,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canChangeOwnProfile: true,
    canBackupData: false,
    canRestoreData: false,
  },
} as const;

// Type for permission keys
export type Permission = keyof typeof ROLE_PERMISSIONS.ADMIN;

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole: UserRole | undefined, permission: Permission): boolean {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false;
  }
  return ROLE_PERMISSIONS[userRole][permission] || false;
}

/**
 * Get navigation items based on user permissions
 */
export function getNavigationItems(userRole: UserRole | undefined) {
  const items = [];

  if (hasPermission(userRole, 'canAccessDashboard')) {
    items.push({ name: 'Dashboard', href: '/dashboard', icon: 'HomeIcon' });
  }

  if (hasPermission(userRole, 'canAccessInventory')) {
    items.push({ name: 'Inventory', href: '/inventory', icon: 'CubeIcon' });
  }

  if (hasPermission(userRole, 'canAccessItems')) {
    items.push({ name: 'Items', href: '/items', icon: 'TagIcon' });
  }

  if (hasPermission(userRole, 'canAccessLocations')) {
    items.push({ name: 'Locations', href: '/locations', icon: 'MapPinIcon' });
  }

  if (hasPermission(userRole, 'canAccessBulkMove')) {
    items.push({ name: 'Bulk Move', href: '/bulk-move', icon: 'ArrowRightLeftIcon' });
  }

  if (hasPermission(userRole, 'canAccessScanner')) {
    items.push({ name: 'Scanner', href: '/scanner', icon: 'QrCodeIcon' });
  }

  if (hasPermission(userRole, 'canAccessAlerts')) {
    items.push({ name: 'Alerts', href: '/alerts', icon: 'BellIcon' });
  }

  if (hasPermission(userRole, 'canAccessUsers')) {
    items.push({ name: 'Users', href: '/users', icon: 'UsersIcon' });
  }

  if (hasPermission(userRole, 'canAccessAdmin')) {
    items.push({ name: 'Admin', href: '/admin', icon: 'CogIcon' });
  }

  return items;
}

/**
 * Get display name for a user role
 */
export function getRoleName(role: UserRole | undefined): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrator';
    case 'MEMBER':
      return 'Member';
    default:
      return 'Unknown';
  }
}

/**
 * Get CSS classes for role badge
 */
export function getRoleBadgeColor(role: UserRole | undefined): string {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-100 text-red-800';
    case 'MEMBER':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Check if user can perform a specific action (create, edit, delete)
 */
export function canPerformAction(
  userRole: UserRole | undefined,
  action: 'create' | 'edit' | 'delete'
): boolean {
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