import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, waitFor } from '../../utils/test-utils'
import { Layout } from '../../../src/components/Layout'

// Mock the auth API
vi.mock('../../../src/services/api', () => ({
  authAPI: {
    getCurrentUser: vi.fn().mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      role: 'ADMIN',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    })
  }
}))

// Mock the permissions utils
vi.mock('../../../src/utils/permissions', () => ({
  getNavigationItems: vi.fn().mockReturnValue([
    { name: 'Dashboard', href: '/dashboard', icon: 'HomeIcon' },
    { name: 'Inventory', href: '/inventory', icon: 'ArchiveBoxIcon' },
    { name: 'Items', href: '/items', icon: 'CubeIcon' },
    { name: 'Locations', href: '/locations', icon: 'MapPinIcon' },
    { name: 'Scanner', href: '/scanner', icon: 'QrCodeIcon' },
    { name: 'Alerts', href: '/alerts', icon: 'BellIcon' },
    { name: 'Users', href: '/users', icon: 'UsersIcon' }
  ]),
  getRoleName: vi.fn().mockReturnValue('Administrator'),
  getRoleBadgeColor: vi.fn().mockReturnValue('bg-purple-100 text-purple-800')
}))

const mockOnLogout = vi.fn()

describe('Layout Component', () => {
  it('renders navigation menu', async () => {
    renderWithProviders(<Layout onLogout={mockOnLogout} />)
    
    // Wait for the navigation to load
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
    
    // Check for all navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    expect(screen.getByText('Items')).toBeInTheDocument()
    expect(screen.getByText('Locations')).toBeInTheDocument()
    expect(screen.getByText('Scanner')).toBeInTheDocument()
    expect(screen.getByText('Alerts')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('displays user profile section', async () => {
    renderWithProviders(<Layout onLogout={mockOnLogout} />)
    
    // Wait for user data to load
    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })
    
    // Check for user profile elements
    expect(screen.getByText('testuser')).toBeInTheDocument()
    expect(screen.getByText('@testuser')).toBeInTheDocument()
    expect(screen.getByText('Administrator')).toBeInTheDocument()
  })

  it('shows StockyWeb branding', () => {
    renderWithProviders(<Layout onLogout={mockOnLogout} />)
    
    expect(screen.getByText('StockyWeb')).toBeInTheDocument()
  })

  it('shows logout button', () => {
    renderWithProviders(<Layout onLogout={mockOnLogout} />)
    
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })
})
