# Workflow 4: Population Comparison

## Overview
Compare ingredient values across different populations and export differences

## User Journey
User needs to compare how an ingredient's values differ between populations

## Steps

### 1. Navigate to Comparison Page
- **Action**: Click "Comparison" in navigation
- **Expected**: Comparison tool loads
- **URL**: `/comparison/diff`
- **Initial State**: Empty selection

### 2. Select Ingredient
- **Action**: Choose ingredient from dropdown/search
- **Expected**: 
  - Ingredient details loaded
  - Available populations shown
  - Base values displayed
- **Search**: Type-ahead with filtering

### 3. Choose Populations to Compare
- **Action**: Select 2+ populations
- **Options**:
  - Neonatal
  - Pediatric
  - Adult
  - Custom populations
- **Expected**: Populations added to comparison
- **Limit**: Up to 5 populations

### 4. View Differences
- **Action**: Differences auto-calculated
- **Display Options**:
  - Absolute values
  - Percentage differences
  - Highlighted changes
- **Color Coding**:
  - Green: Higher values
  - Red: Lower values
  - Gray: No change

### 5. Toggle View Modes
- **Action**: Switch between view modes
- **Modes**:
  - Side-by-side columns
  - Unified diff view
  - Matrix view
  - Chart visualization
- **Expected**: Instant view update

### 6. Export Comparison
- **Action**: Click export button
- **Formats**:
  - PDF report
  - Excel spreadsheet
  - CSV data
  - JSON structure
- **Content**: All populations and differences

### 7. Copy Shareable Link
- **Action**: Click "Share" button
- **Expected**: 
  - Shareable URL generated
  - Link copied to clipboard
  - Toast confirmation shown
- **Link Format**: `/comparison/share/{id}`

## Comparison Data Structure

```json
{
  "ingredient": "Standard PN",
  "populations": [
    {
      "name": "Neonatal",
      "values": {
        "protein": 3.0,
        "fat": 2.5,
        "carbs": 12.0
      }
    },
    {
      "name": "Pediatric",
      "values": {
        "protein": 3.5,
        "fat": 2.8,
        "carbs": 14.0
      }
    }
  ],
  "differences": {
    "protein": {
      "absolute": 0.5,
      "percentage": 16.7
    }
  }
}
```

## View Mode Examples

### Side-by-Side View
```
| Parameter | Neonatal | Pediatric | Adult |
|-----------|----------|-----------|-------|
| Protein   | 3.0 g    | 3.5 g     | 4.0 g |
| Fat       | 2.5 g    | 2.8 g     | 3.0 g |
```

### Unified Diff View
```diff
  Protein:
- Neonatal: 3.0 g
+ Pediatric: 3.5 g (+16.7%)
+ Adult: 4.0 g (+33.3%)
```

### Matrix View
Heatmap showing all value relationships

## Success Criteria
- [ ] Comparison loads in < 1 second
- [ ] All view modes functional
- [ ] Export preserves formatting
- [ ] Share links work correctly
- [ ] Mobile responsive

## Edge Cases
1. Missing population data
2. Incomplete ingredient data
3. Large number comparisons
4. Custom population handling
5. Export with special characters
6. Broken share links

## Export Templates

### PDF Report
- Title page
- Executive summary
- Detailed comparison tables
- Charts and visualizations
- Methodology notes

### Excel Format
- Summary sheet
- Detailed data sheets
- Pivot table ready
- Conditional formatting

## Share Link Features
- Persistent for 30 days
- Read-only access
- No authentication required
- Mobile optimized view
- Print-friendly layout

## Screenshots
- Step 1: Comparison page
- Step 2: Ingredient selection
- Step 3: Population picker
- Step 4: Difference display
- Step 5: View mode toggle
- Step 6: Export dialog
- Step 7: Share confirmation

## Performance Metrics
- Load time: < 500ms
- Calculation time: < 100ms
- Export generation: < 2s
- View switch: < 50ms

## Navigation Patterns
- Breadcrumbs for context
- Quick filters
- Search within results
- Sort by difference magnitude
- Group by category

## Accessibility Features
- Keyboard navigation
- Screen reader support
- High contrast mode
- Color-blind friendly
- Focus indicators

## Known Issues
- None identified yet

## Improvement Suggestions
- Batch comparisons
- Historical comparisons
- Comparison templates
- Annotation support
- Export scheduling