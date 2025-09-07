# Workflow 1: TPN Calculation

## Overview
Complete TPN calculation workflow from data entry to saving as ingredient

## User Journey
User needs to calculate TPN requirements for a patient and save the results for future use

## Steps

### 1. Navigate to TPN Calculator
- **Action**: Click "TPN Calculator" in navigation or dashboard
- **Expected**: TPN Calculator page loads with input form visible
- **URL**: `/tpn/calculator`

### 2. Select Population Type
- **Action**: Choose from dropdown (Neonatal, Pediatric, Adult)
- **Expected**: Form fields update based on population
- **Validation**: Required fields marked

### 3. Enter Patient Data
- **Action**: Fill in required fields
  - Weight (kg)
  - Age/Gestational Age
  - Height (if applicable)
  - Additional clinical parameters
- **Expected**: Real-time validation feedback
- **Validation**: Error messages for invalid inputs

### 4. Review Calculations
- **Action**: Click "Calculate" button or auto-calculate
- **Expected**: 
  - Results appear in results panel
  - Macronutrients displayed
  - Micronutrients shown
  - Total volume calculated
- **Validation**: Results match expected ranges

### 5. Save as New Ingredient
- **Action**: Click "Save as Ingredient" button
- **Expected**: 
  - Save dialog opens
  - Name field pre-populated
  - Category selectable
  - Notes field available
- **Validation**: Duplicate name warning if exists

### 6. Navigate to Ingredient Manager
- **Action**: Click "View in Manager" or navigate manually
- **Expected**: Ingredient list loads
- **URL**: `/ingredients/manage`

### 7. Verify Ingredient Appears
- **Action**: Search or filter for saved ingredient
- **Expected**: 
  - Ingredient visible in list
  - All data preserved
  - Correct category assigned
- **Validation**: Data integrity maintained

### 8. Load Ingredient for Use
- **Action**: Select ingredient and click "Use in Calculator"
- **Expected**: 
  - Navigate back to calculator
  - Values pre-populated
  - Can modify and recalculate

## Success Criteria
- [ ] Workflow completable in < 2 minutes
- [ ] All data persists correctly
- [ ] No errors during normal flow
- [ ] Mobile responsive at all steps

## Edge Cases
1. Invalid input handling
2. Network failure during save
3. Duplicate ingredient names
4. Browser refresh mid-workflow
5. Mobile keyboard interactions

## Screenshots
- Step 1: Calculator page load
- Step 3: Form with validation
- Step 4: Results display
- Step 5: Save dialog
- Step 7: Ingredient in list

## Test Data
```json
{
  "population": "Pediatric",
  "weight": 25,
  "age": 8,
  "height": 120,
  "expectedCalories": 1750,
  "expectedProtein": 25
}
```

## Known Issues
- None identified yet

## Improvement Suggestions
- Auto-save draft calculations
- Quick templates for common scenarios
- Batch calculation support