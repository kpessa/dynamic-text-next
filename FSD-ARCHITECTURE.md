# Feature-Sliced Design (FSD) Architecture

## Overview

This project follows Feature-Sliced Design (FSD), a frontend architectural methodology that provides explicit, predictable structure through layers and slices. Combined with Atomic Design for UI components, it creates a scalable and maintainable codebase.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         App Layer                           │
│  (Providers, Store, Global Styles, Theme Configuration)     │
└──────────────────────────┬──────────────────────────────────┘
                           │ imports ↓
┌─────────────────────────────────────────────────────────────┐
│                        Pages Layer                          │
│     (HomePage, EditorPage, SettingsPage - Routing)          │
└──────────────────────────┬──────────────────────────────────┘
                           │ imports ↓
┌─────────────────────────────────────────────────────────────┐
│                       Widgets Layer                         │
│   (HeaderWidget, SidebarWidget, EditorPanelWidget)          │
└──────────────────────────┬──────────────────────────────────┘
                           │ imports ↓
┌─────────────────────────────────────────────────────────────┐
│                      Features Layer                         │
│        (theme-toggle, authentication, content-editor)       │
└──────────────────────────┬──────────────────────────────────┘
                           │ imports ↓
┌─────────────────────────────────────────────────────────────┐
│                      Entities Layer                         │
│          (user, content, session - Domain Models)           │
└──────────────────────────┬──────────────────────────────────┘
                           │ imports ↓
┌─────────────────────────────────────────────────────────────┐
│                       Shared Layer                          │
│    (ui/atoms, ui/molecules, lib, api, config - Reusable)   │
└─────────────────────────────────────────────────────────────┘
```

## Layer Descriptions

### 1. App Layer (`/src/app`)
**Purpose**: Application initialization and global configuration
- Next.js App Router pages
- Redux store configuration
- Global providers (Theme, Redux)
- Global styles and CSS variables
- Root layout configuration

### 2. Pages Layer (`/src/pages`)
**Purpose**: Route-level components that compose the application screens
- One folder per route
- Composes widgets and features
- No business logic, only composition
- Connected to Next.js routing

### 3. Widgets Layer (`/src/widgets`)
**Purpose**: Complex UI compositions that combine multiple features
- Self-contained UI sections
- Combines features and entities
- Examples: Header with navigation, Sidebar with file list
- Can have local state for UI concerns

### 4. Features Layer (`/src/features`)
**Purpose**: Business logic and user interactions
- User actions and workflows
- Domain-specific functionality
- Examples: Authentication, Theme toggling, Content editing
- Contains UI, model, and API integration

### 5. Entities Layer (`/src/entities`)
**Purpose**: Business objects and domain models
- Core data structures
- Business rules and validations
- Domain logic
- Examples: User, Content, Session

### 6. Shared Layer (`/src/shared`)
**Purpose**: Reusable code shared across all layers
- **ui**: Atomic Design components (atoms, molecules, organisms)
- **lib**: Utility functions and helpers
- **api**: API types and interfaces
- **config**: Constants and configuration

## Dependency Rules

### Strict Import Rules
1. **Layers can only import from lower layers**
2. **No circular dependencies allowed**
3. **Shared layer can be imported by any layer**
4. **Cross-slice imports within same layer are forbidden**

### Valid Import Examples
```typescript
// ✅ Page importing from widgets
import { HeaderWidget } from '@/widgets/header'

// ✅ Widget importing from features
import { ThemeToggle } from '@/features/theme-toggle'

// ✅ Feature importing from entities
import { UserModel } from '@/entities/user'

// ✅ Any layer importing from shared
import { Button } from '@/shared/ui/atoms/Button'
```

### Invalid Import Examples
```typescript
// ❌ Entity importing from feature (lower → higher)
import { authService } from '@/features/auth'

// ❌ Cross-slice import in same layer
// In features/auth:
import { something } from '@/features/profile'

// ❌ Widget importing from pages
import { HomePage } from '@/pages/home'
```

## Slice Structure

Each slice follows a consistent structure:

```
feature-name/
├── ui/              # UI components (Atomic Design)
│   ├── atoms/       # Basic building blocks
│   ├── molecules/   # Simple combinations
│   └── organisms/   # Complex sections
├── model/           # Business logic and state
├── api/             # External API integration
├── lib/             # Slice-specific utilities
├── __tests__/       # Tests for the slice
└── index.ts         # Public API exports
```

## Atomic Design Integration

Within each slice's `ui/` folder, we follow Atomic Design principles:

### Atoms
- Single HTML elements
- Basic building blocks
- Examples: Button, Input, Icon

### Molecules
- Simple component combinations
- Examples: SearchInput, FormField

### Organisms
- Complex UI sections
- Examples: Header, Sidebar, Forms

### Templates
- Page-level layouts (in shared/ui/templates)
- Define content structure

## Path Aliases

Configured TypeScript path aliases for clean imports:

```json
{
  "@/*": ["./src/*"],
  "@/app/*": ["./src/app/*"],
  "@/pages/*": ["./src/pages/*"],
  "@/widgets/*": ["./src/widgets/*"],
  "@/features/*": ["./src/features/*"],
  "@/entities/*": ["./src/entities/*"],
  "@/shared/*": ["./src/shared/*"]
}
```

## Testing Strategy

### Test Organization
```
slice-name/__tests__/
├── unit/         # Unit tests for logic
├── integration/  # Component integration tests
└── e2e/          # End-to-end tests
```

### Test Coverage Requirements
- Entities: 100% unit test coverage
- Features: Business logic unit tests + UI integration tests
- Widgets: Integration tests
- Pages: E2E tests for critical paths

## Validation Tools

### ESLint Boundaries
- Configured with `eslint-plugin-boundaries`
- Enforces layer dependencies
- Run: `pnpm lint:fsd`

### Circular Dependency Check
- Using `madge` for detection
- Run: `npx madge --circular src/`
- Currently: ✅ No circular dependencies

## Best Practices

### 1. Public API Design
- Each slice exports only necessary interfaces through `index.ts`
- Keep internal implementation details private
- Document exported APIs

### 2. State Management
- Global state in app layer (Redux)
- Feature state in feature slices
- UI state local to components

### 3. Code Organization
- One slice = one domain concern
- Keep slices small and focused
- Extract common code to shared layer

### 4. Naming Conventions
- PascalCase for components
- camelCase for functions/variables
- kebab-case for folders
- UPPER_CASE for constants

## Migration Guide

When adding new code:

1. **Identify the layer**: Is it a route, widget, feature, entity, or shared?
2. **Create slice structure**: Follow the standard folder structure
3. **Define public API**: Export through index.ts
4. **Write tests**: Co-locate with source code
5. **Validate dependencies**: Run ESLint and madge checks

## Common Patterns

### Feature with UI
```typescript
// features/my-feature/ui/MyFeatureComponent.tsx
import { useMyFeatureModel } from '../model'
import { Button } from '@/shared/ui/atoms'

// features/my-feature/model/index.ts
export const useMyFeatureModel = () => {
  // Business logic
}

// features/my-feature/index.ts
export { MyFeatureComponent } from './ui/MyFeatureComponent'
```

### Entity with Model
```typescript
// entities/my-entity/types/index.ts
export interface MyEntity {
  id: string
  // ...
}

// entities/my-entity/model/myEntityModel.ts
export class MyEntityModel {
  // Business logic
}

// entities/my-entity/index.ts
export type { MyEntity } from './types'
export { MyEntityModel } from './model/myEntityModel'
```

## Resources

- [Feature-Sliced Design Documentation](https://feature-sliced.design/)
- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)
- [Project Migration Story](./stories/STORY-005-fsd-architecture.md)