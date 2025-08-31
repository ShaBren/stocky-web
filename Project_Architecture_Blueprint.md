# StockyWeb Project Architecture Blueprint

**Generated on:** August 30, 2025  
**Project Type:** React TypeScript SPA (Single Page Application)  
**Architecture Pattern:** Layered Architecture with Component-Based Design  
**Primary Framework:** React 19 + Vite + TypeScript

## 1. Architecture Detection and Analysis

### Technology Stack
- **Frontend Framework:** React 19.1.1 with TypeScript
- **Build Tool:** Vite 7.1.2 
- **State Management:** React Query (TanStack Query 5.85.5) for server state
- **Routing:** React Router DOM 7.8.2
- **Styling:** TailwindCSS 4.1.12 with Headless UI components
- **HTTP Client:** Axios 1.11.0
- **Authentication:** JWT with automatic refresh
- **Testing:** Vitest (unit/integration) + Playwright (E2E)
- **Code Quality:** ESLint 9.33.0 + TypeScript ESLint
- **Deployment:** Docker with Nginx serving static assets

### Architecture Pattern
The codebase implements a **Layered Architecture** with clear separation of concerns:

1. **Presentation Layer** - React components, pages, and UI logic
2. **Service Layer** - API service modules for external communication
3. **Domain Layer** - TypeScript types, business logic, and utilities
4. **Infrastructure Layer** - HTTP client configuration, authentication, and cross-cutting concerns

## 2. Architectural Overview

StockyWeb is a home kitchen inventory management application built as a React SPA that communicates with a REST API backend. The architecture follows modern React patterns with:

- **Component-based design** with clear separation between presentational and container components
- **Centralized state management** using React Query for server state and React hooks for local state
- **Type-safe API layer** with comprehensive TypeScript interfaces
- **Role-based access control** with permission-driven UI rendering
- **Responsive design** using TailwindCSS utility classes
- **Progressive enhancement** with proper error handling and loading states

### Guiding Principles
1. **Separation of Concerns** - Clear boundaries between UI, business logic, and data access
2. **Type Safety** - Comprehensive TypeScript coverage for all data structures and API contracts
3. **Composition over Inheritance** - React component composition patterns
4. **Single Responsibility** - Each module has a focused, well-defined purpose
5. **Dependency Inversion** - Higher-level modules don't depend on lower-level modules

## 3. Architecture Visualization

### High-Level System Overview
```
┌─────────────────────────────────────────────────────┐
│                   Browser                           │
│  ┌───────────────────────────────────────────────┐  │
│  │              StockyWeb SPA                    │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌──────────┐ │  │
│  │  │ Presentation│ │   Service   │ │   Utils  │ │  │
│  │  │    Layer    │ │    Layer    │ │  Layer   │ │  │
│  │  └─────────────┘ └─────────────┘ └──────────┘ │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
              │
              │ HTTPS/REST API
              ▼
┌─────────────────────────────────────────────────────┐
│                 Backend API                         │
│         (FastAPI - External System)                 │
└─────────────────────────────────────────────────────┘
```

### Component Interaction Diagram
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Pages    │───▶│ Components  │───▶│   Hooks     │
│             │    │             │    │             │
│ - Dashboard │    │ - Layout    │    │ - useQuery  │
│ - Login     │    │ - Modal     │    │ - useState  │
│ - Inventory │    │ - Forms     │    │ - useEffect │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Services   │    │    Types    │    │   Utils     │
│             │    │             │    │             │
│ - authAPI   │    │ - User      │    │ - permissions│
│ - itemsAPI  │    │ - Item      │    │ - errorHandling│
│ - skusAPI   │    │ - Location  │    │ - pageTitle  │
└─────────────┘    └─────────────┘    └─────────────┘
       │
       ▼
┌─────────────┐
│   lib/api   │
│             │
│ - axios     │
│ - interceptors│
│ - auth      │
└─────────────┘
```

### Data Flow Diagram
```
User Interaction → Page Component → Service API → HTTP Client → Backend
                ↗                              ↘
React Query Cache ←─── Component State ←─── API Response
                ↘                              ↗
                  UI Update ←─── Re-render ←─── State Change
```

## 4. Core Architectural Components

### 4.1 Presentation Layer (`/src/pages`, `/src/components`)

**Purpose and Responsibility:**
- Renders user interface and handles user interactions
- Manages local UI state and form validation
- Implements role-based access control at the UI level
- Provides responsive layouts and accessibility features

**Internal Structure:**
- **Pages** - Route-level components that compose the full page layout
- **Components** - Reusable UI components (Layout, Modal, Forms, ErrorDisplay)
- **Hooks** - Custom React hooks for shared component logic

**Interaction Patterns:**
- Pages consume services through React Query hooks
- Components receive data via props and communicate via callbacks
- Error boundaries handle component-level errors gracefully
- Loading states provide immediate user feedback

**Evolution Patterns:**
- New pages follow the same structure pattern as existing pages
- Components are designed for reusability across different contexts
- Custom hooks extract common patterns for reuse

### 4.2 Service Layer (`/src/services`)

**Purpose and Responsibility:**
- Provides typed interfaces to backend API endpoints
- Handles request/response transformation
- Implements service-specific error handling
- Abstracts API implementation details from components

**Internal Structure:**
- **authAPI** - Authentication and user management operations
- **itemsAPI** - Item catalog management
- **skusAPI** - Inventory/stock management
- **locationsAPI** - Storage location management
- **alertsAPI** - System notifications and alerts
- **scannerAPI** - Barcode scanning functionality

**Interaction Patterns:**
- Services return Promise-based responses with proper typing
- All services use the shared axios instance from `lib/api`
- Services handle specific API error patterns and return meaningful errors
- Pagination and filtering parameters are consistently implemented

### 4.3 Domain Layer (`/src/types`, `/src/utils`)

**Purpose and Responsibility:**
- Defines core business entities and their relationships
- Implements business logic and validation rules
- Provides utility functions for common operations
- Maintains type safety across the application

**Internal Structure:**
- **Types** - TypeScript interfaces for all data structures
- **Permission Utils** - Role-based access control logic
- **Error Handling** - Centralized error parsing and formatting
- **Page Title Management** - Consistent document title handling

**Interaction Patterns:**
- Types are imported throughout the application for type safety
- Permission utilities control access to features and UI elements
- Error handlers provide consistent user-friendly error messages
- Utilities are stateless and pure functions where possible

### 4.4 Infrastructure Layer (`/src/lib`)

**Purpose and Responsibility:**
- Configures HTTP client and request/response interceptors
- Manages authentication tokens and automatic refresh
- Handles cross-cutting concerns like error logging
- Provides configuration management

**Internal Structure:**
- **API Client** - Axios instance with interceptors
- **Authentication** - JWT token management
- **Request/Response Interceptors** - Automatic token refresh and error handling

**Interaction Patterns:**
- All API calls flow through the configured axios instance
- Automatic token refresh prevents user interruption
- Global error handling redirects to login on authentication failures
- Configuration can be environment-specific via env variables

## 5. Architectural Layers and Dependencies

### Layer Structure
```
┌─────────────────────────────────────────┐
│           Presentation Layer            │ ← Pages, Components
│  ┌─────────────────────────────────────┐ │
│  │         Service Layer              │ │ ← API Services
│  │  ┌─────────────────────────────────┐ │ │
│  │  │       Domain Layer             │ │ │ ← Types, Utils
│  │  │  ┌─────────────────────────────┐ │ │ │
│  │  │  │   Infrastructure Layer     │ │ │ │ ← HTTP Client, Auth
│  │  │  └─────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────┘ │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Dependency Rules
1. **Upper layers depend on lower layers only** - Components use services, not vice versa
2. **No circular dependencies** - Clean dependency graph maintained
3. **Interface segregation** - Services expose only what components need
4. **Dependency injection via props/hooks** - Components receive dependencies explicitly

### Abstraction Mechanisms
- **React Query** separates server state from component state
- **Custom hooks** abstract complex state management logic
- **Service interfaces** hide HTTP implementation details
- **TypeScript types** enforce contracts between layers

## 6. Data Architecture

### Domain Model Structure
```typescript
// Core Entities
User {
  id, username, email, full_name, role, is_active
}

Item {
  id, name, description, upc, default_storage_type
}

Location {
  id, name, description, storage_type
}

SKU {
  id, item_id, location_id, quantity, unit, 
  expiry_date, low_stock_threshold
}

Alert {
  id, type, title, message, sku_id, is_read, is_resolved
}
```

### Entity Relationships
- **User** creates and manages all other entities
- **Item** can exist in multiple **Locations** via **SKU** records
- **SKU** represents the junction of Item + Location + Quantity
- **Alert** references **SKU** for inventory-related notifications

### Data Access Patterns
- **Repository Pattern** implemented via API service modules
- **Query Pattern** using React Query for caching and synchronization
- **Optimistic Updates** for immediate UI feedback
- **Background Sync** for keeping data fresh

### Data Transformation
- API responses transformed to TypeScript types at service boundary
- Form data serialized before API calls
- Date strings parsed to Date objects where needed
- Pagination metadata handled consistently across endpoints

### Caching Strategies
- **React Query** provides intelligent caching with TTL
- **Query invalidation** on mutations for data consistency
- **Background refetch** on window focus and network reconnection
- **Optimistic updates** for perceived performance

## 7. Cross-Cutting Concerns Implementation

### 7.1 Authentication & Authorization

**Security Model Implementation:**
- JWT-based authentication with automatic refresh
- Role-based access control (admin, member, scanner, read_only)
- Permission-driven UI rendering and route protection

**Permission Enforcement Patterns:**
```typescript
// Component-level permission checks
{hasPermission(userRole, 'canAccessUsers') && (
  <UsersMenuItem />
)}

// Route-level protection
const navigation = getNavigationItems(currentUser?.role);
```

**Security Boundary Patterns:**
- Authentication required for all routes except login
- Automatic logout on token expiration
- Request-level token injection via axios interceptors

### 7.2 Error Handling & Resilience

**Exception Handling Patterns:**
- Global error boundaries for React component errors
- Service-level error transformation to user-friendly messages
- Validation error parsing for form feedback

**Retry and Circuit Breaker Implementations:**
- React Query automatic retry with exponential backoff
- Token refresh retry on 401 responses
- Network error detection and user feedback

**Fallback and Graceful Degradation:**
- Loading states during async operations
- Error states with retry actions
- Offline detection and messaging

### 7.3 Logging & Monitoring

**Instrumentation Patterns:**
- Console warnings for authentication issues
- Error tracking via error boundaries
- User action logging via scanner API

**Performance Monitoring:**
- React Query devtools for cache inspection
- Bundle size optimization via Vite
- Lazy loading of non-critical components

### 7.4 Validation

**Input Validation Strategies:**
- Client-side validation for immediate feedback
- Server-side validation with error parsing
- TypeScript compile-time validation

**Business Rule Validation:**
- Permission checks before UI actions
- Role-based feature availability
- Data consistency validation in forms

### 7.5 Configuration Management

**Configuration Source Patterns:**
- Environment variables via Vite's `import.meta.env`
- Build-time configuration for API endpoints
- Feature flags via environment variables

**Environment-Specific Configuration:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const ENABLE_AUTO_REFRESH = true; // Can be made configurable
```

## 8. Service Communication Patterns

### API Communication
- **RESTful HTTP** communication with backend
- **JSON** request/response format
- **Form data** for authentication endpoints
- **Bearer token** authentication

### Request/Response Flow
```typescript
Component → React Query → Service API → Axios → HTTP Request
                ↓
Component ← UI Update ← Query Cache ← Response Transform ← HTTP Response
```

### Error Handling in Communication
- **Network errors** trigger retry mechanisms
- **Authentication errors** trigger automatic token refresh
- **Validation errors** displayed to user with specific field feedback
- **Server errors** show generic error messages with retry options

### API Versioning Strategy
- Base URL includes version (`/api/v1`)
- Backward compatibility maintained in service layer
- New API versions can be introduced gradually

## 9. Technology-Specific Architectural Patterns

### React Architectural Patterns

#### Component Composition and Reuse
```typescript
// Higher-order component pattern for layout
<Layout onLogout={handleLogout}>
  <Route path="/" element={<DashboardPage />} />
  <Route path="/inventory" element={<InventoryPage />} />
</Layout>

// Compound component pattern for modals
<ProfileModal 
  isOpen={showProfileModal} 
  onClose={() => setShowProfileModal(false)} 
  user={currentUser} 
/>
```

#### State Management Architecture
- **Server State:** React Query for API data
- **Local State:** useState for component-specific state
- **Global State:** Context API for authentication state
- **Form State:** Controlled components with useState

#### Side Effect Handling Patterns
```typescript
// Data fetching with React Query
const { data: currentUser } = useQuery({
  queryKey: ['auth', 'me'],
  queryFn: () => authAPI.getCurrentUser(),
  retry: 1
});

// Authentication side effects
useEffect(() => {
  const token = localStorage.getItem('stocky_auth_token');
  if (token && !isTokenExpired(token)) {
    setAuthToken(token);
    setIsAuthenticated(true);
  }
}, []);
```

#### Routing and Navigation Approach
- **React Router DOM** for client-side routing
- **Nested routes** with shared layout
- **Protected routes** based on authentication state
- **Role-based navigation** with permission checks

#### Data Fetching and Caching Patterns
- **React Query** for server state management
- **Automatic background refetching** on focus
- **Cache invalidation** on mutations
- **Optimistic updates** for immediate feedback

#### Rendering Optimization Strategies
- **React.StrictMode** for development debugging
- **Code splitting** via dynamic imports (ready for implementation)
- **Memoization** where appropriate for expensive calculations

## 10. Implementation Patterns

### Interface Design Patterns

**Service Interface Pattern:**
```typescript
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => { ... },
  refresh: async (): Promise<LoginResponse> => { ... },
  getCurrentUser: async (): Promise<User> => { ... }
};
```

**Component Interface Pattern:**
```typescript
interface LayoutProps {
  onLogout: () => void;
}

interface LoginPageProps {
  onLogin: (token: string) => void;
}
```

### Service Implementation Patterns

**Consistent API Call Pattern:**
```typescript
export const itemsAPI = {
  getItems: async (filter: ItemFilter = {}): Promise<Item[]> => {
    const response = await api.get('/items/', { params: filter });
    return response.data;
  },
  
  createItem: async (itemData: Partial<Item>): Promise<Item> => {
    const response = await api.post('/items/', itemData);
    return response.data;
  }
};
```

**Error Handling Pattern:**
```typescript
try {
  const response = await api.get(`/items/upc/${upc}/`);
  return response.data;
} catch (error: any) {
  if (error.response?.status === 404) {
    return null; // Expected case
  }
  throw error; // Re-throw unexpected errors
}
```

### Repository Implementation Patterns

**React Query Repository Pattern:**
```typescript
// Query pattern for data fetching
const { data: items, error } = useQuery({
  queryKey: ['items', filter],
  queryFn: () => itemsAPI.getItems(filter),
  retry: 1
});

// Mutation pattern for data updates
const createItemMutation = useMutation({
  mutationFn: itemsAPI.createItem,
  onSuccess: () => {
    queryClient.invalidateQueries(['items']);
  }
});
```

### Component Implementation Patterns

**Page Component Pattern:**
```typescript
export default function DashboardPage() {
  usePageTitle('Dashboard'); // Set document title
  
  // Data fetching
  const { data: skusData, error } = useQuery({
    queryKey: ['skus'],
    queryFn: () => skusAPI.getSKUs(),
    retry: 1
  });
  
  // Render with loading and error states
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <div className="space-y-6">
      {/* Page content */}
    </div>
  );
}
```

**Permission-Controlled Rendering:**
```typescript
{hasPermission(userRole, 'canAccessUsers') && (
  <NavLink to="/users">Users</NavLink>
)}
```

### Domain Model Implementation

**Type-Safe Entity Definitions:**
```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'member' | 'scanner' | 'read_only';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

**Enum-like Constants:**
```typescript
export const StorageType = {
  PANTRY: 'pantry',
  REFRIGERATOR: 'refrigerator',
  FREEZER: 'freezer'
} as const;

export type StorageType = typeof StorageType[keyof typeof StorageType];
```

## 11. Testing Architecture

### Testing Strategy Alignment
The testing approach follows the architectural layers:

1. **Unit Tests** - Test individual components and utilities in isolation
2. **Integration Tests** - Test service layer interactions with mocked APIs
3. **End-to-End Tests** - Test complete user workflows across the application

### Test Boundary Patterns
- **Component Tests** mock service dependencies
- **Service Tests** mock HTTP client responses
- **Integration Tests** use MSW for API mocking
- **E2E Tests** run against real or staging backend

### Test Data Strategies
- **Mock data** defined in test utilities
- **Fixtures** for consistent test data
- **Factory functions** for generating test entities
- **MSW handlers** for API response mocking

### Testing Tools Integration
- **Vitest** for unit and integration tests with React Testing Library
- **Playwright** for E2E testing with real browser automation
- **MSW** for API mocking in tests
- **Coverage reports** with configurable thresholds (90% statements/functions)

## 12. Deployment Architecture

### Deployment Topology
```
┌─────────────────┐    ┌─────────────────┐
│   Development   │    │   Production    │
│                 │    │                 │
│  Vite Dev Server│    │  Nginx + Docker │
│  localhost:5173 │    │  Port 80/443    │
└─────────────────┘    └─────────────────┘
```

### Build Pipeline
1. **Development:** `npm run dev` → Vite dev server with HMR
2. **Build:** `npm run build` → TypeScript compilation + Vite bundling
3. **Docker:** Multi-stage build with Node.js build + Nginx runtime
4. **Production:** Static assets served by Nginx with compression

### Environment Configuration
- **Development:** Environment variables via `.env` files
- **Production:** Environment variables passed to Docker container
- **API Endpoint:** Configurable via `VITE_API_BASE_URL`

### Containerization Strategy
```dockerfile
# Multi-stage build
FROM node:20-alpine as build  # Build stage
FROM nginx:alpine             # Runtime stage
```

### Health Checks
- **Application:** Nginx health endpoint
- **Docker:** Container health checks with retry logic
- **API Integration:** Health API endpoint monitoring

## 13. Extension and Evolution Patterns

### Feature Addition Patterns

**Adding New Pages:**
1. Create page component in `/src/pages/`
2. Add route to `App.tsx` routing configuration
3. Add navigation item to `permissions.ts` if needed
4. Implement required API services if new endpoints needed

**Adding New API Endpoints:**
1. Define TypeScript types in `/src/types/api.ts`
2. Implement service functions in appropriate `/src/services/` module
3. Add React Query integration in components
4. Update error handling patterns if needed

### Modification Patterns

**Extending Authentication:**
- Add new permission types to `ROLE_PERMISSIONS`
- Update role-based navigation in `getNavigationItems()`
- Implement permission checks in new components

**Adding New User Roles:**
```typescript
// 1. Update type definition
export type UserRole = 'admin' | 'member' | 'scanner' | 'read_only' | 'new_role';

// 2. Add role permissions
export const ROLE_PERMISSIONS = {
  // ... existing roles
  new_role: {
    canAccessDashboard: true,
    // ... define permissions
  }
};
```

### Integration Patterns

**External System Integration:**
1. Define new service module in `/src/services/`
2. Add TypeScript types for external API
3. Implement error handling for external service patterns
4. Add authentication if required

**Third-Party Component Integration:**
1. Install dependency via npm
2. Create wrapper component if needed for consistent styling
3. Add TypeScript declarations if needed
4. Update testing mocks if component affects tests

## 14. Architectural Pattern Examples

### Layer Separation Examples

**Service Layer Abstraction:**
```typescript
// Service abstracts HTTP details from components
export const usersAPI = {
  getUsers: async (page = 1, size = 20): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users/', { params: { page, size } });
    return response.data; // Transform to expected format
  }
};

// Component uses service without knowing HTTP details
const { data: usersData } = useQuery({
  queryKey: ['users', page],
  queryFn: () => usersAPI.getUsers(page)
});
```

**Permission-Based UI Rendering:**
```typescript
// Domain layer defines permission logic
export function hasPermission(userRole: UserRole | undefined, permission: string): boolean {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole][permission] || false;
}

// Presentation layer uses domain logic
{hasPermission(userRole, 'canCreate') && (
  <button onClick={handleCreate}>Create Item</button>
)}
```

### Component Communication Examples

**Parent-Child Communication:**
```typescript
// Parent manages state and passes handlers
function InventoryPage() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  return (
    <ItemList 
      items={items} 
      onItemSelect={setSelectedItem}
    />
  );
}

// Child receives props and calls handlers
function ItemList({ items, onItemSelect }: ItemListProps) {
  return items.map(item => (
    <ItemCard 
      key={item.id} 
      item={item} 
      onClick={() => onItemSelect(item)} 
    />
  ));
}
```

**React Query for Server State:**
```typescript
// Query for fetching data
const { data: items, error, isLoading } = useQuery({
  queryKey: ['items'],
  queryFn: () => itemsAPI.getItems()
});

// Mutation for updating data
const updateItemMutation = useMutation({
  mutationFn: ({ id, data }: { id: number, data: Partial<Item> }) => 
    itemsAPI.updateItem(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries(['items']);
  }
});
```

### Extension Point Examples

**Role-Based Feature Extension:**
```typescript
// Adding new navigation items
export function getNavigationItems(userRole: UserRole | undefined) {
  const baseItems = [
    // ... existing items
    {
      name: 'Reports', // New feature
      href: '/reports',
      icon: 'ChartBarIcon',
      show: hasPermission(userRole, 'canAccessReports'), // New permission
    }
  ];
  
  return baseItems.filter(item => item.show);
}
```

**Service Extension Pattern:**
```typescript
// Adding new API service
export const reportsAPI = {
  getReports: async (filter: ReportFilter): Promise<Report[]> => {
    const response = await api.get('/reports/', { params: filter });
    return response.data;
  },
  
  generateReport: async (config: ReportConfig): Promise<Report> => {
    const response = await api.post('/reports/', config);
    return response.data;
  }
};
```

## 15. Architectural Decision Records

### Architecture Style Decision: React SPA with Layered Architecture

**Context:** Need to build a responsive web application for inventory management that works across devices and provides real-time data updates.

**Decision:** Chose React SPA with layered architecture over server-rendered alternatives.

**Factors Considered:**
- Need for real-time updates (React Query)
- Mobile-responsive requirements (TailwindCSS)
- Type safety requirements (TypeScript)
- Development velocity (Vite hot reload)

**Consequences:**
- **Positive:** Fast development, excellent UX, strong typing, great tooling
- **Negative:** Requires JavaScript enabled, initial bundle size, SEO limitations
- **Future Flexibility:** Can add SSR later if needed

### Technology Selection Decision: React Query for State Management

**Context:** Need to manage server state efficiently with caching, background updates, and error handling.

**Decision:** Chose React Query over Redux or Context API for server state management.

**Factors Considered:**
- Automatic caching and background refetching
- Built-in loading and error states
- Optimistic updates support
- Reduced boilerplate compared to Redux

**Consequences:**
- **Positive:** Less boilerplate, better UX, automatic caching
- **Negative:** Additional dependency, learning curve
- **Future Limitations:** Less control over cache invalidation strategies

### Authentication Approach Decision: JWT with Automatic Refresh

**Context:** Need secure authentication with good user experience and minimal backend complexity.

**Decision:** Implemented JWT with automatic refresh tokens and axios interceptors.

**Implementation Approach:**
- Automatic token refresh before expiration
- Request/response interceptors for token management
- Graceful fallback when refresh not supported

**Consequences:**
- **Positive:** Seamless user experience, stateless backend
- **Negative:** Token management complexity, potential security considerations
- **Future Flexibility:** Can add additional security layers (2FA, etc.)

### Styling Decision: TailwindCSS with Headless UI

**Context:** Need consistent, responsive design system with minimal custom CSS.

**Decision:** Chose TailwindCSS utility classes with Headless UI components.

**Factors Considered:**
- Rapid development with utility classes
- Consistent design system
- Responsive design requirements
- Accessibility features in Headless UI

**Consequences:**
- **Positive:** Fast development, consistent styling, good accessibility
- **Negative:** Large HTML class lists, learning curve
- **Future Flexibility:** Can migrate to component libraries later

## 16. Architecture Governance

### Architectural Consistency Maintenance
- **TypeScript** enforces interface contracts between layers
- **ESLint rules** enforce code style and patterns
- **Import organization** maintained through linting rules
- **Component patterns** established through existing examples

### Automated Architectural Compliance
- **TypeScript compilation** catches interface violations
- **ESLint checks** enforce import patterns and code quality
- **Test coverage thresholds** ensure adequate testing
- **Build process** validates all dependencies and types

### Code Review Processes
- **Layer separation** verified in pull request reviews
- **Component reusability** encouraged in review feedback
- **API service patterns** checked for consistency
- **Permission implementation** verified for security

### Documentation Practices
- **TypeScript interfaces** serve as living documentation
- **Component props** documented through TypeScript
- **API service functions** have consistent signatures
- **Utility functions** include JSDoc comments where complex

## 17. Blueprint for New Development

### Development Workflow

**Starting Points for Different Feature Types:**

1. **New Page Feature:**
   ```
   1. Create component in /src/pages/
   2. Add route to App.tsx
   3. Update navigation permissions if needed
   4. Add required API services
   5. Write unit tests
   6. Add E2E test scenarios
   ```

2. **New API Integration:**
   ```
   1. Define types in /src/types/api.ts
   2. Create service module in /src/services/
   3. Add React Query integration
   4. Implement error handling
   5. Add service tests with MSW mocks
   ```

3. **New Reusable Component:**
   ```
   1. Create component in /src/components/
   2. Define clear prop interfaces
   3. Include loading and error states
   4. Add unit tests with React Testing Library
   5. Document usage examples
   ```

### Implementation Templates

**Page Component Template:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { usePageTitle } from '../utils/usePageTitle';
import { ErrorDisplay } from '../components/ErrorDisplay';

export default function NewPage() {
  usePageTitle('New Page');
  
  const { data, error, isLoading } = useQuery({
    queryKey: ['new-data'],
    queryFn: () => newAPI.getData(),
    retry: 1
  });
  
  if (error) return <ErrorDisplay error={error} />;
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="space-y-6">
      {/* Page content */}
    </div>
  );
}
```

**API Service Template:**
```typescript
export const newAPI = {
  getData: async (filter: NewFilter = {}): Promise<NewEntity[]> => {
    const response = await api.get('/new-endpoint/', { params: filter });
    return response.data;
  },
  
  createEntity: async (data: Partial<NewEntity>): Promise<NewEntity> => {
    const response = await api.post('/new-endpoint/', data);
    return response.data;
  },
  
  updateEntity: async (id: number, data: Partial<NewEntity>): Promise<NewEntity> => {
    const response = await api.put(`/new-endpoint/${id}/`, data);
    return response.data;
  }
};
```

**Component with Permissions Template:**
```typescript
import { hasPermission } from '../utils/permissions';
import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../services/api';

interface NewComponentProps {
  data: SomeType[];
  onAction?: (item: SomeType) => void;
}

export function NewComponent({ data, onAction }: NewComponentProps) {
  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authAPI.getCurrentUser()
  });
  
  const canPerformAction = hasPermission(currentUser?.role, 'canSomeAction');
  
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>
          {/* Content */}
          {canPerformAction && onAction && (
            <button onClick={() => onAction(item)}>
              Action
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Common Pitfalls to Avoid

**Architecture Violations:**
- ❌ Components directly importing axios instead of using services
- ❌ Services returning axios responses instead of typed data
- ❌ Business logic in components instead of utilities
- ❌ Hardcoded permissions instead of using permission utilities

**Performance Considerations:**
- ❌ Not memoizing expensive calculations
- ❌ Creating new objects in render functions
- ❌ Not using React Query's caching effectively
- ❌ Fetching data in every component instead of sharing

**Testing Blind Spots:**
- ❌ Not testing permission-based rendering
- ❌ Not testing error states and loading states
- ❌ Not mocking API calls properly in tests
- ❌ Not testing form validation and submission

**Security Considerations:**
- ❌ Not validating permissions on sensitive actions
- ❌ Storing sensitive data in local storage
- ❌ Not handling token expiration properly
- ❌ Exposing internal APIs or data structures

### Recommended Practices

1. **Always use TypeScript** - Don't use `any` types unless absolutely necessary
2. **Follow the service pattern** - All API calls go through service modules
3. **Implement proper error handling** - Use ErrorDisplay component and proper error boundaries
4. **Use React Query consistently** - For all server state management
5. **Test permission-based features** - Ensure proper access control
6. **Follow the existing component patterns** - Use established patterns for consistency
7. **Keep components focused** - Single responsibility principle
8. **Use proper loading states** - Always provide user feedback during async operations

---

**Blueprint Generation Info:**
- **Generated:** August 30, 2025
- **Codebase Version:** Current state as of generation date
- **Recommended Update Frequency:** Quarterly or after major architectural changes
- **Maintainer:** Development team should update this document when architectural patterns evolve

This blueprint should be updated whenever significant architectural changes are made to ensure it remains an accurate guide for development.
