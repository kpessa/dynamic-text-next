# Dynamic Text Editor - Next.js

A specialized web application for creating and testing dynamic text content with TPN (Total Parenteral Nutrition) advisor functions, migrated from Svelte 5 to Next.js 15 with React.

## 🚀 Project Status

This is the Next.js/React migration of the original Dynamic Text Editor Svelte application. The migration was necessary due to Svelte 5's incompatibility with Storybook 8.

### Migration Progress
- ✅ Next.js 15 with App Router
- ✅ Redux Toolkit state management
- ✅ Material UI v7 design system
- ✅ Storybook 8 component documentation
- ✅ FSD (Feature-Sliced Design) architecture
- ✅ Atomic Design component structure
- 🚧 Core UI components library (in progress)
- 📋 Firebase integration (planned)
- 📋 TPN features migration (planned)

## 🏗️ Architecture

### Feature-Sliced Design (FSD) + Atomic Design
```
src/
├── app/          # Application layer (providers, store, routing)
├── pages/        # Pages layer (route components)
├── widgets/      # Complex UI compositions
├── features/     # Business logic and features
├── entities/     # Domain models and objects
└── shared/       # Reusable components (atoms, molecules, organisms)
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.2 with Turbopack
- **Language**: TypeScript 5 (strict mode)
- **UI Library**: Material UI v7.3.2
- **State Management**: Redux Toolkit 2.8.2
- **Styling**: Tailwind CSS 4 + Material UI theming
- **Component Docs**: Storybook 8.6
- **Testing**: Vitest 3.2.4
- **Build Tool**: Turbopack (Next.js 15)

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd dynamic-text-next

# Install dependencies
pnpm install
```

## 🚀 Development

```bash
# Start development server
pnpm dev

# Start Storybook
pnpm storybook

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint

# FSD architecture validation
pnpm lint:fsd
```

## 📁 Project Structure

### Key Directories
- `/src/app` - Next.js App Router and global providers
- `/src/pages` - FSD pages layer with route components
- `/src/widgets` - Complex UI sections (Header, Sidebar, etc.)
- `/src/features` - Business features (theme-toggle, etc.)
- `/src/entities` - Domain models (user, content, session)
- `/src/shared` - Reusable UI components and utilities
  - `/ui/atoms` - Basic building blocks (Button, Input, etc.)
  - `/ui/molecules` - Simple combinations (Card, FormField, etc.)
  - `/ui/organisms` - Complex sections
  - `/lib` - Utility functions
  - `/config` - Configuration constants

### FSD Import Rules
- Higher layers can import from lower layers only
- No circular dependencies allowed
- Shared layer can be imported by any layer
- Use path aliases: `@/shared`, `@/features`, etc.

## 🎨 Storybook

Component documentation is available at http://localhost:6006

- Comprehensive component stories
- Interactive controls
- Accessibility documentation
- Dark/light theme switching

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run tests with UI
pnpm test:ui

# Test coverage
pnpm test:coverage
```

## 📝 Documentation

- [FSD Architecture Guide](./FSD-ARCHITECTURE.md)
- [Migration Stories](./MIGRATION-STORIES.md)
- [Story Documentation](./docs/stories/)

## 🔗 Environment Variables

Create a `.env.local` file with:
```env
# Firebase Configuration (when implemented)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# AI Services (when implemented)
GEMINI_API_KEY=
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Material UI Documentation](https://mui.com/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)
- [Storybook Documentation](https://storybook.js.org/)

## 🚀 Deployment

The application can be deployed on Vercel:

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 📄 License

Private project - All rights reserved