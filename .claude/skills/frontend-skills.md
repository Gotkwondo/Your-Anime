---
name: frontend-development
description: Modern React development with TanStack Query and Zustand. Use when building React components, implementing state management, creating reusable UI patterns, or when the user mentions React, frontend, components, hooks, or web development. Required stack is React, TanStack Query, Zustand, and Vite.
---

# Frontend Development Skill

Expert guidance for building modern React applications with best practices, focusing on compound components, reusability, and proper state management.

## When to Use This Skill

- Building React components or UI features
- Implementing state management (client or server)
- Creating reusable component patterns
- Refactoring existing React code
- Setting up new React projects with the core stack
- When the user mentions: React, frontend, components, hooks, state management, TanStack Query, Zustand

## Core Technology Stack

**REQUIRED technologies** (no confirmation needed):
- **React**: Component-based UI library
- **TanStack Query**: Server state and data fetching
- **Zustand**: Client state management  
- **Vite**: Build tool and dev server

**Technology validation workflow:**

Before using ANY library outside the core stack, ALWAYS ask the user:

```
I notice this feature could benefit from [library name].
This is not part of the core stack (React, TanStack Query, Zustand, Vite).

Would you like me to:
1. Implement it using only the core stack
2. Use [library name] (requires installation: npm install [library])
```

**Common libraries requiring confirmation:**
- UI frameworks: Tailwind, MUI, Ant Design, shadcn/ui
- Forms: React Hook Form, Formik, Zod
- Routing: React Router, TanStack Router
- Animation: Framer Motion, React Spring
- Utilities: lodash, date-fns, ramda
- Icons: react-icons, lucide-react

**Exception**: Standard Web APIs (fetch, localStorage, etc.) and built-in browser features need no confirmation.

## Implementation Workflow

Before implementing ANY feature, follow this checklist:

```
Pre-Implementation Checklist:
□ Step 1: Check for existing similar components/features
□ Step 2: Identify dependencies and integration points
□ Step 3: Assess backward compatibility impact
□ Step 4: Verify technology stack compliance (core stack only?)
□ Step 5: Plan for reusability and composition
□ Step 6: Proceed with implementation
```

### Step 1: Search Existing Code

```bash
# Search for similar components
grep -r "component-pattern" src/

# Check for related hooks
find src/hooks -name "*similar-name*"

# Look for utilities
ls src/utils/
```

### Step 2: Identify Dependencies

**Questions to ask:**
- What components/hooks will this use?
- What components/hooks will depend on this?
- Are there shared Zustand stores?
- Are there React Query keys that might conflict?
- Does this affect routing or context providers?

### Step 3: Compatibility Assessment

**Check for breaking changes:**
- Will existing props/interfaces change?
- Are type definitions compatible?
- Will this affect existing component consumers?

**If breaking changes are needed:**
1. Document all breaking changes
2. Provide migration path
3. Consider deprecation period
4. Update all affected code

### Step 4: Technology Compliance

Review the feature requirements:
- Can it be built with React + TanStack Query + Zustand?
- If not, ask user for library approval (see Core Technology Stack)

### Step 5: Plan for Reusability

**Design questions:**
- Can this be a generic component with TypeScript generics?
- Should this be split into smaller, composable pieces?
- Is there reusable logic to extract into a custom hook?
- Can this follow the compound component pattern?

## Architecture Patterns

### 1. Compound Component Pattern (REQUIRED)

**ALWAYS use compound components** for complex UI that has:
- Multiple related sub-components
- Shared internal state
- Flexible composition needs

**Benefits:**
- Implicit state sharing via Context
- Flexible, declarative API
- Clear component relationships
- Better composition

#### Implementation Template

```tsx
// Step 1: Define context and types
interface ComponentContextValue {
  // Shared state and methods
  state: SomeState;
  updateState: (newState: SomeState) => void;
}

const ComponentContext = createContext<ComponentContextValue | null>(null);

// Step 2: Create context hook
function useComponentContext() {
  const context = useContext(ComponentContext);
  if (!context) {
    throw new Error('Component.* must be used within Component');
  }
  return context;
}

// Step 3: Build parent component
interface ComponentProps {
  children: React.ReactNode;
  defaultValue?: SomeState;
  // Other props...
}

function Component({ children, defaultValue }: ComponentProps) {
  const [state, setState] = useState(defaultValue);
  
  const value = useMemo(() => ({
    state,
    updateState: setState,
  }), [state]);
  
  return (
    <ComponentContext.Provider value={value}>
      <div className="component-wrapper">{children}</div>
    </ComponentContext.Provider>
  );
}

// Step 4: Create sub-components
function SubComponentA({ children }: { children: React.ReactNode }) {
  const { state } = useComponentContext();
  return <div className="sub-a">{children}</div>;
}

function SubComponentB({ children }: { children: React.ReactNode }) {
  const { updateState } = useComponentContext();
  return (
    <button onClick={() => updateState(newValue)}>
      {children}
    </button>
  );
}

// Step 5: Attach sub-components
Component.SubA = SubComponentA;
Component.SubB = SubComponentB;

export { Component };

// Usage
function App() {
  return (
    <Component defaultValue={initialState}>
      <Component.SubA>Content A</Component.SubA>
      <Component.SubB>Action B</Component.SubB>
    </Component>
  );
}
```

#### Real-World Example: Tabs Component

```tsx
// ❌ BAD: Props drilling, inflexible
interface TabsProps {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
}
function Tabs({ tabs }: TabsProps) { /* rigid structure */ }

// ✅ GOOD: Compound pattern, flexible composition
import { createContext, useContext, useState } from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tab.* must be used within Tabs');
  return context;
}

function Tabs({ 
  children, 
  defaultTab 
}: { 
  children: React.ReactNode; 
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? '');
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }: { children: React.ReactNode }) {
  return <div role="tablist" className="tab-list">{children}</div>;
}

function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === id;
  
  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={isActive ? 'tab active' : 'tab'}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }: { children: React.ReactNode }) {
  return <div className="tab-panels">{children}</div>;
}

function TabPanel({ id, children }: { id: string; children: React.ReactNode }) {
  const { activeTab } = useTabs();
  if (activeTab !== id) return null;
  
  return (
    <div role="tabpanel" className="tab-panel">
      {children}
    </div>
  );
}

// Attach sub-components
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

export { Tabs };

// Usage - flexible composition
<Tabs defaultTab="overview">
  <Tabs.List>
    <Tabs.Tab id="overview">Overview</Tabs.Tab>
    <Tabs.Tab id="settings">Settings</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panels>
    <Tabs.Panel id="overview">
      <h2>Overview Content</h2>
    </Tabs.Panel>
    <Tabs.Panel id="settings">
      <SettingsForm />
    </Tabs.Panel>
  </Tabs.Panels>
</Tabs>
```

### 2. Reusability Principles

**Every component, hook, and utility should be reusable.** Ask these questions:

1. **Could this be used elsewhere?** → Make it generic
2. **Is this solving a common problem?** → Extract it
3. **Am I hardcoding values?** → Use props/config
4. **Can this work with different data types?** → Use generics

#### Component Reusability Patterns

**Pattern 1: Generic List with Render Props**

```tsx
// ✅ Reusable with any data type
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  loading?: boolean;
  error?: Error | null;
}

function List<T>({ 
  items, 
  renderItem, 
  keyExtractor, 
  emptyMessage = 'No items found',
  loading = false,
  error = null
}: ListProps<T>) {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (items.length === 0) return <EmptyState message={emptyMessage} />;
  
  return (
    <div className="list">
      {items.map((item, index) => (
        <div key={keyExtractor(item, index)} className="list-item">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

// Usage with different types
<List
  items={users}
  renderItem={(user) => <UserCard user={user} />}
  keyExtractor={(user) => user.id}
  emptyMessage="No users found"
/>

<List
  items={products}
  renderItem={(product) => <ProductTile product={product} />}
  keyExtractor={(product) => product.sku}
/>
```

**Pattern 2: Configurable Components**

```tsx
// ❌ BAD: Hardcoded values
function PriceDisplay({ amount }: { amount: number }) {
  return <span>${amount.toFixed(2)} USD</span>;
}

// ✅ GOOD: Configurable
interface PriceDisplayProps {
  amount: number;
  currency?: string;
  locale?: string;
  showSymbol?: boolean;
  decimals?: number;
}

function PriceDisplay({ 
  amount,
  currency = 'USD',
  locale = 'en-US',
  showSymbol = true,
  decimals = 2
}: PriceDisplayProps) {
  const formatted = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: showSymbol ? currency : undefined,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  
  return <span>{formatted}</span>;
}

// Flexible usage
<PriceDisplay amount={1234.5} /> {/* $1,234.50 USD */}
<PriceDisplay amount={1234.5} currency="EUR" locale="de-DE" /> {/* 1.234,50 € */}
<PriceDisplay amount={1234.5} showSymbol={false} /> {/* 1,234.50 */}
```

**Pattern 3: Composition Over Configuration**

```tsx
// Build complex UI from simple, composable pieces

// ✅ Simple, focused components
function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={`card ${className ?? ''}`}>{children}</div>;
}

function CardHeader({ children }: PropsWithChildren) {
  return <div className="card-header">{children}</div>;
}

function CardContent({ children }: PropsWithChildren) {
  return <div className="card-content">{children}</div>;
}

function CardActions({ children }: PropsWithChildren) {
  return <div className="card-actions">{children}</div>;
}

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Actions = CardActions;

// Compose different layouts
<Card>
  <Card.Header><h3>Simple Card</h3></Card.Header>
  <Card.Content>Basic content</Card.Content>
</Card>

<Card>
  <Card.Header>
    <Avatar user={user} />
    <h3>{user.name}</h3>
  </Card.Header>
  <Card.Content>{post.content}</Card.Content>
  <Card.Actions>
    <Button>Like</Button>
    <Button>Share</Button>
  </Card.Actions>
</Card>
```

#### Hook Reusability Patterns

**Pattern 1: Extract Common Logic**

```tsx
// ✅ Reusable toggle hook
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return { 
    value, 
    toggle, 
    setTrue, 
    setFalse, 
    setValue 
  } as const;
}

// Compose into domain-specific hooks
function useModal() {
  const { value: isOpen, setTrue: open, setFalse: close } = useToggle();
  return { isOpen, open, close };
}

function useDrawer() {
  const { value: isOpen, setTrue: open, setFalse: close } = useToggle();
  return { isOpen, open, close };
}

function useDisclosure() {
  return useToggle();
}
```

**Pattern 2: Composable Hooks**

```tsx
// Build complex hooks from simple ones

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue] as const;
}

// Compose them together
function useSearchWithHistory(storageKey: string) {
  const [query, setQuery] = useLocalStorage(storageKey, '');
  const debouncedQuery = useDebounce(query, 300);
  
  return { query, setQuery, debouncedQuery };
}
```

#### Utility Function Reusability

**Always write pure, type-safe utilities:**

```tsx
/**
 * Format a date relative to now (e.g., "2 hours ago")
 * @param date - Date to format
 * @param locale - Locale for formatting (default: 'en-US')
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: string = 'en-US'
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  const intervals: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];
  
  for (const [unit, secondsInUnit] of intervals) {
    const interval = Math.floor(diffInSeconds / secondsInUnit);
    if (interval >= 1) {
      return rtf.format(-interval, unit);
    }
  }
  
  return rtf.format(0, 'second');
}

/**
 * Deep clone an object (works with nested objects and arrays)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Group array items by a key
 */
export function groupBy<T, K extends keyof T>(
  items: T[],
  key: K
): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const groupKey = String(item[key]);
    return {
      ...groups,
      [groupKey]: [...(groups[groupKey] || []), item],
    };
  }, {} as Record<string, T[]>);
}
```

## State Management Strategy

**Rule**: Use the right tool for the right state.

- **TanStack Query**: Server state (API data, caching, background updates)
- **Zustand**: Client state (UI state, user preferences, global app state)  
- **React State**: Local component state (forms, toggles, local UI)

### TanStack Query for Server State

**When to use:**
- Fetching data from APIs
- Caching server responses
- Background data synchronization
- Optimistic updates
- Pagination, infinite scroll

#### Query Organization Pattern

```tsx
// src/hooks/queries/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, fetchUser, createUser, updateUser, deleteUser } from '@/api/users';

// Query keys - centralized for consistency
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Query hooks
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters ?? {}),
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: !!id, // Only run if id exists
  });
}

// Mutation hooks
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => 
      updateUser(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });
      
      // Snapshot previous value
      const previousUser = queryClient.getQueryData(userKeys.detail(id));
      
      // Optimistically update
      queryClient.setQueryData(userKeys.detail(id), (old: User) => ({
        ...old,
        ...data,
      }));
      
      return { previousUser };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.detail(id), context.previousUser);
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
```

#### Usage in Components

```tsx
function UserList() {
  const { data: users, isLoading, error } = useUsers({ status: 'active' });
  const createUser = useCreateUser();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <button 
        onClick={() => createUser.mutate({ name: 'New User' })}
        disabled={createUser.isPending}
      >
        Add User
      </button>
      <List
        items={users ?? []}
        renderItem={(user) => <UserCard user={user} />}
        keyExtractor={(user) => user.id}
      />
    </div>
  );
}

function UserDetail({ userId }: { userId: string }) {
  const { data: user } = useUser(userId);
  const updateUser = useUpdateUser();
  
  if (!user) return null;
  
  const handleUpdate = async (data: Partial<User>) => {
    await updateUser.mutateAsync({ id: userId, data });
  };
  
  return <UserForm user={user} onSubmit={handleUpdate} />;
}
```

### Zustand for Client State

**When to use:**
- UI state (modals, sidebars, themes)
- User preferences
- App-wide settings
- Temporary client-only data

#### Store Organization Pattern

```tsx
// src/stores/useAppStore.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// Slice pattern for organization
interface UISlice {
  sidebarOpen: boolean;
  modalOpen: boolean;
  theme: 'light' | 'dark';
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setModalOpen: (open: boolean) => void;
  toggleModal: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

interface UserPreferencesSlice {
  language: string;
  notifications: boolean;
  setLanguage: (language: string) => void;
  setNotifications: (enabled: boolean) => void;
}

interface FilterSlice {
  searchQuery: string;
  filters: Record<string, unknown>;
  setSearchQuery: (query: string) => void;
  setFilter: (key: string, value: unknown) => void;
  clearFilters: () => void;
}

type AppStore = UISlice & UserPreferencesSlice & FilterSlice;

// Create slices
const createUISlice = (set): UISlice => ({
  sidebarOpen: true,
  modalOpen: false,
  theme: 'light',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setModalOpen: (open) => set({ modalOpen: open }),
  toggleModal: () => set((state) => ({ modalOpen: !state.modalOpen })),
  setTheme: (theme) => set({ theme }),
});

const createUserPreferencesSlice = (set): UserPreferencesSlice => ({
  language: 'en',
  notifications: true,
  setLanguage: (language) => set({ language }),
  setNotifications: (notifications) => set({ notifications }),
});

const createFilterSlice = (set): FilterSlice => ({
  searchQuery: '',
  filters: {},
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilter: (key, value) => 
    set((state) => ({ 
      filters: { ...state.filters, [key]: value } 
    })),
  clearFilters: () => set({ searchQuery: '', filters: {} }),
});

// Combine slices
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        ...createUISlice(set),
        ...createUserPreferencesSlice(set),
        ...createFilterSlice(set),
      }),
      {
        name: 'app-storage',
        // Only persist user preferences, not UI state
        partialize: (state) => ({
          language: state.language,
          notifications: state.notifications,
          theme: state.theme,
        }),
      }
    )
  )
);

// Selectors for performance optimization
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useTheme = () => useAppStore((state) => state.theme);
export const useFilters = () => useAppStore((state) => ({
  searchQuery: state.searchQuery,
  filters: state.filters,
  setSearchQuery: state.setSearchQuery,
  setFilter: state.setFilter,
  clearFilters: state.clearFilters,
}));
```

#### Usage in Components

```tsx
// ✅ GOOD: Use selectors to prevent unnecessary re-renders
function Sidebar() {
  const sidebarOpen = useSidebarOpen();
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  
  if (!sidebarOpen) return null;
  
  return (
    <aside>
      <button onClick={() => setSidebarOpen(false)}>Close</button>
      {/* Sidebar content */}
    </aside>
  );
}

function ThemeToggle() {
  const theme = useTheme();
  const setTheme = useAppStore((state) => state.setTheme);
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

function FilterPanel() {
  const { searchQuery, filters, setSearchQuery, setFilter, clearFilters } = useFilters();
  
  return (
    <div>
      <input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
      />
      <select onChange={(e) => setFilter('category', e.target.value)}>
        <option value="">All Categories</option>
        <option value="tech">Tech</option>
        <option value="design">Design</option>
      </select>
      <button onClick={clearFilters}>Clear Filters</button>
    </div>
  );
}
```

### React State for Local UI

**When to use:**
- Form inputs
- Toggles, accordions
- Local component state
- Temporary UI state

```tsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const login = useLogin(); // TanStack Query mutation
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login.mutateAsync({ email, password });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input 
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="button" onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? 'Hide' : 'Show'}
      </button>
      <button type="submit" disabled={login.isPending}>
        Login
      </button>
    </form>
  );
}
```

## Project Structure

Organize code for scalability and maintainability:

```
src/
├── components/
│   ├── ui/                 # Generic UI components (Button, Input, Card)
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   └── Input/
│   ├── compound/           # Compound components (Tabs, Modal, Dropdown)
│   │   ├── Tabs/
│   │   │   ├── Tabs.tsx
│   │   │   ├── Tab.tsx
│   │   │   ├── TabList.tsx
│   │   │   ├── TabPanels.tsx
│   │   │   ├── TabPanel.tsx
│   │   │   └── index.ts
│   │   └── Modal/
│   └── features/           # Feature-specific components
│       ├── UserProfile/
│       └── Dashboard/
├── hooks/
│   ├── queries/            # TanStack Query hooks
│   │   ├── useUsers.ts
│   │   ├── useProducts.ts
│   │   └── index.ts
│   └── common/             # Shared hooks
│       ├── useToggle.ts
│       ├── useDebounce.ts
│       └── index.ts
├── stores/                 # Zustand stores
│   ├── useAppStore.ts
│   ├── useAuthStore.ts
│   └── index.ts
├── api/                    # API client
│   ├── client.ts
│   ├── users.ts
│   ├── products.ts
│   └── index.ts
├── utils/                  # Utility functions
│   ├── format.ts
│   ├── validation.ts
│   └── index.ts
├── types/                  # TypeScript types
│   ├── user.ts
│   ├── product.ts
│   └── index.ts
└── lib/                    # Third-party library configs
    └── queryClient.ts
```

## Performance Optimization

### Memoization Strategy

```tsx
// ✅ Memoize expensive computations
function UserList({ users }: { users: User[] }) {
  // Recalculates only when users array changes
  const sortedUsers = useMemo(
    () => users.sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  );
  
  // Stable callback reference
  const handleUserClick = useCallback((userId: string) => {
    console.log('Clicked user:', userId);
  }, []); // No dependencies = stable forever
  
  return (
    <List
      items={sortedUsers}
      renderItem={(user) => (
        <UserCard user={user} onClick={handleUserClick} />
      )}
      keyExtractor={(user) => user.id}
    />
  );
}

// ✅ Memoize components to prevent unnecessary re-renders
const UserCard = memo(({ user, onClick }: UserCardProps) => {
  return (
    <div onClick={() => onClick(user.id)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});
UserCard.displayName = 'UserCard';
```

### Code Splitting

```tsx
// Lazy load routes and heavy components
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}

// Lazy load heavy libraries
const HeavyChart = lazy(() => import('./components/HeavyChart'));

function ChartPage() {
  return (
    <Suspense fallback={<div>Loading chart...</div>}>
      <HeavyChart data={data} />
    </Suspense>
  );
}
```

### Virtualization for Large Lists

```tsx
// Use virtualization for lists with 100+ items
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Estimated row height
  });
  
  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ItemRow item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Error Handling

### TanStack Query Error Handling

```tsx
// Global error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Per-query error handling
function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading, refetch } = useUser(userId);
  
  if (isLoading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={refetch}
        message="Failed to load user profile"
      />
    );
  }
  
  return <div>{data.name}</div>;
}

// Reusable error component
function ErrorState({ 
  error, 
  onRetry, 
  message 
}: { 
  error: Error; 
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <div className="error-state">
      <h3>{message ?? 'An error occurred'}</h3>
      <p>{error.message}</p>
      {onRetry && (
        <button onClick={onRetry}>Try Again</button>
      )}
    </div>
  );
}
```

### React Error Boundaries

```tsx
import { Component, PropsWithChildren, ReactNode } from 'react';

interface Props extends PropsWithChildren {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
          <button onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
```

## Testing Strategy

### Component Testing

```tsx
// Design components to be testable
interface UserProfileProps {
  userId: string;
  // Injectable dependency for testing
  userQuery?: typeof useUser;
}

function UserProfile({ 
  userId, 
  userQuery = useUser 
}: UserProfileProps) {
  const { data: user } = userQuery(userId);
  
  if (!user) return null;
  
  return <div>{user.name}</div>;
}

// Test with mock
test('renders user name', () => {
  const mockUseUser = () => ({
    data: { id: '1', name: 'John' },
    isLoading: false,
    error: null,
  });
  
  render(<UserProfile userId="1" userQuery={mockUseUser} />);
  expect(screen.getByText('John')).toBeInTheDocument();
});
```

## Summary Checklist

When implementing a new feature:

```
□ Step 1: Check existing components for similar functionality
□ Step 2: Verify core stack usage (React, TanStack Query, Zustand, Vite)
□ Step 3: Ask user if non-core libraries are needed
□ Step 4: Use compound component pattern for complex UI
□ Step 5: Design for reusability (generics, props, composition)
□ Step 6: Use correct state management:
  - TanStack Query for server state
  - Zustand for client state
  - React state for local UI
□ Step 7: Check backward compatibility
□ Step 8: Optimize performance (memoization, code splitting)
□ Step 9: Add error handling
□ Step 10: Test the implementation
```

## Common Patterns Reference

### Pattern: Data Table with Filters

```tsx
function DataTable<T>() {
  // Server state
  const { searchQuery, filters } = useFilters();
  const { data, isLoading } = useTableData(searchQuery, filters);
  
  // Local state
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  // Mutations
  const deleteMutation = useDeleteItems();
  
  return (
    <div>
      <FilterPanel />
      <Table 
        data={data}
        selectedRows={selectedRows}
        onSelectRows={setSelectedRows}
      />
      <button onClick={() => deleteMutation.mutate(selectedRows)}>
        Delete Selected
      </button>
    </div>
  );
}
```

### Pattern: Form with Server Sync

```tsx
function EditForm({ itemId }: { itemId: string }) {
  // Server state
  const { data: item } = useItem(itemId);
  const updateMutation = useUpdateItem();
  
  // Local form state
  const [formData, setFormData] = useState(item);
  
  // Sync server data to form
  useEffect(() => {
    if (item) setFormData(item);
  }, [item]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      id: itemId,
      data: formData,
    });
  };
  
  return <form onSubmit={handleSubmit}>{/* fields */}</form>;
}
```

### Pattern: Optimistic UI

```tsx
function LikeButton({ postId }: { postId: string }) {
  const queryClient = useQueryClient();
  
  const likeMutation = useMutation({
    mutationFn: likePost,
    onMutate: async (postId) => {
      // Cancel refetch
      await queryClient.cancelQueries(['post', postId]);
      
      // Snapshot
      const previous = queryClient.getQueryData(['post', postId]);
      
      // Optimistic update
      queryClient.setQueryData(['post', postId], (old: Post) => ({
        ...old,
        liked: true,
        likes: old.likes + 1,
      }));
      
      return { previous };
    },
    onError: (err, postId, context) => {
      // Rollback
      queryClient.setQueryData(['post', postId], context.previous);
    },
  });
  
  return (
    <button onClick={() => likeMutation.mutate(postId)}>
      Like
    </button>
  );
}
```

## Resources

- [React Documentation](https://react.dev)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Vite Documentation](https://vitejs.dev)

---

**Remember:** Always prioritize reusability, compatibility, and the core technology stack. When in doubt, ask the user before adding new dependencies.