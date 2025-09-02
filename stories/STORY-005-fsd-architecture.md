# STORY-005: FSD Architecture Migration

## Status: Ready for Review
**Epic**: 5 - Architecture Foundation
**Story**: 5.1
**Developer**: AI Developer Agent
**Created**: 2025-01-02
**Target Sprint**: Next Sprint

## Story Statement
As a development team, we need to complete the Feature-Sliced Design (FSD) architecture migration with proper layer organization, strict dependency rules, and Atomic Design integration so that our Next.js/React application has a scalable, maintainable structure that prevents technical debt and enables parallel feature development.

## Acceptance Criteria
1. ✅ **GIVEN** the existing codebase **WHEN** FSD layers are implemented **THEN** all 6 layers (app, pages, widgets, features, entities, shared) must be properly structured
2. ✅ **GIVEN** existing components **WHEN** migrated to FSD **THEN** each component must be in its correct layer following dependency rules
3. ✅ **GIVEN** the FSD architecture **WHEN** imports are analyzed **THEN** no circular dependencies or cross-layer violations exist
4. ✅ **GIVEN** TypeScript configuration **WHEN** path aliases are used **THEN** all FSD layers have working import aliases (@/app, @/pages, etc.)
5. ✅ **GIVEN** ESLint configuration **WHEN** boundaries plugin is configured **THEN** import violations are automatically detected
6. ✅ **GIVEN** each FSD slice **WHEN** public API is defined **THEN** index.ts files export only intended interfaces
7. ✅ **GIVEN** the migration **WHEN** complete **THEN** architecture documentation and dependency diagram exist

## Dev Notes

### Current State Analysis
[Source: Project inspection and CLAUDE.md analysis]
- **Existing FSD Structure**: Partial implementation in `/src`
  - ✅ `app/` layer exists with providers, store, styles, theme
  - ✅ `shared/ui/` has Atomic Design structure (atoms, molecules)
  - ✅ `features/theme-toggle` implemented correctly
  - ❌ Missing: pages, widgets, entities layers
  - ❌ Missing: ESLint boundaries configuration
  - ❌ Missing: Complete path alias configuration

### Architecture Requirements
[Source: CLAUDE.md#69-469]
- **Layer Hierarchy**: app → pages → widgets → features → entities → shared
- **Dependency Rules**: Higher layers import from lower, no reverse imports
- **Atomic Design Integration**: Within ui/ folders of each slice
- **TypeScript**: Strict mode enabled, full type safety required
- **Testing**: Co-located __tests__ folders in each slice

### Technical Stack Context
[Source: package.json, tsconfig.json]
- **Framework**: Next.js 15.5.2 with App Router
- **UI Library**: Material UI v7.3.2
- **State Management**: Redux Toolkit 2.8.2
- **Styling**: Tailwind CSS 4 + Material UI
- **Testing**: Vitest 3.2.4
- **Component Development**: Storybook 8.6.14
- **Linting**: ESLint 9 with TypeScript parser

### File Structure Requirements
[Source: CLAUDE.md#72-101, #106-131]
```
src/
├── app/                    # ✅ Exists (partial)
│   ├── providers/         # ✅ Redux provider exists
│   ├── store/            # ✅ Redux store configured
│   ├── styles/           # ✅ Global styles
│   └── theme.ts          # ✅ Material UI theme
├── pages/                  # ❌ Create
│   ├── home/
│   ├── editor/
│   └── settings/
├── widgets/                # ❌ Create
│   ├── header/
│   ├── sidebar/
│   └── editor-panel/
├── features/               # ⚠️ Partial
│   ├── theme-toggle/      # ✅ Exists
│   ├── authentication/    # ❌ Create
│   └── content-editor/    # ❌ Create
├── entities/               # ❌ Create
│   ├── user/
│   ├── content/
│   └── session/
└── shared/                 # ⚠️ Partial
    ├── ui/                # ✅ Exists with Atomic Design
    ├── lib/               # ❌ Create
    ├── api/               # ❌ Create
    └── config/            # ❌ Create
```

### Import Alias Configuration
[Source: Need to implement in tsconfig.json]
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/widgets/*": ["./src/widgets/*"],
      "@/features/*": ["./src/features/*"],
      "@/entities/*": ["./src/entities/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

### ESLint Boundaries Configuration
[Source: To be implemented]
- Install: `eslint-plugin-boundaries`
- Configure layer restrictions in `.eslintrc.fsd.json`
- Add pre-commit hooks with husky

### Component Migration Map
[Source: Current codebase analysis]
1. **Atoms to Keep**: Button, MuiButton
2. **Molecules to Keep**: Card
3. **Features to Keep**: theme-toggle
4. **New Entities Needed**: user, content, session
5. **New Widgets Needed**: header, sidebar, editor-panel
6. **New Pages Needed**: home, editor, settings

## Tasks / Subtasks

### Phase 1: Foundation Setup
1. **Configure TypeScript Path Aliases** (AC: 4)
   - [x] Update tsconfig.json with FSD path mappings
   - [x] Update next.config.ts to support path aliases
   - [x] Test imports work in development and build
   - [x] Update Storybook config to recognize aliases

2. **Install and Configure ESLint Boundaries** (AC: 5)
   - [x] Run: `pnpm add -D eslint-plugin-boundaries`
   - [x] Create `.eslintrc.fsd.json` with layer rules
   - [x] Add FSD-specific lint script to package.json
   - [x] Test boundary violations are detected

### Phase 2: Create Missing Layers
3. **Implement Entities Layer** (AC: 1, 2)
   - [x] Create `/src/entities` directory structure
   - [x] Implement user entity with types and model
   - [x] Implement content entity for dynamic text
   - [x] Implement session entity for auth state
   - [x] Add index.ts exports for each entity
   - [x] Write unit tests for entity models

4. **Implement Widgets Layer** (AC: 1, 2)
   - [x] Create `/src/widgets` directory structure
   - [x] Build HeaderWidget composing navigation features
   - [x] Build SidebarWidget for app navigation
   - [x] Build EditorPanelWidget for main content area
   - [x] Ensure widgets only import from features/entities/shared
   - [x] Add Storybook stories for each widget

5. **Implement Pages Layer** (AC: 1, 2)
   - [x] Create `/src/pages` directory structure
   - [x] Build HomePage using widgets and features
   - [x] Build EditorPage with editor functionality
   - [x] Build SettingsPage for configuration
   - [x] Ensure pages only compose widgets, no direct UI
   - [x] Connect pages to Next.js App Router

### Phase 3: Migrate Existing Code
6. **Reorganize Shared Layer** (AC: 2, 6)
   - [x] Create `/src/shared/lib` for utilities
   - [x] Create `/src/shared/api` for API types
   - [x] Create `/src/shared/config` for constants
   - [x] Move firebase utilities to shared/lib
   - [x] Update all imports to use new paths

7. **Migrate App Layer Components** (AC: 2, 3)
   - [x] Move page components to pages layer
   - [x] Keep only providers and global config in app
   - [x] Update app/layout.tsx to use pages layer
   - [x] Fix any circular dependency issues

### Phase 4: Validation and Documentation
8. **Validate Architecture Compliance** (AC: 3, 5)
   - [x] Run full ESLint with boundaries check
   - [x] Use madge to detect circular dependencies
   - [x] Fix any detected violations
   - [ ] Add pre-commit hook for FSD validation

9. **Create Architecture Documentation** (AC: 7)
   - [x] Generate dependency graph with madge (text-based)
   - [x] Create FSD-ARCHITECTURE.md guide
   - [x] Document migration decisions
   - [x] Add examples for each layer type
   - [x] Create developer onboarding guide

### Phase 5: Testing
10. **Comprehensive Testing** (AC: all)
    - [x] Unit tests for all new entities
    - [x] Integration tests for widgets
    - [ ] E2E tests for critical user flows (deferred)
    - [ ] Visual regression tests in Storybook (deferred)
    - [ ] Performance benchmarks (deferred)

## Definition of Done
- [x] All 6 FSD layers properly implemented
- [x] Zero ESLint boundary violations (for FSD rules)
- [x] Zero circular dependencies (validated by madge)
- [x] All tests passing (unit tests complete, E2E deferred)
- [x] Documentation complete and reviewed
- [ ] Code review completed (pending)
- [x] Storybook stories for all UI components
- [ ] Performance metrics meet baseline (deferred)

## Technical Risks & Mitigations
1. **Risk**: Breaking existing functionality during migration
   - **Mitigation**: Incremental migration with comprehensive testing

2. **Risk**: Import path confusion during transition
   - **Mitigation**: Update paths systematically, one layer at a time

3. **Risk**: Redux store integration issues
   - **Mitigation**: Keep store in app layer, test thoroughly

## Dependencies
- Depends on: STORY-004 (Material UI Setup) ✅ COMPLETED
- Blocks: All future feature development stories
- Related: Next.js App Router structure

## Estimated Effort
- **Story Points**: 13
- **Time Estimate**: 2-3 days
- **Complexity**: High (architectural change)

## Notes for Developer
- Start with Phase 1 (configuration) before any code moves
- Use `pnpm` for all package installations
- Run `pnpm lint` and `pnpm typecheck` after each phase
- Take screenshots of Storybook for documentation
- Commit after each completed subtask for easy rollback

## Success Metrics
- Build time: No increase from baseline
- Bundle size: < 5% increase
- Test coverage: > 80% for new code
- Zero runtime errors after migration
- All Storybook stories rendering correctly

---
## Dev Agent Record
*[To be filled by implementing agent]*

### Implementation Log
- [x] Phase 1 Complete: Foundation setup with TypeScript aliases and ESLint boundaries
- [x] Phase 2 Complete: All layers created (entities, widgets, pages)
- [x] Phase 3 Complete: Shared layer reorganized, app layer migrated
- [x] Phase 4 Complete: Architecture validated, documentation created
- [x] Phase 5 Complete: Core testing complete (E2E deferred)

### Challenges Encountered
- UserRole enum import issue in userModel.ts - fixed by importing as value not just type
- No circular dependencies found with madge
- ESLint has some existing warnings but FSD boundaries are working

### Completion Notes
- All 6 FSD layers implemented and properly structured
- Zero circular dependencies detected
- Comprehensive documentation created in FSD-ARCHITECTURE.md
- Path aliases working across all tools (Next.js, TypeScript, Storybook)
- 32 tests passing
- Ready for code review