# Integration Gap Analysis

## Executive Summary
This document identifies gaps between the current Next.js implementation and the desired functionality from the Svelte application, with specific focus on component connections and integration points.

## Critical Integration Gaps

### 1. Document Editor Integration 🔴 HIGH PRIORITY
**Current State**: Document editor components exist but are not fully connected
**Desired State**: Full dynamic document creation with live preview
**Missing Connections**:
- [ ] Connect `EditorPanel` to Redux store
- [ ] Integrate `PreviewEngine` with `SectionRenderer`
- [ ] Link `CodeEditor` with ingredient autocomplete
- [ ] Connect dynamic content parser to TPN calculations
- [ ] Wire up `TestRunner` with document sections

**Implementation Path**:
```typescript
// Need to create in /src/app/documents/editor/page.tsx
- Import EditorPanel, PreviewPanel, SectionManager
- Connect to editorSlice for state management
- Implement real-time preview updates
- Add ingredient reference resolution
```

### 2. Dynamic Content Processing 🔴 HIGH PRIORITY
**Current State**: Static content only, no dynamic variable resolution
**Desired State**: Full JavaScript expression evaluation with TPN variables
**Missing Connections**:
- [ ] Implement `{{variable}}` syntax parser
- [ ] Connect `SecureCodeExecutor` worker
- [ ] Link ingredient values to template variables
- [ ] Create calculation context provider
- [ ] Add real-time validation of expressions

**Required Services**:
- `previewEngineService`: Process dynamic content
- `sectionParser`: Parse and identify dynamic sections
- `ingredientExtractionService`: Extract ingredient references

### 3. Section Management System 🟡 MEDIUM PRIORITY
**Current State**: Basic section components exist
**Desired State**: Full drag-drop section management with types
**Missing Connections**:
- [ ] Connect `SectionManager` to document state
- [ ] Implement section type system (static/dynamic/calculated)
- [ ] Add drag-drop reordering functionality
- [ ] Create section template library
- [ ] Link section validation to test framework

### 4. Import/Export Wizards 🟡 MEDIUM PRIORITY
**Current State**: Basic import/export modals exist
**Desired State**: Full wizard workflow with validation
**Missing Connections**:
- [ ] Connect `ImportWizard` to data validation pipeline
- [ ] Link column mapping to ingredient schema
- [ ] Integrate progress tracking with loading states
- [ ] Connect export formats to template engine
- [ ] Add batch processing capability

### 5. Test Generation & Validation 🟡 MEDIUM PRIORITY
**Current State**: Test components exist but not integrated
**Desired State**: Automated test generation with AI assistance
**Missing Connections**:
- [ ] Connect `AITestGenerator` to document sections
- [ ] Link `TestCaseModal` to validation results
- [ ] Integrate `TestRunner` with preview engine
- [ ] Connect validation status to UI indicators
- [ ] Wire up test results to export reports

### 6. Real-time Collaboration 🟢 LOW PRIORITY
**Current State**: Firebase config exists, no real-time features
**Desired State**: Live collaboration on documents
**Missing Connections**:
- [ ] Implement Firebase Realtime Database listeners
- [ ] Add presence indicators
- [ ] Create conflict resolution system
- [ ] Implement collaborative cursors
- [ ] Add change attribution

### 7. Version History System 🟢 LOW PRIORITY
**Current State**: Basic version storage service exists
**Desired State**: Full version control with diff viewing
**Missing Connections**:
- [ ] Connect `VersionHistory` component to storage
- [ ] Integrate `DiffViewer` with version comparison
- [ ] Add restore functionality
- [ ] Implement branching/merging
- [ ] Create audit trail

## Component Connection Matrix

| Component | Currently Connected To | Needs Connection To | Priority |
|-----------|----------------------|-------------------|----------|
| `TPNCalculator` | `tpnSlice`, validation | Document editor, Preview engine | HIGH |
| `EditorPanel` | Local state only | `editorSlice`, Preview, Sections | HIGH |
| `PreviewEngine` | Service exists | Editor, Dynamic content, Export | HIGH |
| `SectionManager` | Components exist | Document state, Drag-drop, Templates | MEDIUM |
| `IngredientManager` | `ingredientSlice` | Editor autocomplete, Import wizard | MEDIUM |
| `TestRunner` | Service exists | Sections, Validation, Export | MEDIUM |
| `ImportWizard` | Modal exists | Validation, Mapping, Progress | MEDIUM |
| `VersionHistory` | Storage service | UI component, Diff viewer | LOW |
| `FirebaseSync` | Config only | Real-time listeners, Presence | LOW |

## Service Integration Requirements

### Required Service Connections:
1. **PreviewEngineService** → EditorPanel, SectionRenderer, ExportModal
2. **TestRunnerService** → TestCaseModal, ValidationStatus, ExportModal  
3. **SectionManagementService** → SectionManager, EditorPanel, PreviewPanel
4. **IngredientExtractionService** → CodeEditor, PreviewEngine, Validation
5. **FirebaseSaveService** → All stateful components for auto-save

### Missing Service Implementations:
- [ ] `DynamicContentService`: Parse and evaluate template expressions
- [ ] `DocumentService`: Manage document CRUD operations
- [ ] `CollaborationService`: Handle real-time collaboration
- [ ] `NotificationService`: User feedback and alerts
- [ ] `WorkflowService`: Orchestrate multi-step processes

## Redux Store Connections

### Existing Slices:
- ✅ `tpnSlice`: TPN calculations
- ✅ `ingredientSlice`: Ingredient management
- ✅ `navigationSlice`: UI navigation
- ✅ `settingsSlice`: User preferences
- ✅ `dashboardSlice`: Dashboard state

### Missing Slices:
- [ ] `documentSlice`: Document editing state
- [ ] `sectionSlice`: Section management
- [ ] `validationSlice`: Validation results
- [ ] `collaborationSlice`: Multi-user state
- [ ] `historySlice`: Version history

## Route Integration Status

### Functional Routes:
- ✅ `/` (Dashboard)
- ✅ `/tpn/calculator` (TPN Calculator)
- ✅ `/ingredients/manage` (Ingredient Manager)
- ✅ `/settings` (Settings)

### Partially Functional:
- 🟡 `/documents/editor` (Needs component wiring)
- 🟡 `/comparison` (Needs diff viewer integration)

### Non-Functional:
- ❌ `/documents` (List view not implemented)
- ❌ `/auth/login` (Auth flow not connected)

## Action Items for Integration

### Immediate (This Week):
1. Wire up EditorPanel to Redux store
2. Connect PreviewEngine to editor
3. Implement basic dynamic content parsing
4. Create document save/load functionality
5. Link TPN calculator to document variables

### Short-term (Next 2 Weeks):
1. Complete section management system
2. Integrate test generation
3. Connect import/export wizards
4. Add validation pipeline
5. Implement autocomplete for ingredients

### Medium-term (Next Month):
1. Add version history UI
2. Implement diff viewing
3. Create template library
4. Add collaborative features
5. Complete mobile optimizations

### Long-term (Future):
1. AI-powered suggestions
2. Advanced workflow automation
3. Plugin system
4. API integrations
5. Enterprise features

## Testing Requirements

### Integration Tests Needed:
- [ ] Editor → Preview flow
- [ ] TPN → Document variables
- [ ] Import → Validation → Save
- [ ] Section → Test → Export
- [ ] Multi-user collaboration

### E2E User Journeys to Test:
- [ ] Complete TPN creation workflow
- [ ] Document with dynamic content
- [ ] Ingredient import and management
- [ ] Configuration comparison
- [ ] Mobile user experience

## Success Criteria

✅ **Phase 1 Complete When**:
- User can create document with dynamic TPN content
- Preview updates in real-time
- Basic import/export works
- Validation provides feedback

✅ **Phase 2 Complete When**:
- Full section management works
- Test generation integrated
- Version history functional
- Comparison tools work

✅ **Phase 3 Complete When**:
- Real-time collaboration works
- Mobile experience optimized
- AI features integrated
- Full feature parity with Svelte app