# Epic 8: UI Integration & Page Assembly

## Epic Overview

**Epic ID**: EPIC-8  
**Epic Name**: UI Integration & Page Assembly  
**Epic Goal**: Assemble atomic components into complete pages, establish routing, and validate user workflows through the application  
**Priority**: P0 - Critical Path (Blocks Epic 7)  
**Estimated Duration**: 4-6 weeks  
**Dependencies**: Epic 2 (Core UI Components) must be substantially complete  

## Business Value

This epic transforms the component library into a navigable application. It validates that our atomic design components work together cohesively and identifies gaps in the UI before feature integration begins. This is where we discover UX issues, missing components, and workflow problems early.

## Success Criteria

1. **Complete page layouts** for all major application areas
2. **Working navigation** between all pages
3. **Responsive design** verified on mobile/tablet/desktop
4. **Workflow validation** - users can complete key tasks
5. **Loading states** and error boundaries implemented
6. **Accessibility** - all pages pass WCAG 2.1 AA

## Page Architecture

### Route Structure
```
/                           → Dashboard/Home
/auth/
  /login                   → Login page
  /register                → Registration (future)
/tpn/
  /calculator              → TPN Calculator
  /history                 → Calculation history
  /compare                 → Population comparison
/ingredients/
  /manage                  → Ingredient manager
  /shared                  → Shared ingredients
  /import                  → Import wizard
/editor/
  /new                     → New document
  /edit/:id                → Edit document
/settings/
  /preferences             → User preferences
  /profile                 → User profile
/admin/
  /kpt-functions          → KPT function editor
  /data-migration         → Migration tools
```

---

## User Stories

### Story 8.1: Application Shell & Navigation
**Points**: 5  
**Priority**: P0  

**As a** user  
**I want** a consistent application shell with navigation  
**So that** I can move between different features easily  

**Acceptance Criteria:**
- [ ] App shell with header, sidebar, and main content area
- [ ] Navigation menu with all major sections
- [ ] Responsive hamburger menu on mobile
- [ ] Breadcrumb navigation
- [ ] User profile dropdown in header
- [ ] Dark/light theme toggle
- [ ] Loading overlay for async operations

**Technical Tasks:**
1. Create AppLayout component using existing Header/Sidebar
2. Implement Next.js App Router layout structure
3. Add navigation state management
4. Create breadcrumb component
5. Implement theme switching
6. Add loading skeleton states

**UI Components Needed:**
- HeaderWidget ✅ (exists)
- SidebarWidget ✅ (exists)  
- Navigation ✅ (exists)
- Breadcrumbs (new)
- UserMenu (new)

---

### Story 8.2: Dashboard/Home Page
**Points**: 3  
**Priority**: P0  
**Status**: Ready for Review ✅

**As a** clinician  
**I want** a dashboard showing my recent work  
**So that** I can quickly resume tasks  

**Acceptance Criteria:**
- [x] Welcome message with user context
- [x] Recent TPN calculations (last 5)
- [x] Recent ingredients (last 10)
- [x] Quick action buttons
- [x] Statistics cards (total calculations, ingredients)
- [x] Empty states for new users

**Technical Tasks:**
1. ✅ Create DashboardPage component
2. ✅ Build RecentActivity component
3. ✅ Create StatCard component
4. ✅ Implement QuickActions component
5. ✅ Add empty state handling
6. ✅ Add Redux state management for dashboard
7. ✅ Implement loading states

**UI Components Needed:**
- Card ✅ (exists)
- EmptyState ✅ (exists)
- List ✅ (exists)
- Button ✅ (exists)
- StatCard ✅ (created)
- QuickActionGrid ✅ (created)

---

### Story 8.3: TPN Calculator Page
**Points**: 5  
**Priority**: P0  
**Status**: Ready for Review ✅

**As a** clinician  
**I want** a dedicated page for TPN calculations  
**So that** I have space for inputs and results  

**Acceptance Criteria:**
- [x] Full-page layout with input panel and results
- [x] Population type selector prominent
- [x] Input fields organized by category
- [x] Real-time validation feedback
- [x] Results table with export options
- [x] Save/load calculation functionality
- [x] Mobile-responsive layout

**Technical Tasks:**
1. ✅ Create TPNCalculatorPage layout
2. ✅ Organize TPNCalculator into sections
3. ✅ Add validation error display
4. ✅ Implement results visualization
5. ✅ Create save/load UI
6. ✅ Test responsive breakpoints

**UI Components Needed:**
- TPNCalculator ✅ (exists)
- TPNCalculatorInput ✅ (created)
- TPNCalculatorResults ✅ (created)
- TPNCalculatorValidation ✅ (created)
- TPNSaveLoadDialog ✅ (created)
- Select ✅ (exists)
- Input ✅ (exists)
- DataTable ✅ (exists)
- Alert ✅ (exists)
- FormField ✅ (exists)

---

### Story 8.4: Ingredient Management Page
**Points**: 8  
**Priority**: P0  
**Status**: Ready for Review ✅

**As a** pharmacist  
**I want** a comprehensive ingredient management interface  
**So that** I can view, edit, and organize all ingredients  

**Acceptance Criteria:**
- [x] Searchable/filterable ingredient list
- [x] Grid and list view toggle
- [x] Ingredient detail panel (drawer)
- [x] Bulk selection and operations
- [x] Import/export buttons
- [x] Duplicate detection indicator
- [x] Category filters

**Technical Tasks:**
1. Create IngredientManagementPage ✅
2. Implement view mode toggle ✅
3. Build ingredient detail drawer ✅
4. Add search/filter functionality ✅
5. Create bulk operations toolbar ✅
6. Implement category sidebar ✅

**UI Components Needed:**
- DataTable ✅ (exists)
- SearchBar ✅ (exists)
- Drawer ✅ (created: IngredientDetailDrawer)
- Toolbar ✅ (created: IngredientBulkActions)
- FilterPanel ✅ (created: IngredientFilterPanel)
- BulkActions ✅ (created: IngredientBulkActions)

---

### Story 8.5: Document Editor Page
**Points**: 8  
**Priority**: P1  
**Status**: Ready for Review ✅

**As a** technical writer  
**I want** a document editor with dynamic text capabilities  
**So that** I can create formulas and documentation  

**Acceptance Criteria:**
- [x] Split-pane editor and preview
- [x] Toolbar with formatting options
- [x] Formula insertion modal
- [x] Section management sidebar
- [x] Auto-save indicator
- [x] Version history access
- [x] Export options menu

**Technical Tasks:**
1. Create EditorPage with split layout ✅
2. Build EditorToolbar component ✅
3. Implement FormulaBuilder modal ✅
4. Create SectionSidebar ✅
5. Add auto-save functionality ✅
6. Build export menu ✅

**UI Components Needed:**
- CodeEditor ✅ (created)
- Toolbar ✅ (created: EditorToolbar)
- SplitPane ✅ (implemented in page)
- Modal ✅ (exists via MUI)
- IconButton ✅ (exists via MUI)

---

### Story 8.6: Comparison/Diff Viewer Page
**Points**: 5  
**Priority**: P1  
**Status**: Ready for Review ✅

**As a** reviewer  
**I want** a dedicated page for comparing ingredients  
**So that** I can analyze differences effectively  

**Acceptance Criteria:**
- [x] Full-screen diff viewer layout
- [x] Population/version selector
- [x] Side-by-side and unified view toggle
- [x] Export comparison results
- [x] Navigation between differences
- [x] Highlight controls

**Technical Tasks:**
1. Create ComparisonPage layout ✅
2. Integrate DiffViewer components ✅
3. Add view mode controls ✅
4. Implement diff navigation ✅
5. Create export functionality ✅

**UI Components Needed:**
- DiffViewer ✅ (exists)
- DiffControls ✅ (exists)
- DiffViewerModal ✅ (exists)
- ToggleButtonGroup ✅ (exists via MUI)

---

### Story 8.7: Settings & Preferences Page
**Points**: 3  
**Priority**: P2  
**Status**: Ready for Review ✅

**As a** user  
**I want** to customize my application experience  
**So that** it works the way I prefer  

**Acceptance Criteria:**
- [x] Theme preferences (dark/light/auto)
- [x] Default population type
- [x] Calculation precision settings
- [x] Export format preferences
- [x] Notification settings
- [x] Data management (clear cache, export data)

**Technical Tasks:**
1. Create SettingsPage with tabs ✅
2. Build PreferencesForm ✅
3. Implement settings persistence ✅
4. Add data management section ✅
5. Create settings context ✅

**UI Components Needed:**
- Form ✅ (exists)
- Tabs ✅ (implemented via MUI)
- Switch ✅ (exists via MUI)
- Select ✅ (exists)
- Button ✅ (exists)

---

### Story 8.8: Mobile-First Responsive Design
**Points**: 5  
**Priority**: P0  
**Status**: Ready for Review ✅

**As a** mobile user  
**I want** the application to work well on my device  
**So that** I can use it anywhere  

**Acceptance Criteria:**
- [x] All pages responsive at 320px, 768px, 1024px, 1440px
- [x] Touch-friendly tap targets (min 44px)
- [x] Swipe gestures for navigation
- [x] Bottom navigation on mobile
- [x] Collapsible panels on small screens
- [x] Optimized data tables for mobile

**Technical Tasks:**
1. Audit all pages at breakpoints ✅
2. Implement mobile navigation ✅
3. Create responsive table component ✅
4. Add touch gesture support ✅
5. Optimize form layouts for mobile ✅

---

### Story 8.9: Loading States & Error Boundaries
**Points**: 3  
**Priority**: P0  

**As a** user  
**I want** clear feedback during loading and errors  
**So that** I understand what's happening  

**Acceptance Criteria:**
- [ ] Skeleton screens for all pages
- [ ] Error boundary with recovery options
- [ ] 404 page design
- [ ] Offline indicator
- [ ] Loading progress for long operations
- [ ] Toast notifications for actions

**Technical Tasks:**
1. Create page-level skeletons
2. Implement error boundary component
3. Design 404 and error pages
4. Add offline detection
5. Implement toast system

**UI Components Needed:**
- Skeleton ✅ (exists)
- Alert ✅ (exists)
- Progress ✅ (exists)
- Snackbar ✅ (exists via MUI)
- ErrorBoundary (new)

---

### Story 8.10: Workflow Validation & Gap Analysis
**Points**: 5  
**Priority**: P0  

**As a** product owner  
**I want** to validate complete user workflows  
**So that** we identify missing pieces before integration  

**Acceptance Criteria:**
- [ ] Document 5 key user workflows
- [ ] Click through each workflow in UI
- [ ] Identify missing components/features
- [ ] Document UX improvements needed
- [ ] Create gap analysis report
- [ ] Prioritize fixes

**Key Workflows to Test:**
1. Calculate TPN → Save as Ingredient → View in Manager
2. Import Ingredients → Find Duplicates → Merge
3. Create Document → Add Formula → Preview → Export
4. Compare Populations → Export Diff → Share
5. Change Settings → Apply Theme → Verify Persistence

---

## Sprint Planning

### Sprint 1: Foundation & Navigation
- Story 8.1: Application Shell
- Story 8.2: Dashboard Page
- Story 8.8: Mobile Responsive (start)

### Sprint 2: Core Pages
- Story 8.3: TPN Calculator Page
- Story 8.4: Ingredient Management Page (start)
- Story 8.9: Loading States

### Sprint 3: Advanced Pages
- Story 8.4: Ingredient Management (complete)
- Story 8.5: Editor Page (start)
- Story 8.6: Comparison Page

### Sprint 4: Polish & Validation
- Story 8.5: Editor Page (complete)
- Story 8.7: Settings Page
- Story 8.10: Workflow Validation

## Component Gap Analysis

### Components We Need to Create:
1. **Breadcrumbs** - Navigation component
2. **UserMenu** - Profile dropdown
3. **StatCard** - Dashboard statistics
4. **QuickActionGrid** - Dashboard actions
5. **Drawer** - Side panel for details
6. **Toolbar** - Editor/table actions
7. **FilterPanel** - Advanced filtering
8. **BulkActions** - Multi-select operations
9. **SplitPane** - Resizable panels
10. **Tabs** - Settings navigation
11. **ErrorBoundary** - Error handling
12. **MobileNav** - Bottom navigation

### Components to Port from Svelte:
1. **CodeEditor** - Main editor component
2. **PreviewPanel** - Live preview
3. **SectionManager** - Document sections
4. **FormulaBuilder** - Formula creation

## Success Metrics

- **Page Load Time**: < 1s for initial render
- **Responsive Score**: 100% pages work at all breakpoints
- **Accessibility Score**: All pages pass axe-core tests
- **Workflow Completion**: 100% of defined workflows completable
- **Component Coverage**: 0 missing components for core workflows

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing components discovered late | High | Early workflow validation (Story 8.10) |
| Mobile UX issues | Medium | Mobile-first development approach |
| Complex state management | Medium | Use URL state where possible |
| Performance on large datasets | Medium | Implement virtualization early |

## Notes for Development Team

1. **Start with mobile** - Design mobile-first, then enhance for desktop
2. **Use existing components** - Check component library before creating new
3. **Document patterns** - As you solve layout problems, document the patterns
4. **Test workflows early** - Don't wait until the end to test full workflows
5. **Accessibility from start** - Include keyboard navigation and ARIA labels

---

*This epic is critical for validating that our component library can support real workflows. It's where we discover if our atomic design approach truly scales to full applications.*