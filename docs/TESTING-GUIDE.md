# Testing Guide

## Quick Start

```bash
# Install dependencies (if not already done)
npm install

# Install Playwright browsers
npm run test:setup

# Run all tests
npm run test:all

# Run specific test types
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e           # End-to-end tests only

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch

# Run tests with UI
npm run test:ui            # Vitest UI
npm run test:e2e:ui        # Playwright UI
```

## Test Architecture

### Unit Tests (`tests/unit/`)
Test individual components, functions, and utilities in isolation.

**What to test:**
- Component rendering and props
- User interactions (clicks, form submissions)
- Utility functions and business logic
- Custom hooks
- API service functions

**Example:**
```typescript
// tests/unit/components/Button.test.tsx
import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, userEvent } from '../../utils/test-utils'
import { Button } from '../../../src/components/Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    renderWithProviders(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    renderWithProviders(<Button onClick={handleClick}>Click me</Button>)
    
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Tests (`tests/integration/`)
Test how components work together and with external systems.

**What to test:**
- Page-level functionality
- Component integration
- API integration with mocked responses
- Navigation flows
- Form workflows

**Example:**
```typescript
// tests/integration/pages/DashboardPage.test.tsx
import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, waitFor } from '../../utils/test-utils'
import { DashboardPage } from '../../../src/pages/DashboardPage'

describe('Dashboard Page Integration', () => {
  it('loads and displays dashboard stats', async () => {
    renderWithProviders(<DashboardPage />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('1250')).toBeInTheDocument() // total items
      expect(screen.getByText('23')).toBeInTheDocument()   // low stock
    })
  })
})
```

### End-to-End Tests (`tests/e2e/`)
Test complete user workflows in a real browser.

**What to test:**
- Critical user journeys
- Cross-browser compatibility
- Mobile responsiveness
- Real user interactions

**Example:**
```typescript
// tests/e2e/inventory/crud.spec.ts
import { test, expect } from '@playwright/test'

test('should create, edit, and delete inventory item', async ({ page }) => {
  await page.goto('/login')
  
  // Login
  await page.fill('[placeholder="Enter your email"]', 'admin@example.com')
  await page.fill('[placeholder="Enter your password"]', 'password')
  await page.click('button[type="submit"]')
  
  // Navigate to items
  await page.click('text=Items')
  
  // Create item
  await page.click('text=Add Item')
  await page.fill('[name="name"]', 'Test Item')
  await page.fill('[name="sku"]', 'TEST-001')
  await page.click('button[type="submit"]')
  
  // Verify item was created
  await expect(page.locator('text=Test Item')).toBeVisible()
})
```

## Mock Data and API

### MSW (Mock Service Worker)
We use MSW to mock API calls consistently across tests.

**Location:** `tests/mocks/`
- `handlers.ts` - API endpoint mocks
- `server.ts` - Server setup

**Adding new mocks:**
```typescript
// tests/mocks/handlers.ts
http.get(`${API_BASE}/new-endpoint`, () => {
  return HttpResponse.json({
    data: 'mock response'
  })
})
```

### Test Fixtures
Consistent test data is available in `tests/fixtures/`.

**Usage:**
```typescript
import { users, items, locations } from '../../fixtures'

// Use in tests
const testUser = users.admin
const testItem = items.basic
```

## Coverage Requirements

### Coverage Thresholds
- **Statements:** 90%+
- **Branches:** 85%+
- **Functions:** 90%+
- **Lines:** 90%+

### Critical Path Coverage
These areas require 100% test coverage:
- Authentication flows
- Permission checks
- CRUD operations
- Error handling
- Data validation

### Generating Coverage Reports
```bash
# Run tests with coverage
npm run test:coverage

# Open HTML coverage report
open coverage/index.html
```

## Writing Good Tests

### Best Practices

1. **Test Behavior, Not Implementation**
   ```typescript
   // ❌ Bad - testing implementation details
   expect(component.state.isLoading).toBe(true)
   
   // ✅ Good - testing user-visible behavior
   expect(screen.getByText('Loading...')).toBeInTheDocument()
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // ❌ Bad
   it('should work', () => {})
   
   // ✅ Good
   it('should display error message when API call fails', () => {})
   ```

3. **Arrange, Act, Assert Pattern**
   ```typescript
   it('should update quantity when form is submitted', async () => {
     // Arrange
     const item = { id: 1, quantity: 10 }
     renderWithProviders(<EditItemForm item={item} />)
     
     // Act
     await userEvent.type(screen.getByLabelText('Quantity'), '15')
     await userEvent.click(screen.getByRole('button', { name: 'Save' }))
     
     // Assert
     expect(mockUpdateItem).toHaveBeenCalledWith(1, { quantity: 15 })
   })
   ```

4. **Test Edge Cases**
   - Empty states
   - Error conditions
   - Loading states
   - Invalid inputs
   - Permission boundaries

### Common Testing Patterns

#### Testing User Interactions
```typescript
import { userEvent } from '@testing-library/user-event'

const user = userEvent.setup()
await user.click(button)
await user.type(input, 'text')
await user.selectOptions(select, 'option1')
```

#### Testing Async Operations
```typescript
import { waitFor } from '@testing-library/react'

await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
})
```

#### Testing Error States
```typescript
// Mock API failure
server.use(
  http.get('/api/items', () => {
    return HttpResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  })
)

// Test error handling
await waitFor(() => {
  expect(screen.getByText('Error loading items')).toBeInTheDocument()
})
```

## Debugging Tests

### Vitest Debugging
```bash
# Run specific test file
npm run test -- LoginForm.test.tsx

# Run tests matching pattern
npm run test -- --grep "authentication"

# Debug mode with UI
npm run test:ui
```

### Playwright Debugging
```bash
# Debug mode
npm run test:e2e:debug

# Run in headed mode
npx playwright test --headed

# Run specific test
npx playwright test tests/e2e/auth/login.spec.ts
```

### VS Code Integration

Install these extensions for better testing experience:
- **Vitest**: Run and debug tests in VS Code
- **Playwright Test for VS Code**: E2E test runner
- **Jest Runner**: Alternative test runner

## Continuous Integration

### GitHub Actions
Tests run automatically on:
- Push to main/develop branches
- Pull requests
- Release branches

### Quality Gates
PRs cannot be merged unless:
- All tests pass
- Coverage thresholds are met
- No linting errors
- Build succeeds

### Test Reports
- Coverage reports uploaded to Codecov
- Playwright reports available as artifacts
- Test results displayed in PR checks

## Performance Testing

### Load Testing (Future)
```bash
# Install k6
npm install -g k6

# Run load tests
k6 run tests/performance/load-test.js
```

### Bundle Size Testing
```bash
# Analyze bundle size
npm run build
npx bundlesize
```

## Accessibility Testing

### Manual Testing Checklist
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators visible
- [ ] Alt text for images

### Automated A11y Testing
```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should not have accessibility violations', async () => {
  const { container } = renderWithProviders(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Troubleshooting

### Common Issues

1. **Tests failing due to timing issues**
   - Use `waitFor` for async operations
   - Avoid `sleep` or fixed timeouts
   - Use proper async/await patterns

2. **Mock not working**
   - Check MSW handler order
   - Verify API endpoint URLs match
   - Ensure server is properly set up

3. **Playwright tests flaky**
   - Use proper waiting strategies
   - Avoid brittle selectors
   - Set appropriate timeouts

4. **Coverage not accurate**
   - Check file inclusion/exclusion patterns
   - Ensure test files are importing correctly
   - Verify source maps are generated

### Getting Help

1. Check the [Testing Strategy](./TESTING-STRATEGY.md) document
2. Review existing test files for patterns
3. Ask in team chat for specific issues
4. Check tool documentation:
   - [Vitest](https://vitest.dev/)
   - [Testing Library](https://testing-library.com/)
   - [Playwright](https://playwright.dev/)
   - [MSW](https://mswjs.io/)
