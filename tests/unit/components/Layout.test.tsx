import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '../../utils/test-utils'
import { Layout } from '../../../src/components/Layout'

// Mock the useAuth hook since we don't have it implemented yet
vi.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin'
    },
    logout: vi.fn()
  })
}))

const mockOnLogout = vi.fn()

describe('Layout Component', () => {
  it('renders navigation menu', () => {
    renderWithProviders(<Layout onLogout={mockOnLogout} />)
    
    // Check for navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Inventory')).toBeInTheDocument()
    expect(screen.getByText('Items')).toBeInTheDocument()
    expect(screen.getByText('Locations')).toBeInTheDocument()
    expect(screen.getByText('Scanner')).toBeInTheDocument()
    expect(screen.getByText('Alerts')).toBeInTheDocument()
  })

  it('displays user profile section', () => {
    renderWithProviders(<Layout onLogout={mockOnLogout} />)
    
    // Check for user profile elements
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('shows StockyWeb branding', () => {
    renderWithProviders(<Layout onLogout={mockOnLogout} />)
    
    expect(screen.getByText('StockyWeb')).toBeInTheDocument()
  })
})
