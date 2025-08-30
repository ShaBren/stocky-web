// Test data fixtures for consistent testing

export const users = {
  admin: {
    id: 1,
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin' as const,
    permissions: ['read', 'write', 'admin'] as const,
    password: 'password'
  },
  member: {
    id: 2,
    email: 'member@example.com',
    name: 'Member User',
    role: 'member' as const,
    permissions: ['read', 'write'] as const,
    password: 'password'
  },
  scanner: {
    id: 3,
    email: 'scanner@example.com',
    name: 'Scanner User',
    role: 'scanner' as const,
    permissions: ['read', 'scan'] as const,
    password: 'password'
  },
  readonly: {
    id: 4,
    email: 'readonly@example.com',
    name: 'Read Only User',
    role: 'readonly' as const,
    permissions: ['read'] as const,
    password: 'password'
  }
}

export const items = {
  basic: {
    id: 1,
    name: 'Test Item 1',
    sku: 'SKU-0001',
    description: 'A basic test item',
    category: 'Test Category',
    quantity: 50,
    unit: 'pieces',
    location: 'Storage Room 1',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  lowStock: {
    id: 2,
    name: 'Low Stock Item',
    sku: 'SKU-0002',
    description: 'An item with low stock',
    category: 'Test Category',
    quantity: 2,
    unit: 'pieces',
    location: 'Storage Room 1',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  outOfStock: {
    id: 3,
    name: 'Out of Stock Item',
    sku: 'SKU-0003',
    description: 'An item that is out of stock',
    category: 'Test Category',
    quantity: 0,
    unit: 'pieces',
    location: 'Storage Room 2',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
}

export const locations = {
  room1: {
    id: 1,
    name: 'Storage Room 1',
    description: 'Main storage room',
    type: 'room' as const,
    parent_id: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  room2: {
    id: 2,
    name: 'Storage Room 2',
    description: 'Secondary storage room',
    type: 'room' as const,
    parent_id: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  },
  shelf1: {
    id: 3,
    name: 'Shelf A1',
    description: 'Top shelf in room 1',
    type: 'storage' as const,
    parent_id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  }
}

export const alerts = {
  lowStock: {
    id: 1,
    type: 'low_stock' as const,
    title: 'Low Stock Alert',
    message: 'Item "Low Stock Item" is running low (2 remaining)',
    severity: 'warning' as const,
    item_id: 2,
    created_at: '2025-01-01T00:00:00Z',
    acknowledged: false
  },
  expiry: {
    id: 2,
    type: 'expiry' as const,
    title: 'Expiring Soon',
    message: 'Item "Test Item 1" expires in 3 days',
    severity: 'high' as const,
    item_id: 1,
    created_at: '2025-01-01T00:00:00Z',
    acknowledged: false
  }
}

export const apiResponses = {
  loginSuccess: {
    access_token: 'mock-jwt-token',
    token_type: 'bearer',
    expires_in: 3600,
    user: users.admin
  },
  loginFailure: {
    detail: 'Invalid credentials'
  },
  dashboardStats: {
    total_items: 1250,
    low_stock_items: 23,
    total_locations: 45,
    recent_activity: 156
  }
}
