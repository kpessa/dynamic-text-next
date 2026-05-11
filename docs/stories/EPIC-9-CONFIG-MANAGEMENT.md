# EPIC-9: TPN Configuration Management System

## Epic Goal
Build a comprehensive configuration management system that enables pharmacy informaticists to manage, test, and deploy TPN ingredient configurations across multiple health systems and patient populations, ensuring consistent and validated reference text for TPN advisors.

## Epic Description

### Existing System Context

**Current Functionality:**
- Basic TPN calculator with ingredient selection
- Simple ingredient management interface
- Document editor with preview capabilities
- Firebase configuration for data persistence

**Technology Stack:**
- Next.js 15 with App Router
- Redux Toolkit for state management
- Material UI component library
- TypeScript for type safety
- Firebase for backend services

**Integration Points:**
- Existing ingredient database structure
- Current Redux store architecture
- Firebase data persistence layer
- Export/import modal components

### Enhancement Details

**What's Being Added:**
This epic transforms the current single-domain TPN calculator into a multi-domain configuration management platform that:
- Manages ingredient variants across populations (neo, child, adolescent, adult) and health systems
- Imports and validates configurations from multiple domains
- Detects changes between configurations with visual diff tools
- Tests dynamic text sections with extracted variables
- Deploys updated configurations to multiple domains simultaneously
- Tracks deployment status and configuration history

**How It Integrates:**
- Extends existing ingredient management to support variants
- Leverages current import/export modals for configuration handling
- Builds on Redux store with new slices for configurations and deployments
- Uses existing validation framework for dynamic text testing
- Enhances current diff viewer for configuration comparison

**Success Criteria:**
- Import configurations from 10+ health systems in < 10 seconds
- Detect all configuration changes in < 5 seconds
- Generate deployment packages in < 3 seconds
- Execute full test suite on dynamic text in < 30 seconds
- Support batch deployment to multiple domains
- Maintain 100% backward compatibility with existing TPN data

## User Stories

### Story Group 1: Ingredient Variant Management
**Goal:** Enable management of ingredient variants across populations and health systems

1. **Story 1.1:** As a pharmacy informaticist, I want to view all variants of an ingredient organized by population and health system
2. **Story 1.2:** As a pharmacy informaticist, I want to create new ingredient variants for different populations
3. **Story 1.3:** As a pharmacy informaticist, I want to manage static and dynamic sections for each ingredient variant
4. **Story 1.4:** As a pharmacy informaticist, I want to validate that all required sections exist for each variant

### Story Group 2: Configuration Import/Export
**Goal:** Import and export configurations from various health system domains

5. **Story 2.1:** As a pharmacy informaticist, I want to import a domain configuration file and parse its ingredients
6. **Story 2.2:** As a pharmacy informaticist, I want to map imported ingredients to my master ingredient database
7. **Story 2.3:** As a pharmacy informaticist, I want to export configurations in domain-specific formats
8. **Story 2.4:** As a pharmacy informaticist, I want to validate imported configurations against current section data

### Story Group 3: Dynamic Text Testing
**Goal:** Test dynamic text sections to ensure robust reference text

9. **Story 3.1:** As a pharmacy informaticist, I want to extract variables from dynamic text sections automatically
10. **Story 3.2:** As a pharmacy informaticist, I want to generate comprehensive test cases for dynamic text
11. **Story 3.3:** As a pharmacy informaticist, I want to execute test suites and view results with pass/fail status
12. **Story 3.4:** As a pharmacy informaticist, I want to save test suites for regression testing

### Story Group 4: Change Detection & Comparison
**Goal:** Identify and visualize changes between configurations

13. **Story 4.1:** As a pharmacy informaticist, I want to compare configurations and see color-coded differences
14. **Story 4.2:** As a pharmacy informaticist, I want to identify new, modified, and removed ingredients
15. **Story 4.3:** As a pharmacy informaticist, I want to validate changed ingredients against current sections
16. **Story 4.4:** As a pharmacy informaticist, I want to generate detailed change reports

### Story Group 5: Deployment Management
**Goal:** Deploy configuration updates to multiple domains

17. **Story 5.1:** As a pharmacy informaticist, I want to select specific ingredients to update in a configuration
18. **Story 5.2:** As a pharmacy informaticist, I want to preview deployment changes before applying them
19. **Story 5.3:** As a pharmacy informaticist, I want to deploy updates to multiple domains in batch
20. **Story 5.4:** As a pharmacy informaticist, I want to track deployment status and history

### Story Group 6: Domain Dashboard
**Goal:** Provide overview and management of all domains

21. **Story 6.1:** As a pharmacy informaticist, I want to see a dashboard of all managed domains with status
22. **Story 6.2:** As a pharmacy informaticist, I want to monitor configuration versions per domain
23. **Story 6.3:** As a pharmacy informaticist, I want to set up alerts for configuration changes
24. **Story 6.4:** As a pharmacy informaticist, I want to view historical changes and rollback if needed

## Technical Requirements

### New Components Needed
- `IngredientVariantManager` - Manage population/health system variants
- `ConfigurationImporter` - Parse and import domain configs
- `DynamicTextTester` - Test dynamic sections with variables
- `ChangeDetector` - Compare configurations and detect changes
- `DeploymentCenter` - Manage batch deployments
- `DomainDashboard` - Overview of all domains

### New Redux Slices
- `configurationSlice` - Domain configuration state
- `variantSlice` - Ingredient variant management
- `validationSlice` - Test results and validation
- `deploymentSlice` - Deployment tracking
- `comparisonSlice` - Configuration comparison state

### New Services
- `ConfigurationService` - Import/export/parse configs
- `VariantService` - Manage ingredient variants
- `DynamicTextService` - Parse and test dynamic text
- `DeploymentService` - Handle deployments
- `ChangeDetectionService` - Compare configurations

### Data Models
```typescript
interface IngredientVariant {
  id: string;
  ingredientId: string;
  population: 'neo' | 'child' | 'adolescent' | 'adult';
  healthSystem: string;
  sections: {
    static: Section[];
    dynamic: DynamicSection[];
  };
  lastUpdated: Date;
  validationStatus: ValidationStatus;
}

interface DomainConfiguration {
  id: string;
  domain: string;
  healthSystem: string;
  ingredients: ConfigIngredient[];
  version: string;
  lastImported: Date;
  deploymentHistory: Deployment[];
}

interface DynamicTextTest {
  id: string;
  sectionId: string;
  variables: ExtractedVariable[];
  testCases: TestCase[];
  lastRun: Date;
  results: TestResult[];
}
```

## Compatibility Requirements

- [x] Maintain existing TPN calculator functionality
- [x] Preserve current ingredient data structure (extend, don't replace)
- [x] Keep existing Firebase schema (add new collections)
- [x] Support current export formats while adding new ones
- [x] Ensure backward compatibility with existing saved configurations

## Risk Mitigation

**Primary Risks:**
1. **Data Migration Risk:** Existing ingredient data needs variant structure
   - **Mitigation:** Create migration script, maintain backward compatibility
   
2. **Performance Risk:** Large configurations may slow down comparison
   - **Mitigation:** Implement virtual scrolling, pagination, lazy loading
   
3. **Integration Risk:** Multiple domain formats may conflict
   - **Mitigation:** Create robust parser with format detection and validation

**Rollback Plan:**
- Feature flag new configuration management features
- Maintain separate database collections for new variant data
- Keep original ingredient management UI accessible
- Version all configuration changes for easy rollback

## Definition of Done

### Epic Level
- [ ] All 24 user stories completed with acceptance criteria met
- [ ] End-to-end testing covers all 6 user journeys
- [ ] Performance metrics meet success criteria
- [ ] Documentation updated for all new features
- [ ] User training materials created
- [ ] Beta testing with 3+ pharmacy informaticists completed

### Story Level (applies to each story)
- [ ] Unit tests written with >80% coverage
- [ ] Integration tests for API endpoints
- [ ] Component stories in Storybook
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Responsive design works on mobile/tablet
- [ ] Error handling and loading states implemented
- [ ] Documentation updated

## Implementation Phases

### Phase 1: Foundation (Stories 1-8)
- Ingredient variant system
- Configuration import/export
- Basic domain management

### Phase 2: Testing & Validation (Stories 9-12)
- Dynamic text parser
- Variable extraction
- Test generation and execution

### Phase 3: Comparison & Detection (Stories 13-16)
- Change detection engine
- Visual diff tools
- Validation against sections

### Phase 4: Deployment (Stories 17-20)
- Deployment preview
- Batch deployment
- Status tracking

### Phase 5: Dashboard & Polish (Stories 21-24)
- Domain dashboard
- Historical tracking
- Alerts and monitoring

## Dependencies

### External Dependencies
- Firebase Realtime Database for multi-domain sync
- Cloud Functions for deployment automation
- GitHub API for version control integration

### Internal Dependencies
- Existing ingredient management system
- Current import/export modals
- Redux store architecture
- Validation framework

## Acceptance Criteria

The epic is complete when:
1. Pharmacy informaticists can manage configurations for 10+ domains
2. All dynamic text sections have comprehensive test coverage
3. Configuration changes are detected and deployed within minutes
4. System maintains 99.9% uptime during deployments
5. User satisfaction rating > 4.5/5 from beta testers

## Handoff to Scrum Master

**Scrum Master Handoff:**

This epic transforms our existing TPN application into a comprehensive configuration management system for pharmacy informaticists. The epic contains 24 user stories organized into 6 story groups, designed to be implemented in 5 phases.

**Key Considerations:**
- This is a brownfield project - leverage existing Next.js/Redux infrastructure
- Maintain backward compatibility with current TPN calculator
- Each phase builds on the previous one but can deliver value independently
- Stories within each group can be developed in parallel by different team members
- Performance and scalability are critical - configs may contain 1000+ ingredients

**Recommended Sprint Planning:**
- Sprint 1-2: Phase 1 (Foundation)
- Sprint 3-4: Phase 2 (Testing)
- Sprint 5-6: Phase 3 (Comparison)
- Sprint 7-8: Phase 4 (Deployment)
- Sprint 9-10: Phase 5 (Dashboard)

**Technical Spikes Needed:**
1. Investigate optimal data structure for variants (Sprint 1)
2. Research diff algorithms for large configs (Sprint 4)
3. Evaluate deployment strategies for multiple domains (Sprint 6)

The epic prioritizes core configuration management workflows while preserving existing functionality. Each story has clear acceptance criteria and can be independently tested.

---

## Appendix: User Journey References

See `/docs/USER-JOURNEYS.md` for detailed user journeys:
- Journey 1: Ingredient Selection and Configuration
- Journey 2: Dynamic Text Testing and Validation
- Journey 3: Configuration Management Across Domains
- Journey 4: Change Detection Between Domains
- Journey 5: Ingredient Deployment to All Domains
- Journey 6: Dynamic Text Exploration Between Health Systems