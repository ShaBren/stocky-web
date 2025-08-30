import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ReactElement, ReactNode } from 'react'

// Custom render function that includes providers
export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions & {
    queryClient?: QueryClient
  } = {}
) {
  const { queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  }), ...renderOptions } = options

  function Wrapper({ children }: { children?: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Test utilities for common operations
export const testUtils = {
  // Create a test query client with disabled retry
  createTestQueryClient: () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    }),

  // Wait for loading states to resolve
  waitForLoadingToFinish: async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  },

  // Mock localStorage for tests
  mockLocalStorage: () => {
    const store: Record<string, string> = {}
    
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        Object.keys(store).forEach(key => delete store[key])
      }
    }
  },

  // Generate test IDs for consistent element selection
  getTestId: (id: string) => ({ 'data-testid': id })
}

// Re-export testing library utilities
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
