# Component Usage Guidelines

## Overview
This guide provides comprehensive usage patterns and best practices for the Dynamic Text Next component library, built with Material UI v7 and following Feature-Sliced Design (FSD) with Atomic Design principles.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Component Hierarchy](#component-hierarchy)
3. [Import Patterns](#import-patterns)
4. [Component Categories](#component-categories)
5. [Usage Examples](#usage-examples)
6. [Composition Patterns](#composition-patterns)
7. [State Management](#state-management)
8. [Form Handling](#form-handling)
9. [Accessibility](#accessibility)
10. [Performance Best Practices](#performance-best-practices)

## Architecture Overview

### FSD Layer Structure
```
app → pages → widgets → features → entities → shared
```

**Key Rule**: Higher layers can only import from lower layers. Never import from a higher layer.

### Atomic Design Categories
- **Atoms**: Basic UI elements (Button, Input, Typography)
- **Molecules**: Simple combinations (FormField, SearchBar)
- **Organisms**: Complex sections (Navigation, Footer, DataTable)

## Component Hierarchy

```typescript
// Correct: Page importing from shared
import { Button } from '@/shared/ui/atoms/Button'
import { Navigation } from '@/shared/ui/organisms/Navigation'

// Incorrect: Shared importing from features
// import { UserProfile } from '@/features/user/ui/UserProfile' ❌
```

## Import Patterns

### Path Aliases
```typescript
// Always use path aliases for clean imports
import { Button } from '@/shared/ui/atoms/Button'
import { FormField } from '@/shared/ui/molecules/FormField'
import { DataTable } from '@/shared/ui/organisms/DataTable'

// Never use relative paths across layers
// import { Button } from '../../../shared/ui/atoms/Button' ❌
```

### Component Exports
```typescript
// Always import from the index file
import { Button, ButtonProps } from '@/shared/ui/atoms/Button'

// Components export both the component and its types
export { Button } from './Button'
export type { ButtonProps } from './Button.types'
```

## Component Categories

### Atoms (Basic Elements)
Simple, single-purpose components that serve as building blocks.

```typescript
import { Button } from '@/shared/ui/atoms/Button'
import { Input } from '@/shared/ui/atoms/Input'
import { Typography } from '@/shared/ui/atoms/Typography'
import { Badge } from '@/shared/ui/atoms/Badge'
import { Chip } from '@/shared/ui/atoms/Chip'
```

**Usage Example:**
```tsx
<Button 
  variant="primary" 
  size="lg" 
  onClick={handleClick}
>
  Click Me
</Button>

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={setEmail}
  error={emailError}
/>
```

### Molecules (Component Combinations)
Composed of atoms to create more functional units.

```typescript
import { FormField } from '@/shared/ui/molecules/FormField'
import { SearchBar } from '@/shared/ui/molecules/SearchBar'
import { Card } from '@/shared/ui/molecules/Card'
import { DatePicker } from '@/shared/ui/molecules/DatePicker'
```

**Usage Example:**
```tsx
<FormField
  label="Username"
  name="username"
  rules={{ required: true, minLength: 3 }}
  error={errors.username}
>
  <Input />
</FormField>

<SearchBar
  placeholder="Search products..."
  onSearch={handleSearch}
  suggestions={searchSuggestions}
/>
```

### Organisms (Complex Sections)
Self-contained sections combining multiple molecules and atoms.

```typescript
import { Navigation } from '@/shared/ui/organisms/Navigation'
import { Footer } from '@/shared/ui/organisms/Footer'
import { DataTable } from '@/shared/ui/organisms/DataTable'
import { Form } from '@/shared/ui/organisms/Form'
```

**Usage Example:**
```tsx
<Navigation
  brand="My App"
  items={navItems}
  activeId={activeRoute}
  onItemClick={handleNavigation}
  showSearch
  rightActions={<Button>Sign In</Button>}
/>

<DataTable
  data={users}
  columns={userColumns}
  onSort={handleSort}
  onFilter={handleFilter}
  pagination={{
    page: currentPage,
    rowsPerPage: 10,
    onPageChange: setCurrentPage
  }}
/>
```

## Composition Patterns

### Building Complex UIs
Compose organisms from molecules and atoms following a consistent pattern:

```tsx
// Page-level composition
export function DashboardPage() {
  return (
    <Box>
      {/* Organism */}
      <Navigation {...navProps} />
      
      <Container>
        {/* Mix of molecules and atoms */}
        <Typography variant="h1">Dashboard</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Organism */}
            <DataTable {...tableProps} />
          </Grid>
          
          <Grid item xs={12} md={4}>
            {/* Molecule */}
            <Card title="Quick Stats">
              {/* Atoms */}
              <Typography>Total Users: 1,234</Typography>
              <Progress value={75} />
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* Organism */}
      <Footer {...footerProps} />
    </Box>
  )
}
```

### Component Prop Patterns
Use consistent prop naming and structures:

```tsx
// Consistent variant naming
<Button variant="primary" />
<Alert variant="success" />
<Card variant="elevated" />

// Consistent size props
<Button size="sm" />
<Input size="md" />
<Typography size="lg" />

// Consistent state props
<Component
  loading={isLoading}
  error={error}
  disabled={isDisabled}
/>
```

## State Management

### Local Component State
For simple, isolated state:

```tsx
function SearchableList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  
  return (
    <>
      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      <List 
        items={filteredItems}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
      />
    </>
  )
}
```

### Redux Integration
For shared application state:

```tsx
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { selectUser } from '@/features/auth/authSlice'

function UserProfile() {
  const user = useAppSelector(selectUser)
  const dispatch = useAppDispatch()
  
  return (
    <Card>
      <Typography variant="h2">{user.name}</Typography>
      <Button onClick={() => dispatch(logout())}>
        Logout
      </Button>
    </Card>
  )
}
```

## Form Handling

### Simple Forms
Using the Form organism with validation:

```tsx
import { Form } from '@/shared/ui/organisms/Form'
import * as yup from 'yup'

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required()
})

function LoginForm() {
  const handleSubmit = async (data: FormData) => {
    await login(data)
  }
  
  return (
    <Form
      fields={[
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true
        },
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          required: true
        }
      ]}
      validationSchema={schema}
      onSubmit={handleSubmit}
      submitLabel="Sign In"
    />
  )
}
```

### Multi-Step Forms
Using StepperForm for complex workflows:

```tsx
import { StepperForm } from '@/shared/ui/organisms/StepperForm'

const registrationSteps = [
  {
    label: 'Account Info',
    fields: [
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'password', label: 'Password', type: 'password' }
    ]
  },
  {
    label: 'Personal Info',
    fields: [
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' }
    ]
  },
  {
    label: 'Preferences',
    fields: [
      { name: 'newsletter', label: 'Subscribe to newsletter', type: 'checkbox' }
    ]
  }
]

function RegistrationFlow() {
  return (
    <StepperForm
      steps={registrationSteps}
      onSubmit={handleRegistration}
      showReviewStep
    />
  )
}
```

## Accessibility

### ARIA Attributes
All components include proper ARIA attributes:

```tsx
// Components automatically handle ARIA
<Button aria-label="Close dialog" />
<Input aria-describedby="email-error" />
<Navigation aria-label="Main navigation" />
```

### Keyboard Navigation
Components support standard keyboard patterns:

- **Tab**: Navigate between focusable elements
- **Enter/Space**: Activate buttons and links
- **Arrow Keys**: Navigate menus and lists
- **Escape**: Close modals and dropdowns

### Screen Reader Support
```tsx
// Use semantic HTML and descriptive labels
<FormField
  label="Email Address"
  helperText="We'll never share your email"
  error={error && "Please enter a valid email"}
>
  <Input type="email" />
</FormField>

// Provide context for dynamic content
<Badge 
  content={unreadCount} 
  aria-label={`${unreadCount} unread messages`}
/>
```

## Performance Best Practices

### Lazy Loading
Load heavy components only when needed:

```tsx
import { lazy, Suspense } from 'react'

const DataTable = lazy(() => import('@/shared/ui/organisms/DataTable'))

function AnalyticsPage() {
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={400} />}>
      <DataTable {...props} />
    </Suspense>
  )
}
```

### Memoization
Prevent unnecessary re-renders:

```tsx
import { memo, useMemo, useCallback } from 'react'

const ExpensiveList = memo(({ items, onItemClick }) => {
  const sortedItems = useMemo(
    () => items.sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  )
  
  const handleClick = useCallback((item) => {
    onItemClick(item.id)
  }, [onItemClick])
  
  return (
    <List items={sortedItems} onItemClick={handleClick} />
  )
})
```

### Bundle Size Optimization
Import only what you need:

```tsx
// Good: Specific imports
import { Button } from '@/shared/ui/atoms/Button'
import { Input } from '@/shared/ui/atoms/Input'

// Avoid: Barrel imports that might not tree-shake
// import * as Components from '@/shared/ui' ❌
```

### Virtual Scrolling
For long lists, use virtualization:

```tsx
import { DataTable } from '@/shared/ui/organisms/DataTable'

<DataTable
  data={largeDataset}
  virtualization={{
    enabled: true,
    rowHeight: 50,
    overscan: 5
  }}
/>
```

## Testing Components

### Unit Testing Pattern
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/shared/ui/atoms/Button'

describe('Button', () => {
  it('should handle click events', () => {
    const handleClick = vi.fn()
    
    render(
      <Button onClick={handleClick}>
        Click Me
      </Button>
    )
    
    fireEvent.click(screen.getByText('Click Me'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Integration Testing
```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { Form } from '@/shared/ui/organisms/Form'

describe('Form', () => {
  it('should validate and submit', async () => {
    const onSubmit = vi.fn()
    
    render(<Form {...formProps} onSubmit={onSubmit} />)
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com')
    
    // Submit
    fireEvent.click(screen.getByText('Submit'))
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com'
      })
    })
  })
})
```

## Common Patterns

### Loading States
```tsx
function DataView() {
  const { data, loading, error } = useData()
  
  if (loading) {
    return <Skeleton variant="rectangular" height={400} />
  }
  
  if (error) {
    return <EmptyState variant="error" message={error.message} />
  }
  
  return <DataTable data={data} />
}
```

### Error Boundaries
```tsx
import { ErrorBoundary } from '@/shared/ui/organisms/ErrorBoundary'

<ErrorBoundary fallback={<EmptyState variant="error" />}>
  <ComplexComponent />
</ErrorBoundary>
```

### Responsive Design
```tsx
import { useTheme, useMediaQuery } from '@mui/material'

function ResponsiveLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  return (
    <Navigation
      mobileBreakpoint="sm"
      mobileMenuVariant={isMobile ? 'drawer' : 'dropdown'}
    />
  )
}
```

## Migration Guide

### From Custom Components to Library
```tsx
// Before: Custom implementation
<div className="custom-button" onClick={handleClick}>
  Click Me
</div>

// After: Using component library
import { Button } from '@/shared/ui/atoms/Button'

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

### Styling Migration
```tsx
// Before: Custom CSS
<div className="card custom-styles">Content</div>

// After: Using theme and variants
<Card variant="elevated" sx={{ mt: 2, p: 3 }}>
  Content
</Card>
```

## Troubleshooting

### Common Issues

1. **Import Errors**
   - Ensure you're using the correct path alias
   - Check that the component is exported from its index file

2. **Type Errors**
   - Import both the component and its types
   - Use the provided TypeScript interfaces

3. **Styling Issues**
   - Use MUI's sx prop or styled components
   - Follow the theme structure for consistency

4. **Performance Issues**
   - Implement lazy loading for heavy components
   - Use memoization for expensive computations
   - Enable virtualization for large lists

## Resources

- [Storybook Documentation](http://localhost:6006)
- [Material UI Documentation](https://mui.com/material-ui/)
- [FSD Architecture Guide](./FSD-ARCHITECTURE.md)
- [Component API Reference](./API_REFERENCE.md)