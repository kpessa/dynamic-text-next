# Frontend Architecture

Define frontend-specific architecture details following FSD + Atomic Design patterns.

## Component Architecture

### Component Organization (FSD + Atomic)
```
src/
├── app/                    # Next.js App Router + global providers
│   ├── (auth)/            # Auth group routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── pages/                  # FSD Pages layer
│   ├── editor/            # Editor page components
│   ├── simulations/       # Simulations page
│   └── references/        # References management
├── widgets/                # Complex UI sections (<500 lines each)
│   ├── tpn-editor/        # TPN editor widget
│   ├── code-editor/       # Code editor with preview
│   ├── test-panel/        # Test execution panel
│   └── section-manager/   # Section management
├── features/               # Business features
│   ├── tpn-calculations/  # TPN calculation logic
│   ├── code-execution/    # Sandboxed code execution
│   ├── test-generation/   # AI test generation
│   └── versioning/        # Version control
├── entities/               # Business entities
│   ├── section/           # Section entity
│   ├── reference/         # Reference entity
│   ├── ingredient/        # Ingredient entity
│   └── simulation/        # Simulation entity
└── shared/                 # Shared code
    ├── ui/                # Atomic Design components
    │   ├── atoms/         # Basic elements
    │   ├── molecules/     # Component groups
    │   └── organisms/     # Complex sections
    ├── lib/               # Utilities
    ├── hooks/             # Custom React hooks
    └── types/             # TypeScript types

```

### Component Size Rules (from Parent Project)
- **Maximum 500 lines per component**
- Break down larger components into:
  - Container component (logic)
  - Presentational components (UI)
  - Custom hooks (reusable logic)

## State Management Architecture

### Redux Store Structure
```typescript
interface RootState {
  auth: AuthState;
  sections: SectionState;
  references: ReferenceState;
  simulations: SimulationState;
  ingredients: IngredientState;
  ui: UIState;
}

// Section state aligned with parent project
interface SectionState {
  sections: Section[];
  activeSectionId: number | null;
  testResults: TestSummary | null;
  isDirty: boolean;
}

// Reference state for workspace
interface ReferenceState {
  references: LoadedReference[];
  activeReferenceId: string | null;
  validationData: ValidationData | null;
}
```

## Routing Architecture

### Next.js App Router Structure
```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── page.tsx           # Dashboard home
│   ├── editor/
│   │   └── [id]/
│   │       └── page.tsx   # Editor with reference ID
│   ├── simulations/
│   │   ├── page.tsx       # Simulations list
│   │   └── [id]/
│   │       └── page.tsx   # Simulation details
│   └── references/
│       └── page.tsx       # References management
└── api/
    ├── auth/
    ├── simulations/
    ├── generate-tests/    # AI test generation
    └── sections/
```

## Code Execution Architecture (Critical from Parent)

### Secure Sandbox Implementation
```typescript
class SecureCodeExecutor {
  private worker: Worker;
  
  async execute(code: string, context: TPNContext): Promise<Result> {
    // 1. Sanitize code
    const sanitized = DOMPurify.sanitize(code);
    
    // 2. Transpile with Babel
    const transpiled = Babel.transform(sanitized, {
      presets: ['env'],
      plugins: ['transform-runtime']
    });
    
    // 3. Create safe context
    const safeContext = {
      values: context.values,
      advisorType: context.advisorType,
      getValue: (key: string) => context.values[key],
      hasValue: (key: string) => key in context.values,
      maxP: (value: number, precision = 2) => value.toFixed(precision)
    };
    
    // 4. Execute in Worker with timeout
    return this.executeInWorker(transpiled, safeContext, 5000);
  }
}
```
