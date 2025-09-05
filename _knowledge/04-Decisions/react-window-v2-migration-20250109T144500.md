---
date: 2025-01-09T14:45:00
agent: react-researcher
type: decision
topics: [react, migration, virtualization, react-window]
tags: [#migration/breaking-change, #library/react-window, #decision/architecture]
related: [[React Window v2 API]], [[List Component]], [[Virtual Scrolling]]
aliases: [react-window-migration, virtualization-fix]
---

# Architecture Decision: React-Window v2 Migration

## Context

The List component in `src/shared/ui/organisms/List/List.tsx` was using the deprecated react-window v1 API with `FixedSizeList` and `VariableSizeList` imports. These components no longer exist in react-window v2.0.2, causing import errors when building the application.

## Problem

```typescript
// ❌ v1 API - No longer works in v2.0.2
import { FixedSizeList, VariableSizeList } from 'react-window'

// Component was trying to conditionally render different list types
{typeof itemHeight === 'function' ? (
  <VariableSizeList /* ... */ />
) : (
  <FixedSizeList /* ... */ />
)}
```

**Error**: Module '"react-window"' has no exported member 'FixedSizeList' or 'VariableSizeList'.

## Investigation

Research revealed that react-window v2 introduced breaking changes:

1. **Unified Component**: Single `List` component replaces all list variants
2. **Property-Based Behavior**: `rowHeight` prop type determines fixed vs variable sizing
3. **New Hook System**: `useListRef` replaces direct ref usage
4. **Component Props Pattern**: `rowComponent`/`rowProps` replace render prop patterns

## Decision

Migrated the List component to use react-window v2 API:

### ✅ New Implementation

```typescript
// ✅ v2 API - Correct imports
import { List as VirtualizedList, useListRef } from 'react-window'

// Unified component with conditional behavior based on props
<VirtualizedList
  listRef={listRef}                    // Hook-based ref
  rowComponent={VirtualRow}            // Component-based rendering
  rowCount={finalItems.length}
  rowHeight={                          // Property determines behavior
    typeof itemHeight === 'function' 
      ? getRowHeight                   // Function = variable height
      : itemHeight                     // Number = fixed height
  }
  rowProps={{}}                        // Props passed to row component
  overscanCount={overscan}
  style={{ width: '100%', height: typeof height === 'number' ? height : 400 }}
/>
```

### Key Changes Made

1. **Import Update**: Changed from `FixedSizeList, VariableSizeList` to `List as VirtualizedList, useListRef`

2. **Ref System**: Replaced direct ref with `useListRef()` hook:
   ```typescript
   // Before: const listRef = useRef<FixedSizeList | VariableSizeList>(null)
   // After: const listRef = useListRef()
   ```

3. **Component Props**: Updated to new `rowComponent`/`rowProps` pattern:
   ```typescript
   rowComponent={VirtualRow}
   rowProps={{}}  // Could pass data here if needed
   ```

4. **Height Strategy**: Single `rowHeight` prop handles both cases:
   ```typescript
   // Fixed height: number
   rowHeight={50}
   
   // Variable height: function
   rowHeight={(index) => getItemHeight(index)}
   ```

## Alternatives Considered

1. **Downgrade react-window**: Would lose v2 performance improvements and TypeScript enhancements
2. **Switch to @tanstack/react-virtual**: More complex API, larger bundle
3. **Remove virtualization**: Would hurt performance with large datasets
4. **Custom virtualization**: Too much implementation overhead

## Benefits

1. **Compatibility**: Fixed immediate import errors
2. **Performance**: React-window v2 has optimized rendering
3. **TypeScript**: Better type safety with new API
4. **Bundle Size**: v2 is smaller due to unified architecture
5. **Future-Proof**: Following library's evolution path

## Trade-offs

1. **Breaking Change**: Required code changes to existing component
2. **API Learning**: Team needs to understand new patterns
3. **Testing**: Virtual scrolling behavior may need verification

## Implementation Details

### Before (v1 Pattern)
```typescript
{typeof itemHeight === 'function' ? (
  <VariableSizeList
    ref={listRef as any}
    height={height}
    itemCount={finalItems.length}
    itemSize={getItemHeight}
    overscanCount={overscan}
    width="100%"
  >
    {VirtualRow}
  </VariableSizeList>
) : (
  <FixedSizeList
    ref={listRef as any}
    height={height}
    itemCount={finalItems.length}
    itemSize={itemHeight}
    overscanCount={overscan}
    width="100%"
  >
    {VirtualRow}
  </FixedSizeList>
)}
```

### After (v2 Pattern)
```typescript
<VirtualizedList
  listRef={listRef}
  rowComponent={VirtualRow}
  rowCount={finalItems.length}
  rowHeight={typeof itemHeight === 'function' ? getRowHeight : itemHeight}
  rowProps={{}}
  overscanCount={overscan}
  style={{ width: '100%', height: typeof height === 'number' ? height : 400 }}
/>
```

## Verification

- ✅ Component compiles without import errors
- ✅ Existing tests pass (interface unchanged)
- ✅ Storybook stories render correctly
- ✅ Both fixed and variable height modes work
- ✅ TypeScript types are properly inferred

## Files Modified

- `/src/shared/ui/organisms/List/List.tsx` - Updated to v2 API
- `/_knowledge/01-Research/React/react-window-v2-api-20250109T143230.md` - Research documentation

## Future Considerations

1. **Performance Testing**: Verify virtualization performance with large datasets
2. **Accessibility**: Ensure virtual scrolling doesn't break screen readers
3. **Grid Support**: Consider react-window v2's Grid component for 2D virtualization
4. **Custom Hooks**: May want to create wrapper hooks for common patterns

## Impact Assessment

- **Risk**: Low - Interface remains the same for consumers
- **Effort**: Low - Single component update
- **Testing**: Minimal - Existing tests cover behavior
- **Documentation**: Updated with research findings

## Lessons Learned

1. Always check breaking changes when upgrading major versions
2. Unified APIs can be more maintainable than variant-based approaches
3. TypeScript helps catch API changes early in development
4. Component interfaces should remain stable during library migrations

---

**Decision Status**: ✅ Implemented  
**Review Date**: 2025-01-09  
**Next Review**: When upgrading to future react-window versions