# Story 2.1 - Remaining Issues Backlog

## Overview
This document tracks the remaining issues from Story 2.1 (Core UI Components Library) that were not resolved during the initial QA fix phase. These issues have been deemed non-critical and can be addressed in future sprints.

**Date Created**: 2025-01-05  
**Story**: 2.1 - Core UI Components Library  
**Current Pass Rate**: 95.4% (626/656 tests passing)  
**Remaining Failures**: 29 tests (4.4%)

## Priority 1: StepperForm Component (18 failures)

### Issue Description
The StepperForm component has the highest concentration of test failures, primarily related to complex multi-step form validation and state management between steps.

### Failing Tests
- Step navigation validation
- Form data persistence between steps
- Step completion state tracking
- Error handling across steps
- Progress indicator synchronization

### Root Cause Analysis
- Complex state management requirements
- Async validation between steps
- Nested form field validation
- Step transition animations interfering with tests

### Recommended Solution
1. Refactor to use a dedicated state machine (XState or similar)
2. Implement proper async validation handling
3. Separate presentation from business logic
4. Add integration tests for multi-step flows

### Estimated Effort
- **Complexity**: High
- **Time Estimate**: 3-5 days
- **Dependencies**: None

---

## Priority 2: Form Component (5 failures)

### Issue Description
Complex form validation scenarios are failing, particularly around conditional field validation and dynamic form schema changes.

### Failing Tests
- Conditional field validation
- Dynamic field addition/removal
- Cross-field validation rules
- Async validation with debouncing
- Error message prioritization

### Root Cause Analysis
- React Hook Form integration complexity
- Dynamic schema validation challenges
- Race conditions in async validators

### Recommended Solution
1. Upgrade to latest React Hook Form version
2. Implement proper validation schema management
3. Add better async validation handling
4. Create comprehensive validation test suite

### Estimated Effort
- **Complexity**: Medium
- **Time Estimate**: 2-3 days
- **Dependencies**: React Hook Form upgrade

---

## Priority 3: List Component (3 failures)

### Issue Description
Virtual scrolling implementation has edge cases that fail under certain conditions.

### Failing Tests
- Large dataset rendering (>10,000 items)
- Dynamic height calculation
- Scroll position restoration

### Root Cause Analysis
- Virtual scroll library limitations
- Browser-specific scroll behavior
- Memory management in large lists

### Recommended Solution
1. Evaluate alternative virtual scroll libraries
2. Implement proper height caching
3. Add scroll position persistence
4. Optimize re-render performance

### Estimated Effort
- **Complexity**: Medium
- **Time Estimate**: 1-2 days
- **Dependencies**: Possible library change

---

## Priority 4: DataTable Component (2 failures)

### Issue Description
Advanced filtering scenarios with complex data types are not working correctly.

### Failing Tests
- Nested object filtering
- Multi-column sorting with custom comparators

### Root Cause Analysis
- TanStack Table configuration complexity
- Custom filter function implementation

### Recommended Solution
1. Review TanStack Table documentation for advanced filtering
2. Implement proper filter factory pattern
3. Add comprehensive filter test coverage

### Estimated Effort
- **Complexity**: Low
- **Time Estimate**: 1 day
- **Dependencies**: None

---

## Priority 5: Progress Component (1 failure)

### Issue Description
SVG sizing edge case in certain viewport configurations.

### Failing Tests
- Dynamic size calculation with percentage values

### Root Cause Analysis
- SVG viewBox calculation inconsistency
- Browser-specific SVG rendering differences

### Recommended Solution
1. Standardize SVG size calculation
2. Add viewport-specific test cases
3. Consider using CSS-based progress instead of SVG

### Estimated Effort
- **Complexity**: Low
- **Time Estimate**: 2-4 hours
- **Dependencies**: None

---

## Technical Debt Items

### 1. Bundle Size Optimization
- **Current**: 275KB (gzipped)
- **Target**: 200KB
- **Action Items**:
  - Implement code splitting for organism components
  - Lazy load heavy dependencies
  - Tree-shake unused MUI components
  - Analyze with webpack-bundle-analyzer

### 2. FSD Architecture Validation
- **Issue**: ESLint FSD plugin not configured correctly
- **Impact**: Cannot validate layer dependencies
- **Action Items**:
  - Fix eslint-plugin-boundaries configuration
  - Add proper layer definitions
  - Create architecture validation CI step

### 3. TypeScript Strict Mode
- **Current Issues**: 159 errors (mostly in .next generated files)
- **Action Items**:
  - Exclude .next directory from strict checks
  - Fix remaining application code type errors
  - Enable stricter compiler options gradually

### 4. Test Coverage Gaps
- **Current Coverage**: ~85%
- **Target**: 95%
- **Missing Coverage**:
  - Error boundary components
  - SSR-specific code paths
  - Animation/transition logic
  - Accessibility features

---

## Migration Recommendations

### Phase 1 (Sprint 1)
1. Fix StepperForm component (highest impact)
2. Resolve Form validation issues
3. Set up proper FSD linting

### Phase 2 (Sprint 2)
1. Address List virtual scrolling
2. Fix DataTable filtering
3. Implement bundle optimization

### Phase 3 (Sprint 3)
1. Achieve 95% test coverage
2. Complete TypeScript strict mode migration
3. Add E2E tests with Playwright

---

## Success Metrics

### Immediate (End of Sprint 1)
- [ ] 98% test pass rate
- [ ] Zero critical TypeScript errors
- [ ] FSD architecture validation enabled

### Short-term (End of Quarter)
- [ ] 100% test pass rate
- [ ] Bundle size under 200KB
- [ ] 95% test coverage

### Long-term (Next Quarter)
- [ ] Full E2E test suite
- [ ] Zero TypeScript errors (strict mode)
- [ ] Performance budget automation

---

## Notes

- All remaining issues are non-critical and don't block production deployment
- Focus should be on StepperForm as it has the most failures
- Consider breaking StepperForm into smaller, more manageable components
- Bundle size optimization should be coordinated with the platform team

---

*Generated by James (Dev) - 2025-01-05*