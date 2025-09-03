# Source Tree

## Directory Structure

The project follows **Feature-Sliced Design (FSD)** architecture combined with **Atomic Design** principles for UI components.

```
src/
├── app/                    # Application layer (Next.js App Router)
│   ├── config/            # App configuration
│   ├── providers/         # React providers (Redux, Theme, etc.)
│   ├── styles/            # Global styles
│   ├── types/             # Application-wide types
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── store.ts           # Redux store configuration
│   ├── hooks.ts           # Typed Redux hooks
│   └── theme.ts           # Material UI theme configuration
│
├── pages/                 # Pages layer (FSD)
│   ├── editor/           # Editor page slice
│   │   ├── ui/           # Page components
│   │   └── index.ts      # Public API
│   ├── home/             # Home page slice
│   │   ├── ui/           # Page components
│   │   └── index.ts      # Public API
│   └── settings/         # Settings page slice
│       ├── ui/           # Page components
│       └── index.ts      # Public API
│
├── widgets/              # Widgets layer (complex UI blocks)
│   ├── header/          # Header widget
│   │   ├── ui/          # Widget components
│   │   └── index.ts     # Public API
│   ├── editor-panel/    # Editor panel widget
│   │   ├── ui/          # Widget components
│   │   └── index.ts     # Public API
│   └── sidebar/         # Sidebar widget
│       ├── ui/          # Widget components
│       └── index.ts     # Public API
│
├── features/            # Features layer (business logic)
│   ├── auth/           # Authentication feature
│   │   ├── model/      # Redux slices and logic
│   │   │   └── __tests__/
│   │   └── index.ts    # Public API
│   ├── theme-toggle/   # Theme switching feature
│   │   ├── ui/         # Feature components
│   │   └── index.ts    # Public API
│   ├── tpn-calculations/ # TPN medical calculations
│   │   ├── model/      # Business logic
│   │   │   └── __tests__/
│   │   └── index.ts    # Public API
│   └── ui/             # UI state management
│       ├── model/      # UI-related Redux slices
│       │   └── __tests__/
│       └── index.ts    # Public API
│
├── entities/           # Entities layer (business entities)
│   ├── content/        # Content entity
│   │   ├── model/      # Entity logic
│   │   ├── types/      # Entity types
│   │   └── index.ts    # Public API
│   ├── session/        # Session entity
│   │   ├── model/      # Entity logic
│   │   ├── types/      # Entity types
│   │   └── index.ts    # Public API
│   └── user/           # User entity
│       ├── model/      # Entity logic and tests
│       ├── types/      # Entity types
│       └── index.ts    # Public API
│
├── shared/             # Shared layer (reusable utilities)
│   ├── api/           # API client and utilities
│   ├── config/        # Shared configuration
│   ├── lib/           # Utility libraries
│   ├── types/         # Shared TypeScript types
│   └── ui/            # Atomic Design UI components
│       ├── atoms/     # Basic UI elements
│       ├── molecules/ # Compound components
│       └── organisms/ # Complex components
│
├── stories/           # Storybook stories (if using)
│
└── test/              # Test utilities and mocks

public/                # Static assets
├── images/
├── fonts/
└── icons/

docs/                  # Documentation
├── architecture/      # Architecture documentation
├── prd/              # Product Requirements
├── qa/               # QA documentation
└── stories/          # User stories

.bmad-core/           # BMAD system files
├── tasks/
├── templates/
├── checklists/
└── core-config.yaml
```

## Layer Dependencies (FSD Rules)

Per Feature-Sliced Design, layers can only import from layers below them:

```
app → pages → widgets → features → entities → shared
```

- **app**: Can import from all layers
- **pages**: Can import from widgets, features, entities, shared
- **widgets**: Can import from features, entities, shared
- **features**: Can import from entities, shared
- **entities**: Can import from shared only
- **shared**: Cannot import from other layers (self-contained)

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase.tsx | `EditorPage.tsx` |
| TypeScript modules | camelCase.ts | `contentModel.ts` |
| Test files | *.test.ts(x) | `userModel.test.ts` |
| Stories | *.stories.tsx | `HeaderWidget.stories.tsx` |
| API routes | kebab-case | `/api/generate-tests` |
| Directories | kebab-case | `theme-toggle/` |
| Index files | index.ts | Public API exports |

## Import Aliases

The project uses TypeScript path aliases configured in `tsconfig.json`:

```typescript
// Use absolute imports with @ alias
import { Button } from '@/shared/ui/atoms';
import { useAuth } from '@/features/auth';
import { User } from '@/entities/user';
```

## Key Directories

### `/src/app`
Next.js 15 App Router directory. Contains layouts, pages, and application-wide configuration.

### `/src/pages`
FSD pages layer. Each subdirectory represents a complete page with its UI components and logic.

### `/src/widgets`
Complex, reusable UI blocks that combine multiple features. Examples: Header, Sidebar, Dashboard panels.

### `/src/features`
Business logic and user interactions. Each feature is self-contained with its own model (Redux slices) and UI.

### `/src/entities`
Core business entities with their data models and types. Foundation for features.

### `/src/shared`
Reusable code used across all layers:
- **ui/**: Atomic Design components (atoms → molecules → organisms)
- **api/**: API clients and HTTP utilities
- **lib/**: Helper functions and utilities
- **types/**: Shared TypeScript definitions

## Component Organization (Atomic Design)

Within UI directories, components follow Atomic Design:

1. **Atoms** (`shared/ui/atoms/`): Basic HTML elements
   - Button, Input, Icon, Label

2. **Molecules** (`shared/ui/molecules/`): Simple component groups
   - SearchForm, Card, MenuItem

3. **Organisms** (`shared/ui/organisms/`): Complex UI sections
   - NavigationBar, DataTable, Modal

Feature-specific components live within their feature's `ui/` directory and can compose shared components.

## Testing Structure

Tests are co-located with the code they test:
- Unit tests: `*.test.ts(x)` files next to source
- Integration tests: `__tests__/` directories
- E2E tests: `/tests/e2e/` (root level)

## Build Output

- `.next/`: Next.js build output
- `dist/`: Production build (if applicable)
- `node_modules/`: Dependencies