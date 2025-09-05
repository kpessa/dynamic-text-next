# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
# Development
pnpm dev                  # Start Next.js dev server with Turbopack (http://localhost:3000)
pnpm storybook           # Start Storybook for component development (http://localhost:6006)

# Testing
pnpm test                # Run all tests with Vitest
pnpm test src/shared/ui/atoms/Button/  # Test specific component directory
pnpm test:ui             # Run tests with Vitest UI interface
pnpm test:coverage       # Generate test coverage report

# Code Quality
pnpm lint                # Run ESLint on entire codebase
pnpm lint:fsd           # Validate FSD architecture rules (layer dependencies)
pnpm typecheck          # Run TypeScript type checking without emit

# Building
pnpm build              # Build Next.js app with Turbopack
pnpm build-storybook    # Build static Storybook

# Visual Testing
pnpm chromatic          # Run Chromatic visual regression tests (requires token)
pnpm dlx chromatic --project-token=<token> --exit-once-uploaded  # Quick Chromatic run
```

## Architecture Overview

This is a Next.js 15 application using **Feature-Sliced Design (FSD)** combined with **Atomic Design** for component structure. The project was migrated from Svelte 5 due to Storybook compatibility issues.

### Layer Hierarchy (FSD)
```
app → pages → widgets → features → entities → shared
```
**Critical Rule**: Higher layers can ONLY import from lower layers. No circular dependencies.

### Project Structure
```
src/
├── app/          # Next.js App Router, providers, store config
├── pages/        # FSD pages layer (route compositions)
├── widgets/      # Complex UI sections (Header, Sidebar)
├── features/     # Business features with UI and logic
├── entities/     # Domain models and business objects
└── shared/       # Reusable code (ALL layers can import)
    ├── ui/
    │   ├── atoms/      # Basic elements (Button, Input)
    │   ├── molecules/  # Simple combinations (FormField, SearchBar)
    │   └── organisms/  # Complex sections
    ├── lib/            # Utilities and helpers
    ├── api/           # API types and interfaces
    └── config/        # Constants and configuration
```

### Import Path Aliases
```typescript
@/app/*       // App layer
@/pages/*     // Pages layer
@/widgets/*   // Widgets layer
@/features/*  // Features layer
@/entities/*  // Entities layer
@/shared/*    // Shared layer
```

## Component Development Workflow

### Creating New Components

1. **Determine the layer**: Is it shared UI (atom/molecule) or feature-specific?
2. **Follow the structure**:
```
ComponentName/
├── ComponentName.tsx      # Component implementation
├── ComponentName.types.ts # TypeScript interfaces
├── ComponentName.test.tsx # Vitest tests
├── ComponentName.stories.tsx # Storybook stories
└── index.ts               # Public API exports
```

3. **Required in every story file**:
```typescript
import React from 'react'  // ALWAYS include this for production builds
```

### Material UI Integration
- Using MUI v7.3.2 with custom theming
- Components extend MUI with CVA (class-variance-authority) for variants
- Always check for existing MUI components before creating custom ones

## Testing Requirements

### Unit Tests (Vitest)
- All components must have corresponding `.test.tsx` files
- Use `@testing-library/react` for component testing
- Mock MUI components when needed
- Run specific tests: `pnpm test path/to/component/`

### Visual Testing (Chromatic)
- Every component needs comprehensive Storybook stories
- Include all variants and states in stories
- Token required for Chromatic: Set `CHROMATIC_PROJECT_TOKEN` in `.env.local`

## State Management

### Redux Toolkit Setup
- Store configuration in `/src/app/store/`
- Feature slices in respective feature folders
- Use Redux Persist for critical state
- Follow Redux Toolkit best practices

## Critical Development Rules

1. **FSD Layer Dependencies**: NEVER import from higher layers
2. **React Imports**: Always include `import React from 'react'` in story files
3. **Test Before Commit**: Run `pnpm test` and `pnpm typecheck`
4. **Component Structure**: Follow Atomic Design within FSD layers
5. **Package Manager**: ALWAYS use `pnpm`, never npm or yarn

## Component Library Status

### Completed Components (Phase 1-3)
**Atoms (10)**: Input, Select, Checkbox, Radio, Typography, Alert, Badge, Chip, Progress, Skeleton
**Molecules (5)**: FormField, SearchBar, DatePicker, FileUpload, Pagination

### Known Issues & Fixes

1. **Select Component Label Overlap**: Fixed by proper label/placeholder handling
2. **DatePicker Import**: Use `@mui/x-date-pickers/AdapterDateFns` not `AdapterDateFnsV3`
3. **Storybook React Errors**: All story files need explicit React import

## Git Workflow

### Committing Changes
```bash
git add -A
git commit -m "type: Description

- Detail 1
- Detail 2

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Creating Pull Requests
```bash
gh pr create --title "Title" --body "$(cat <<'EOF'
## Summary
- Change description

## Test plan
- [ ] Tests pass
- [ ] Storybook builds
- [ ] Visual regression checked

🤖 Generated with Claude Code
EOF
)"
```

## Environment Configuration

### Required Environment Variables
```env
# .env.local
CHROMATIC_PROJECT_TOKEN=your-token-here

# Future Firebase integration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```

## Debugging & Troubleshooting

### Common Issues

1. **Storybook Build Errors**: Check for missing React imports
2. **Test Failures**: Verify MUI component behavior hasn't changed
3. **FSD Violations**: Run `pnpm lint:fsd` to check layer dependencies
4. **Type Errors**: Run `pnpm typecheck` to identify issues

### Validation Commands
```bash
npx madge --circular src/  # Check for circular dependencies
pnpm lint:fsd              # Validate FSD architecture
pnpm typecheck             # TypeScript validation
```

## Performance Considerations

- Next.js 15 with Turbopack for faster builds
- Lazy load heavy components
- Use React.memo for expensive renders
- Implement virtualization for long lists
- Bundle size monitoring with Chromatic

## Documentation References

- [FSD Architecture Guide](./FSD-ARCHITECTURE.md)
- [Chromatic Setup](./docs/CHROMATIC_SETUP.md)
- [Migration Stories](./docs/stories/)
- Component stories in Storybook: http://localhost:6006