# Shopping Lists Frontend Design Document

**Created:** September 27, 2025  
**Status:** Design Phase - Awaiting Review  
**Author:** AI Assistant  

---

## Table of Contents

1. [Overview](#overview)
2. [Requirements Analysis](#requirements-analysis)
3. [Component Architecture](#component-architecture)
4. [API Integration Design](#api-integration-design)
5. [User Interface Design](#user-interface-design)
6. [State Management](#state-management)
7. [Navigation & Routing]3. **Item Rows**
   - Checkbox for completion (soft delete when checked)
   - Item name and details
   - Quantity controls with +/- buttons
   - Remove button
   - UPC display for reference
   - Completed items move to bottom, sorted by completion timegation--routing)
8. [Security & Permissions](#security--permissions)
9. [Implementation Plan](#implementation-plan)
10. [Testing Strategy](#testing-strategy)

---

## Overview

This document outlines the design for implementing the Shopping Lists feature in Stocky Web, a React TypeScript frontend. The feature will provide a complete interface for managing shopping lists with full CRUD operations, collaborative editing, and audit logging visualization.

### Key Features
- **List Management**: Create, view, edit, delete shopping lists
- **Visibility Control**: Toggle between public and private lists
- **Item Management**: Add/remove items with quantities from inventory
- **Collaborative Editing**: Multiple users can edit public lists
- **List Duplication**: Clone existing lists with customization
- **Change History**: View complete audit logs for lists
- **Search & Filter**: Find lists and items efficiently
- **Responsive Design**: Mobile-friendly interface

---

## Requirements Analysis

### Functional Requirements

1. **List Operations**
   - ✅ View all accessible shopping lists (public + user's private)
   - ✅ Create new shopping lists with name and visibility settings
   - ✅ Edit shopping list metadata (name, visibility)
   - ✅ Delete shopping lists with confirmation
   - ✅ Duplicate existing lists with custom names

2. **Item Management**
   - ✅ Add items from inventory to shopping lists
   - ✅ Update item quantities in lists
   - ✅ Remove items from lists
   - ✅ Search inventory when adding items
   - ✅ Display item details (name, UPC, description)

3. **Collaboration & Access**
   - ✅ View public lists from all users
   - ✅ Edit public lists (collaborative editing)
   - ✅ Manage own private lists exclusively
   - ✅ Clear indication of list ownership and visibility

4. **History & Auditing**
   - ✅ View complete change history for lists
   - ✅ Display user attribution for all changes
   - ✅ Show timestamps and action details
   - ✅ Filter logs by action type

5. **User Experience**
   - ✅ Responsive design for mobile and desktop
   - ✅ Loading states and error handling
   - ✅ Search and filtering capabilities
   - ✅ Keyboard navigation support
   - ✅ Confirmation dialogs for destructive actions

### Non-Functional Requirements

1. **Performance**
   - List loading under 500ms
   - Smooth animations and transitions
   - Efficient re-rendering with React Query

2. **Usability**
   - Intuitive interface following existing design patterns
   - Clear visual hierarchy and information architecture
   - Consistent with existing Stocky Web components

3. **Accessibility**
   - WCAG 2.1 AA compliance
   - Screen reader compatible
   - Keyboard navigation support

---

## Component Architecture

### Component Hierarchy

```
ShoppingListsPage
├── ShoppingListsHeader
│   ├── CreateListButton
│   └── SearchFilter
├── ShoppingListGrid
│   └── ShoppingListCard[]
│       ├── ListHeader
│       ├── ItemSummary
│       └── ListActions
└── Modals
    ├── CreateListModal
    ├── EditListModal
    ├── DeleteConfirmModal
    └── DuplicateListModal

ShoppingListDetailPage
├── ListDetailHeader
│   ├── ListMetadata
│   └── ListActions
├── ItemsSection
│   ├── AddItemButton
│   └── ShoppingListItem[]
│       ├── ItemInfo
│       ├── QuantityControl
│       └── RemoveButton
├── HistorySection
│   └── LogEntry[]
└── Modals
    ├── AddItemModal
    └── EditListModal
```

### Core Components

#### 1. ShoppingListsPage
```typescript
interface ShoppingListsPageProps {}

// Main page component with list overview
// - Displays all accessible shopping lists
// - Handles search/filter functionality
// - Provides create/duplicate actions
```

#### 2. ShoppingListDetailPage
```typescript
interface ShoppingListDetailPageProps {
  listId: string;
}

// Detailed view of a single shopping list
// - Shows all list items with quantities
// - Provides item management (add/edit/remove)
// - Displays change history logs
// - Handles collaborative editing
```

#### 3. ShoppingListCard
```typescript
interface ShoppingListCardProps {
  list: ShoppingListSummary;
  onEdit: (list: ShoppingListSummary) => void;
  onDelete: (listId: number) => void;
  onDuplicate: (list: ShoppingListSummary) => void;
}

// Individual list card in the grid view
// - Shows list metadata and item count
// - Provides quick actions (edit/delete/duplicate)
// - Indicates visibility and ownership
```

#### 4. ShoppingListItem
```typescript
interface ShoppingListItemProps {
  item: ShoppingListItemResponse;
  canEdit: boolean;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onComplete: (itemId: number) => void; // Soft delete via checkbox
  onRemove: (itemId: number) => void;
}

// Individual item within a shopping list  
// - Displays item information and quantity
// - Provides completion checkbox (soft delete)
// - Provides quantity controls
// - Shows remove option if editable
// - Items sorted by created_at, completed items at bottom
```

#### 5. AddItemModal
```typescript
interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (itemId: number, quantity: number) => void;
  existingItemIds: number[];  // To prevent duplicates
}

// Modal for adding items to shopping list
// - Searchable item selector from inventory
// - Quantity input
// - Prevents adding duplicate items
```

---

## API Integration Design

### API Service Structure

```typescript
// src/services/shoppingListsAPI.ts
export const shoppingListsAPI = {
  // List operations
  getLists: async (params?: { skip?: number; limit?: number }) => Promise<PaginatedResponse<ShoppingListSummary>>,
  getList: async (listId: number) => Promise<ShoppingListResponse>,
  createList: async (data: ShoppingListCreate) => Promise<ShoppingListResponse>,
  updateList: async (listId: number, data: ShoppingListUpdate) => Promise<ShoppingListResponse>,
  deleteList: async (listId: number) => Promise<void>,
  duplicateList: async (listId: number, data: ShoppingListDuplicate) => Promise<ShoppingListResponse>,
  
  // Item operations
  addItem: async (listId: number, data: ShoppingListItemCreate) => Promise<ShoppingListItemResponse>,
  updateItem: async (listId: number, itemId: number, data: ShoppingListItemUpdate) => Promise<ShoppingListItemResponse>,
  removeItem: async (listId: number, itemId: number) => Promise<void>,
  
  // Logs
  getLogs: async (listId: number, params?: { skip?: number; limit?: number; action_type?: string }) => Promise<PaginatedResponse<ShoppingListLogResponse>>
};
```

### TypeScript Interfaces

```typescript
// src/types/shoppingLists.ts

export interface ShoppingListSummary {
  id: number;
  name: string;
  is_public: boolean;
  creator: User;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListResponse extends Omit<ShoppingListSummary, 'item_count'> {
  items: ShoppingListItemResponse[];
}

export interface ShoppingListItemResponse {
  id: number;
  item: Item;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListCreate {
  name: string;
  is_public: boolean;
}

export interface ShoppingListUpdate {
  name?: string;
  is_public?: boolean;
}

export interface ShoppingListDuplicate {
  name: string;
  is_public: boolean;
}

export interface ShoppingListItemCreate {
  item_id: number;
  quantity: number;
}

export interface ShoppingListItemUpdate {
  quantity: number;
}

export interface ShoppingListLogResponse {
  id: number;
  action_type: string;
  user: User;
  details?: Record<string, any>;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
```

### React Query Hooks

```typescript
// src/hooks/useShoppingLists.ts

export function useShoppingLists(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: ['shopping-lists', params],
    queryFn: () => shoppingListsAPI.getLists(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10 * 1000, // Poll every 10 seconds
  });
}

export function useShoppingList(listId: number) {
  return useQuery({
    queryKey: ['shopping-lists', listId],
    queryFn: () => shoppingListsAPI.getList(listId),
    enabled: !!listId,
    refetchInterval: 10 * 1000, // Poll every 10 seconds for collaborative editing
  });
}

export function useCreateShoppingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: shoppingListsAPI.createList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useUpdateShoppingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, data }: { listId: number; data: ShoppingListUpdate }) => 
      shoppingListsAPI.updateList(listId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(['shopping-lists', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useDeleteShoppingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: shoppingListsAPI.deleteList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useAddShoppingListItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, data }: { listId: number; data: ShoppingListItemCreate }) =>
      shoppingListsAPI.addItem(listId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists', variables.listId] });
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

// Similar patterns for updateItem, removeItem, duplicateList, etc.
```

---

## User Interface Design

### Design System Integration

The Shopping Lists feature will follow the existing Stocky Web design patterns:

1. **Color Scheme**: Use existing blue primary colors and gray neutrals
2. **Typography**: Follow existing heading and body text styles
3. **Components**: Extend existing button, modal, and form components
4. **Icons**: Use Heroicons consistent with the rest of the application
5. **Spacing**: Follow existing Tailwind spacing scale

### Page Layouts

#### 1. Shopping Lists Overview Page (`/shopping-lists`)

```
┌─────────────────────────────────────────────────────────────┐
│ Shopping Lists                                    [+ Create] │
├─────────────────────────────────────────────────────────────┤
│ [Search lists...] [Filter: All ▼] [Sort: Recent ▼]         │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ Weekly Shop  │ │ Holiday Meal │ │ Emergency Kit│        │
│ │ 🔓 Public    │ │ 🔒 Private   │ │ 🔓 Public    │        │
│ │ 12 items     │ │ 8 items      │ │ 15 items     │        │
│ │ by: john_doe │ │ by: You      │ │ by: admin    │        │
│ │ [Edit][Dup]  │ │ [Edit][Del]  │ │ [Edit][Dup]  │        │
│ └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Shopping List Detail Page (`/shopping-lists/:id`)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Lists                                             │
├─────────────────────────────────────────────────────────────┤
│ Weekly Groceries 🔓                    [Edit] [Duplicate]   │
│ Created by john_doe • 12 items • Updated 2 hours ago       │
├─────────────────────────────────────────────────────────────┤
│ Items                                          [+ Add Item] │
├─────────────────────────────────────────────────────────────┤
│ ☐ Whole Milk                    [- 2 +] Remove              │
│   UPC: 123456789012                                         │
│ ☐ Bananas                       [- 5 +] Remove              │
│   UPC: 987654321098                                         │
├─────────────────────────────────────────────────────────────┤
│ History                                                     │
├─────────────────────────────────────────────────────────────┤
│ • jane_doe added Bananas (qty: 5) - 1 hour ago             │
│ • john_doe updated Milk quantity 1→2 - 2 hours ago         │
│ • john_doe created list - 1 day ago                        │
└─────────────────────────────────────────────────────────────┘
```

### Modal Designs

#### Create/Edit List Modal
```
┌─────────────────────────────────────┐
│ Create Shopping List            [×] │
├─────────────────────────────────────┤
│ List Name                           │
│ [________________________]          │
│                                     │
│ Visibility                          │
│ ○ Private (only you can see/edit)   │
│ ○ Public (everyone can see/edit)    │
│                                     │
│                    [Cancel] [Create]│
└─────────────────────────────────────┘
```

#### Add Item Modal
```
┌─────────────────────────────────────┐
│ Add Item to List                [×] │
├─────────────────────────────────────┤
│ Search Items                        │
│ [Search inventory...____________]    │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ☐ Whole Milk                    │ │
│ │   UPC: 123456789012             │ │
│ │ ☐ Bananas                       │ │
│ │   UPC: 987654321098             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Quantity                            │
│ [2                              ]   │
│                                     │
│                    [Cancel] [Add]   │
└─────────────────────────────────────┘
```

### Visual Design Elements

1. **List Cards**
   - Rounded corners with subtle shadows
   - Visibility indicator (lock icon for private, unlock for public)
   - Creator attribution
   - Item count badge
   - Action buttons (edit, delete, duplicate)

2. **Item Rows**
   - Checkbox for completion tracking (visual only)
   - Item name and details
   - Quantity controls with +/- buttons
   - Remove button
   - UPC display for reference

3. **History Timeline**
   - Chronological list of changes
   - User avatars/names
   - Action descriptions with details
   - Relative timestamps

4. **Interactive Elements**
   - Hover states for all clickable elements
   - Loading spinners for async operations
   - Success/error toast notifications
   - Confirmation dialogs for destructive actions

---

## State Management

### React Query State

The application will use React Query for server state management:

1. **List Queries**: Cache shopping lists with automatic background refetching
2. **Optimistic Updates**: Immediate UI updates with rollback on failure
3. **Cache Invalidation**: Smart invalidation when lists or items change
4. **Background Sync**: Keep data fresh with stale-while-revalidate pattern

### Local State Management

1. **Modal State**: Simple useState for modal open/close states
2. **Form State**: React Hook Form for form validation and submission
3. **Search/Filter State**: URL search params for shareable filter states
4. **UI State**: Loading states, error states, selection states

### State Architecture

```typescript
// Global state (React Query)
- shopping-lists: ShoppingListSummary[]
- shopping-lists/[id]: ShoppingListResponse
- shopping-lists/[id]/logs: ShoppingListLogResponse[]
- items: Item[] (for item search in Add Item modal)

// Local state per component
- Modal visibility: boolean
- Form data: ShoppingListCreate | ShoppingListUpdate
- Search queries: string
- Selected filters: { visibility: 'all' | 'public' | 'private' }
- Loading states: boolean per operation
```

---

## Navigation & Routing

### Route Structure

```typescript
// src/App.tsx route additions
<Route path="/shopping-lists" element={<ShoppingListsPage />} />
<Route path="/shopping-lists/:id" element={<ShoppingListDetailPage />} />
```

### Navigation Integration

1. **Main Navigation**: Add "Shopping Lists" to the sidebar navigation
2. **Breadcrumbs**: Show navigation path in detail view
3. **URL State**: Preserve search/filter state in URL parameters
4. **Back Navigation**: Proper browser back button support

### Permission Integration

```typescript
// src/utils/permissions.ts additions
export const ROLE_PERMISSIONS = {
  ADMIN: {
    // ... existing permissions
    canAccessShoppingLists: true,
    canCreateShoppingLists: true,
    canEditAnyShoppingList: true,
    canDeleteAnyShoppingList: true,
  },
  MEMBER: {
    // ... existing permissions
    canAccessShoppingLists: true,
    canCreateShoppingLists: true,
    canEditAnyShoppingList: false,  // Only public lists and own private
    canDeleteAnyShoppingList: false, // Only own lists
  },
};

// Navigation item addition
if (hasPermission(userRole, 'canAccessShoppingLists')) {
  items.push({ 
    name: 'Shopping Lists', 
    href: '/shopping-lists', 
    icon: 'ListBulletIcon' 
  });
}
```

---

## Security & Permissions

### Access Control Rules

1. **List Visibility**
   - Users can view all public lists
   - Users can view their own private lists only
   - List creator shown for all lists

2. **List Editing**
   - Public lists: Any authenticated user can edit
   - Private lists: Only the creator can edit
   - Clear visual indicators for edit permissions

3. **List Deletion**
   - Users can only delete their own lists
   - Confirmation dialog required
   - Admin users can delete any list

4. **Item Management**
   - Can add items only if can edit the list
   - Can modify/remove items only if can edit the list
   - Items must exist in inventory (validated by backend)

### Frontend Validation

```typescript
// Permission checking utilities
export function canEditList(list: ShoppingListSummary, currentUser: User): boolean {
  if (!currentUser) return false;
  if (list.creator.id === currentUser.id) return true; // Own list
  return list.is_public; // Public list
}

export function canDeleteList(list: ShoppingListSummary, currentUser: User): boolean {
  if (!currentUser) return false;
  if (hasPermission(currentUser.role, 'canDeleteAnyShoppingList')) return true; // Admin
  return list.creator.id === currentUser.id; // Own list
}

export function canViewList(list: ShoppingListSummary, currentUser: User): boolean {
  if (!currentUser) return false;
  if (list.is_public) return true; // Public list
  return list.creator.id === currentUser.id; // Own private list
}
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
1. **API Integration**
   - Add shopping lists API service
   - Create TypeScript interfaces
   - Set up React Query hooks

2. **Basic Components**
   - Create basic page components
   - Set up routing
   - Add navigation menu item

3. **Permission System**
   - Extend permissions utilities
   - Add permission checks to navigation

### Phase 2: Core Functionality (Week 2)
1. **List Management**
   - Implement lists overview page
   - Create/edit/delete list functionality
   - List visibility controls

2. **Item Management**
   - Add items to lists
   - Update item quantities
   - Complete items (soft delete via checkbox)
   - Remove items from lists

3. **Search & Filtering**
   - Global search: list names + lists containing specific items
   - Within-list search for items
   - Client-side filtering of cached data
   - Filter by visibility/ownership
   - Sort options

### Phase 3: Advanced Features (Week 3)
1. **Detail View**
   - Complete list detail page
   - Item management interface
   - History/audit log display

2. **Collaborative Features**
   - Real-time updates
   - User attribution display
   - Edit conflict handling

3. **List Operations**
   - Duplicate lists
   - Bulk operations
   - Export functionality

### Phase 4: Polish & Testing (Week 4)
1. **UI/UX Polish**
   - Responsive design
   - Loading states
   - Error handling
   - Animations

2. **Testing**
   - Unit tests for components
   - Integration tests for workflows
   - E2E tests for critical paths

3. **Documentation**
   - Component documentation
   - User guide updates
   - API integration docs

---

## Testing Strategy

### Unit Testing
```typescript
// src/components/__tests__/ShoppingListCard.test.tsx
describe('ShoppingListCard', () => {
  it('displays list information correctly', () => {});
  it('shows correct permissions for different users', () => {});
  it('handles edit/delete actions', () => {});
});

// src/hooks/__tests__/useShoppingLists.test.tsx  
describe('useShoppingLists', () => {
  it('fetches shopping lists correctly', () => {});
  it('handles loading and error states', () => {});
  it('updates cache on mutations', () => {});
});
```

### Integration Testing
```typescript
// tests/integration/shopping-lists/list-management.test.tsx
describe('Shopping List Management', () => {
  it('creates and manages shopping lists end-to-end', () => {});
  it('handles collaborative editing correctly', () => {});
  it('respects permission boundaries', () => {});
});
```

### E2E Testing (Playwright)
```typescript
// tests/e2e/shopping-lists/basic-workflow.spec.ts
test('complete shopping list workflow', async ({ page }) => {
  // Login as user
  // Navigate to shopping lists
  // Create a new list
  // Add items to list
  // Edit list settings
  // Verify changes in detail view
  // Delete list
});
```

### Testing Coverage Goals
- Unit tests: 90%+ coverage for components and hooks
- Integration tests: All major user workflows
- E2E tests: Critical paths and permission scenarios
- Performance tests: Page load times and interaction response

---

## Success Metrics

### Technical Metrics
1. **Performance**: Page loads under 500ms, interactions under 200ms
2. **Test Coverage**: 90%+ unit test coverage, 100% E2E coverage of critical paths
3. **Accessibility**: WCAG 2.1 AA compliance verified
4. **Browser Support**: Chrome, Firefox, Safari, Edge latest versions

### User Experience Metrics
1. **Usability**: Intuitive interface following existing patterns
2. **Functionality**: All backend features accessible and working
3. **Collaboration**: Clear indication of multi-user editing
4. **Error Handling**: Informative error messages and recovery options

### Business Metrics
1. **Feature Adoption**: Track usage of shopping lists feature
2. **User Satisfaction**: Positive feedback on collaborative features
3. **Performance**: No regression in overall application performance

---

## Open Questions & Design Decisions

### 1. Real-time Updates ✅ RESOLVED
**Decision**: Polling for periodic updates every 10 seconds
**Rationale**: Architecturally simpler than WebSocket, adequate for shopping list use case
**Implementation**: React Query refetch interval of 10,000ms for list detail pages

### 2. Completion Tracking ✅ RESOLVED
**Decision**: Checkboxes that either soft-delete the item or set quantity to 0
**Rationale**: Provides actual completion functionality for shopping workflow
**Backend Impact**: May require backend changes to support soft-delete or quantity=0 handling
**Implementation**: Checkbox triggers either DELETE endpoint or PUT with quantity=0

### 3. Mobile Optimization ✅ RESOLVED
**Decision**: Mobile-first responsive design focused on single-list viewing and item checking
**Primary Use Case**: View one shopping list and check off items while shopping
**Implementation**: Touch-friendly checkboxes, larger tap targets, simplified mobile layout

### 4. Search Implementation ✅ RESOLVED
**Decision**: Client-side search for both list names and item names
**Scope**: Search shopping list names AND item names within lists
**Implementation**: Filter cached data on frontend, no additional API calls needed

### 5. Completion Behavior ✅ RESOLVED
**Decision**: Soft-delete items when checkbox is checked
**Implementation**: Use existing DELETE endpoint to remove items from list
**Future Enhancement**: Backend can add undelete functionality later
**UX**: Checked items disappear from active view but remain in audit history

### 6. Mobile Navigation ✅ RESOLVED
**Decision**: Standard responsive sidebar (collapses to hamburger menu)
**Implementation**: Extend existing Layout component navigation pattern

### 7. Offline Behavior ✅ RESOLVED
**Decision**: Show cached data only, disable editing when offline
**Implementation**: Detect network status, disable mutations, show read-only mode

### 8. Item Sorting ✅ RESOLVED
**Decision**: Order added (chronological) with completed items moving to bottom
**Implementation**: Sort by created_at for active items, completed items at bottom

### 9. Search Scope ✅ RESOLVED
**Decision**: Both global search (lists by name + lists containing items) and within-list search
**Implementation**: Single search input with comprehensive client-side filtering

### 10. Polling Error Handling ✅ RESOLVED
**Decision**: Show subtle indicator but continue polling
**Implementation**: Network status indicator, silent retries with React Query

### 11. Error Boundary Strategy
**Question**: How should we handle errors in the shopping lists feature?
**Options**:
- A) Page-level error boundaries
- B) Component-level error boundaries
- C) Global error handling only
**Recommendation**: Component-level error boundaries (B) with fallback UI

---

## Future Enhancements

1. **Mobile App Integration**: API-ready for future mobile app
2. **Sharing & Collaboration**: Enhanced sharing features
3. **Smart Suggestions**: ML-based item suggestions
4. **Integration Features**: Connect with external shopping services
5. **Analytics**: Usage analytics and insights
6. **Offline Support**: PWA features for offline functionality

---

*This design document is ready for review and feedback before implementation begins. Please review and provide feedback on the proposed architecture, user interface, and implementation approach.*