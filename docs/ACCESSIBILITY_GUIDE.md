# Accessibility Guide

## Overview
This guide documents accessibility patterns and best practices implemented in the Dynamic Text Next component library. All components are designed to meet WCAG 2.1 Level AA standards.

## Table of Contents
1. [Core Principles](#core-principles)
2. [Keyboard Navigation](#keyboard-navigation)
3. [Screen Reader Support](#screen-reader-support)
4. [ARIA Patterns](#aria-patterns)
5. [Color and Contrast](#color-and-contrast)
6. [Focus Management](#focus-management)
7. [Component-Specific Patterns](#component-specific-patterns)
8. [Testing Accessibility](#testing-accessibility)
9. [Checklist](#checklist)

## Core Principles

### POUR Guidelines
Our components follow the four main principles of web accessibility:

1. **Perceivable**: Information and UI components must be presentable in ways users can perceive
2. **Operable**: UI components and navigation must be operable
3. **Understandable**: Information and UI operation must be understandable
4. **Robust**: Content must be robust enough for various assistive technologies

## Keyboard Navigation

### Standard Key Bindings

#### Global Navigation
- **Tab**: Move focus to next focusable element
- **Shift + Tab**: Move focus to previous focusable element
- **Enter**: Activate buttons, links, and form controls
- **Space**: Activate buttons, toggle checkboxes
- **Escape**: Close modals, dropdowns, and menus

#### Menu Navigation (Navigation Component)
```tsx
<Navigation
  items={menuItems}
  // Keyboard support built-in:
  // Tab: Navigate between top-level items
  // Enter/Space: Open dropdown
  // Arrow Down: Move to first item in dropdown
  // Arrow Up/Down: Navigate dropdown items
  // Escape: Close dropdown
/>
```

#### Data Table Navigation
```tsx
<DataTable
  data={data}
  columns={columns}
  // Keyboard support:
  // Tab: Navigate between cells
  // Enter: Sort by column (on headers)
  // Space: Select row (if selectable)
  // Arrow keys: Navigate cells (when in cell navigation mode)
/>
```

#### Form Navigation
```tsx
<Form
  fields={fields}
  // Keyboard support:
  // Tab: Navigate between fields
  // Enter: Submit form (when in last field)
  // Escape: Clear focused field
/>
```

## Screen Reader Support

### Semantic HTML
All components use semantic HTML elements:

```tsx
// Good: Semantic elements
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// Component automatically renders semantic HTML
<Navigation /> // Renders <nav>
<Button />     // Renders <button>
<Footer />     // Renders <footer>
```

### Descriptive Labels
Components include screen reader-friendly labels:

```tsx
// Automatic ARIA labels
<Button icon={<CloseIcon />} aria-label="Close dialog" />

// Form fields with proper associations
<FormField label="Email Address" required>
  <Input type="email" />
</FormField>
// Renders: <label for="email">Email Address *</label>
//          <input id="email" aria-required="true" />

// Tables with proper headers
<DataTable
  data={users}
  columns={[
    { id: 'name', label: 'User Name', ariaLabel: 'Sort by name' }
  ]}
/>
```

### Live Regions
Dynamic content updates are announced:

```tsx
// Alert component uses role="alert"
<Alert variant="success">
  Your changes have been saved
</Alert>

// Progress updates
<Progress
  value={progress}
  aria-label="Upload progress"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
/>

// Loading states
<DataTable
  loading={true}
  loadingText="Loading data, please wait..."
  // Announces: "Loading data, please wait..."
/>
```

## ARIA Patterns

### Common ARIA Attributes

#### Buttons
```tsx
<Button
  aria-label="Add new item"        // Descriptive label
  aria-pressed={isActive}          // Toggle state
  aria-disabled={isDisabled}       // Disabled state
  aria-expanded={isExpanded}       // Expandable content
  aria-controls="menu-id"          // Controls relationship
/>
```

#### Form Controls
```tsx
<Input
  aria-label="Search"              // Label when no visual label
  aria-describedby="search-help"   // Additional description
  aria-invalid={hasError}          // Error state
  aria-required={isRequired}       // Required field
  aria-autocomplete="list"         // Autocomplete behavior
/>
```

#### Navigation
```tsx
<Navigation
  aria-label="Main navigation"     // Navigation context
>
  <MenuItem
    aria-current="page"             // Current page indicator
    aria-haspopup="menu"           // Has submenu
    aria-expanded={isOpen}          // Submenu state
  />
</Navigation>
```

#### Data Tables
```tsx
<DataTable
  aria-label="User accounts"       // Table description
  aria-rowcount={totalRows}        // Total rows (for virtual)
  aria-colcount={columns.length}   // Column count
  aria-busy={isLoading}           // Loading state
/>
```

### Component ARIA Patterns

#### Dropdown Menu Pattern
```tsx
// Navigation component implements ARIA menu pattern
<button
  aria-haspopup="menu"
  aria-expanded={isOpen}
  aria-controls="dropdown-menu"
>
  Products
</button>
<ul
  id="dropdown-menu"
  role="menu"
  aria-labelledby="products-button"
>
  <li role="menuitem">Product 1</li>
  <li role="menuitem">Product 2</li>
</ul>
```

#### Tab Pattern
```tsx
// Tab component implements ARIA tabs pattern
<div role="tablist" aria-label="Account settings">
  <button
    role="tab"
    aria-selected={activeTab === 0}
    aria-controls="panel-0"
    id="tab-0"
  >
    Profile
  </button>
</div>
<div
  role="tabpanel"
  id="panel-0"
  aria-labelledby="tab-0"
>
  {/* Tab content */}
</div>
```

#### Dialog Pattern
```tsx
// Modal/Dialog implements ARIA dialog pattern
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-description">Are you sure?</p>
</div>
```

## Color and Contrast

### Contrast Ratios
All color combinations meet WCAG AA standards:

```tsx
// Theme provides accessible color combinations
const theme = {
  palette: {
    primary: {
      main: '#1976d2',      // 4.5:1 on white
      contrastText: '#fff'  // 8.5:1 on primary
    },
    error: {
      main: '#d32f2f',      // 4.5:1 on white
      light: '#ef5350',     // 3.1:1 on white (decorative only)
    }
  }
}
```

### Color Independence
Information is never conveyed by color alone:

```tsx
// Bad: Color only
<Chip color="red" /> // ❌

// Good: Color with text/icon
<Chip
  color="error"
  label="Error"
  icon={<ErrorIcon />}
  aria-label="Error status"
/> // ✅

// Form validation includes text
<Input
  error={true}
  helperText="Email is required"
  aria-invalid={true}
/>
```

### Focus Indicators
All interactive elements have visible focus indicators:

```css
/* Default focus styles */
button:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  button:focus-visible {
    outline: 3px solid;
  }
}
```

## Focus Management

### Focus Trap
Modals and dropdowns trap focus:

```tsx
// Modal component traps focus
<Modal open={isOpen} onClose={handleClose}>
  {/* Focus is trapped within modal content */}
  <ModalContent>
    <Button>Action 1</Button>
    <Button>Action 2</Button>
  </ModalContent>
</Modal>
```

### Focus Restoration
Focus returns to trigger element after closing:

```tsx
function DropdownExample() {
  const triggerRef = useRef()
  const [open, setOpen] = useState(false)
  
  const handleClose = () => {
    setOpen(false)
    // Focus returns to trigger
    triggerRef.current?.focus()
  }
  
  return (
    <>
      <Button ref={triggerRef} onClick={() => setOpen(true)}>
        Open Menu
      </Button>
      <Menu open={open} onClose={handleClose}>
        {/* Menu content */}
      </Menu>
    </>
  )
}
```

### Skip Links
Navigation includes skip links:

```tsx
<Navigation
  skipLinks={[
    { label: 'Skip to main content', href: '#main' },
    { label: 'Skip to footer', href: '#footer' }
  ]}
/>
```

## Component-Specific Patterns

### Form Components

#### Input Accessibility
```tsx
<Input
  label="Email"
  type="email"
  required
  helperText="Enter your email address"
  error={errors.email}
  errorText="Please enter a valid email"
  // Renders with:
  // - Associated label
  // - aria-required="true"
  // - aria-invalid when error
  // - aria-describedby for helper/error text
/>
```

#### Checkbox/Radio Groups
```tsx
<fieldset>
  <legend>Notification Preferences</legend>
  <FormGroup>
    <Checkbox
      label="Email notifications"
      checked={emailEnabled}
      onChange={setEmailEnabled}
      inputProps={{
        'aria-describedby': 'email-help'
      }}
    />
    <Typography id="email-help" variant="caption">
      Receive updates via email
    </Typography>
  </FormGroup>
</fieldset>
```

#### Form Validation
```tsx
// Accessible error messages
<Form
  onSubmit={handleSubmit}
  validationSchema={schema}
  errorSummary={{
    show: true,
    title: 'Please fix the following errors:',
    focusOnError: true
  }}
/>
```

### Navigation Components

#### Menu Accessibility
```tsx
<Navigation
  items={[
    {
      label: 'Products',
      ariaLabel: 'Products menu',
      children: [
        { label: 'All Products', href: '/products' },
        { label: 'Categories', href: '/categories' }
      ]
    }
  ]}
  // Implements:
  // - Keyboard navigation
  // - ARIA menu pattern
  // - Focus management
  // - Screen reader announcements
/>
```

#### Breadcrumbs
```tsx
<nav aria-label="Breadcrumb">
  <ol>
    <li>
      <a href="/">Home</a>
    </li>
    <li aria-current="page">
      Current Page
    </li>
  </ol>
</nav>
```

### Data Display

#### Tables
```tsx
<DataTable
  caption="User Account List"
  summary="Table showing user accounts with status and actions"
  data={users}
  columns={[
    {
      id: 'name',
      label: 'Name',
      sortable: true,
      ariaSort: sortDirection
    }
  ]}
  // Features:
  // - Column headers with scope
  // - Row headers where applicable
  // - Sort announcements
  // - Selection announcements
/>
```

#### Lists
```tsx
<List
  aria-label="Search results"
  items={results}
  emptyState={{
    title: 'No results found',
    description: 'Try adjusting your search terms'
  }}
  renderItem={(item) => (
    <ListItem
      aria-label={`${item.name}, ${item.description}`}
    >
      {/* Item content */}
    </ListItem>
  )}
/>
```

### Feedback Components

#### Alerts
```tsx
<Alert
  variant="error"
  role="alert"
  aria-live="assertive"
  action={
    <Button aria-label="Dismiss error">
      Dismiss
    </Button>
  }
>
  An error occurred while saving
</Alert>
```

#### Loading States
```tsx
<Skeleton
  aria-label="Loading content"
  role="status"
  aria-live="polite"
>
  <span className="sr-only">Loading...</span>
</Skeleton>
```

## Testing Accessibility

### Automated Testing

#### Jest/Vitest Tests
```tsx
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Button accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <Button onClick={() => {}}>
        Click me
      </Button>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  it('should have proper ARIA attributes', () => {
    render(
      <Button disabled aria-label="Save document">
        Save
      </Button>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Save document')
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })
})
```

#### Storybook Integration
```tsx
// .storybook/preview.js
export const parameters = {
  a11y: {
    element: '#root',
    config: {
      rules: [
        {
          id: 'color-contrast',
          enabled: true
        }
      ]
    }
  }
}
```

### Manual Testing

#### Keyboard Testing Checklist
- [ ] All interactive elements reachable via Tab
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] No keyboard traps
- [ ] Escape key closes modals/menus
- [ ] Enter/Space activate buttons
- [ ] Arrow keys work in menus/lists

#### Screen Reader Testing
Test with multiple screen readers:
- **NVDA** (Windows): Free, widely used
- **JAWS** (Windows): Commercial, enterprise
- **VoiceOver** (macOS/iOS): Built-in
- **TalkBack** (Android): Built-in

#### Browser Tools
- Chrome DevTools Lighthouse
- Firefox Accessibility Inspector
- axe DevTools extension
- WAVE browser extension

## Checklist

### Development Checklist
- [ ] Semantic HTML used appropriately
- [ ] ARIA attributes added where needed
- [ ] Keyboard navigation implemented
- [ ] Focus management handled
- [ ] Color contrast meets WCAG AA
- [ ] Error messages are descriptive
- [ ] Loading states announced
- [ ] Images have alt text
- [ ] Forms have labels
- [ ] Tables have headers

### Testing Checklist
- [ ] Automated accessibility tests pass
- [ ] Keyboard-only navigation works
- [ ] Screen reader testing completed
- [ ] High contrast mode tested
- [ ] Zoom to 200% tested
- [ ] Motion preferences respected

### Review Checklist
- [ ] WCAG 2.1 Level AA compliance
- [ ] Documentation includes a11y notes
- [ ] Examples show accessible usage
- [ ] Known issues documented

## Resources

### External Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Internal Documentation
- [Component Usage Guide](./COMPONENT_USAGE_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Storybook Examples](http://localhost:6006)