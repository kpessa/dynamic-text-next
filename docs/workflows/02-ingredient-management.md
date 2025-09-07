# Workflow 2: Ingredient Management

## Overview
Import ingredients, identify duplicates, and manage ingredient library

## User Journey
User needs to import ingredients from external source and clean up duplicates

## Steps

### 1. Open Ingredient Manager
- **Action**: Navigate to Ingredients section
- **Expected**: Ingredient list page loads
- **URL**: `/ingredients/manage`
- **Initial State**: Existing ingredients displayed

### 2. Click Import
- **Action**: Click "Import" button in toolbar
- **Expected**: 
  - Import dialog opens
  - File upload area visible
  - Format options shown (CSV, JSON, XML)
- **Validation**: Supported file types only

### 3. Select File
- **Action**: Choose file via drag-drop or browse
- **Expected**: 
  - File accepted
  - Loading indicator shown
  - File parsed and validated
- **Formats**: 
  - CSV with headers
  - JSON array
  - XML structure

### 4. Review Import Preview
- **Action**: View parsed data in preview table
- **Expected**: 
  - Column mapping shown
  - Data types validated
  - Row count displayed
  - Errors highlighted
- **Validation**: Required fields present

### 5. Identify Duplicates
- **Action**: System auto-detects duplicates
- **Expected**: 
  - Duplicate count shown
  - Duplicates highlighted in preview
  - Matching criteria displayed
- **Detection**: Based on name, category, values

### 6. Merge or Skip Duplicates
- **Action**: Choose action for each duplicate
- **Options**:
  - Skip (don't import)
  - Replace (overwrite existing)
  - Merge (combine data)
  - Keep both (rename new)
- **Expected**: Preview updates with choices

### 7. Complete Import
- **Action**: Click "Import" to execute
- **Expected**: 
  - Progress bar shown
  - Success/error count displayed
  - List refreshes with new data
- **Validation**: Transaction integrity

### 8. Verify Data Integrity
- **Action**: Review imported ingredients
- **Expected**: 
  - All data correctly imported
  - Categories assigned
  - Values preserved
  - No data corruption

## Success Criteria
- [ ] Import 100+ ingredients successfully
- [ ] Duplicate detection accuracy > 95%
- [ ] No data loss during import
- [ ] Rollback available on error

## Edge Cases
1. Malformed file handling
2. Large file performance (1000+ rows)
3. Mixed encodings (UTF-8, ASCII)
4. Missing required fields
5. Network interruption during import
6. Conflicting duplicate resolutions

## File Format Examples

### CSV Format
```csv
name,category,protein,fat,carbs,calories
"Standard PN",parenteral,4.0,3.0,15.0,103
"Pediatric Mix",pediatric,3.5,2.5,12.0,85
```

### JSON Format
```json
[
  {
    "name": "Standard PN",
    "category": "parenteral",
    "macros": {
      "protein": 4.0,
      "fat": 3.0,
      "carbs": 15.0
    },
    "calories": 103
  }
]
```

## Screenshots
- Step 1: Ingredient list view
- Step 2: Import dialog
- Step 4: Import preview
- Step 5: Duplicate detection
- Step 6: Merge options
- Step 7: Import progress

## Performance Metrics
- Small file (< 100 rows): < 2 seconds
- Medium file (100-500 rows): < 5 seconds
- Large file (500+ rows): < 10 seconds

## Known Issues
- None identified yet

## Improvement Suggestions
- Batch operations support
- Import history/undo
- Template downloads
- Auto-categorization
- Smart duplicate matching