import { http, HttpResponse } from 'msw'

// Mock API base URL - should match your actual API
const API_BASE = 'http://localhost:8000/api/v1'

export const handlers = [
  // Authentication endpoints
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    
    // Mock successful login
    if (body.email === 'admin@example.com' && body.password === 'password') {
      return HttpResponse.json({
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: 1,
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          permissions: ['read', 'write', 'admin']
        }
      })
    }
    
    // Mock login failure
    return HttpResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' })
  }),

  http.get(`${API_BASE}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json({
      id: 1,
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      permissions: ['read', 'write', 'admin']
    })
  }),

  // Dashboard endpoints
  http.get(`${API_BASE}/dashboard/stats`, () => {
    return HttpResponse.json({
      total_items: 1250,
      low_stock_items: 23,
      total_locations: 45,
      recent_activity: 156
    })
  }),

  // Items endpoints
  http.get(`${API_BASE}/items`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 10
    
    return HttpResponse.json({
      items: Array.from({ length: limit }, (_, i) => ({
        id: (page - 1) * limit + i + 1,
        name: `Test Item ${(page - 1) * limit + i + 1}`,
        sku: `SKU-${String((page - 1) * limit + i + 1).padStart(4, '0')}`,
        description: `Description for item ${(page - 1) * limit + i + 1}`,
        category: 'Test Category',
        quantity: Math.floor(Math.random() * 100),
        unit: 'pieces',
        location: `Location ${Math.floor(Math.random() * 10) + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })),
      total: 1250,
      page,
      limit,
      pages: Math.ceil(1250 / limit)
    })
  }),

  http.get(`${API_BASE}/items/:id`, ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      id: Number(id),
      name: `Test Item ${id}`,
      sku: `SKU-${String(id).padStart(4, '0')}`,
      description: `Description for item ${id}`,
      category: 'Test Category',
      quantity: Math.floor(Math.random() * 100),
      unit: 'pieces',
      location: `Location ${Math.floor(Math.random() * 10) + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }),

  // Locations endpoints
  http.get(`${API_BASE}/locations`, () => {
    return HttpResponse.json({
      locations: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Location ${i + 1}`,
        description: `Description for location ${i + 1}`,
        type: i % 2 === 0 ? 'room' : 'storage',
        parent_id: i > 5 ? Math.floor(Math.random() * 5) + 1 : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })),
      total: 10
    })
  }),

  // Users endpoints (admin only)
  http.get(`${API_BASE}/users`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json({
      users: [
        {
          id: 1,
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          email: 'user@example.com',
          name: 'Regular User',
          role: 'member',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ],
      total: 2
    })
  }),

  // Alerts endpoints
  http.get(`${API_BASE}/alerts`, () => {
    return HttpResponse.json({
      alerts: [
        {
          id: 1,
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: 'Item "Test Item 1" is running low (5 remaining)',
          severity: 'warning',
          item_id: 1,
          created_at: new Date().toISOString(),
          acknowledged: false
        },
        {
          id: 2,
          type: 'expiry',
          title: 'Expiring Soon',
          message: 'Item "Test Item 2" expires in 3 days',
          severity: 'high',
          item_id: 2,
          created_at: new Date().toISOString(),
          acknowledged: false
        }
      ],
      total: 2
    })
  }),

  // Catch-all for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`)
    return HttpResponse.json(
      { detail: 'Not Found' },
      { status: 404 }
    )
  })
]
