# Workflow 3: Document Creation

## Overview
Create dynamic documents with formulas, test them, and export

## User Journey
User creates a clinical document template with dynamic calculations

## Steps

### 1. Navigate to Editor
- **Action**: Click "Document Editor" in navigation
- **Expected**: Editor page loads with split view
- **URL**: `/documents/editor`
- **Layout**: Editor left, preview right

### 2. Add Static HTML Section
- **Action**: Type or paste HTML content
- **Expected**: 
  - Syntax highlighting active
  - Auto-completion available
  - HTML rendered in preview
- **Example**: Headers, paragraphs, tables

### 3. Add Dynamic JavaScript Section
- **Action**: Insert JS code block
- **Expected**: 
  - JavaScript syntax highlighting
  - IntelliSense for KPT functions
  - Live evaluation in preview
- **Markers**: `<script>` tags or special delimiters

### 4. Write Formula Using KPT Functions
- **Action**: Use KPT namespace functions
- **Available Functions**:
  - `KPT.calculate()`
  - `KPT.format()`
  - `KPT.validate()`
  - `KPT.aggregate()`
- **Expected**: Auto-complete and documentation

### 5. Add Test Cases
- **Action**: Define test scenarios
- **Expected**: 
  - Test panel opens
  - Input fields for test data
  - Expected output defined
- **Format**: JSON test definitions

### 6. Run Tests
- **Action**: Click "Run Tests" button
- **Expected**: 
  - Tests execute sequentially
  - Pass/fail status shown
  - Error details displayed
  - Coverage metrics shown
- **Validation**: All tests must pass

### 7. Preview Output
- **Action**: Switch to preview tab/panel
- **Expected**: 
  - Live document rendering
  - Dynamic values calculated
  - Responsive layout shown
  - Print preview available
- **Modes**: Desktop, tablet, mobile, print

### 8. Export to PDF/HTML
- **Action**: Click export button
- **Options**:
  - PDF (with page settings)
  - HTML (standalone)
  - Markdown
  - Word document
- **Expected**: File downloaded with formatting preserved

## Document Structure Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>TPN Order Form</title>
</head>
<body>
    <h1>Patient: {{patientName}}</h1>
    
    <section id="calculations">
        <script>
            const weight = KPT.getInput('weight');
            const calories = KPT.calculate('calories', {
                weight: weight,
                factor: 30
            });
            
            KPT.output('Total Calories: ' + calories);
        </script>
    </section>
    
    <table>
        <tr>
            <td>Protein</td>
            <td>{{KPT.format(protein, 'g')}}</td>
        </tr>
    </table>
</body>
</html>
```

## Test Case Format

```json
{
  "name": "Adult Patient Test",
  "inputs": {
    "weight": 70,
    "height": 175,
    "age": 45
  },
  "expected": {
    "calories": 2100,
    "protein": 70,
    "valid": true
  }
}
```

## Success Criteria
- [ ] Document saves automatically
- [ ] Tests run in < 1 second
- [ ] Preview updates in real-time
- [ ] Export maintains formatting
- [ ] Formula errors clearly shown

## Edge Cases
1. Circular formula dependencies
2. Invalid KPT function usage
3. Large document performance
4. Complex table calculations
5. Print layout differences
6. Export with embedded images

## KPT Function Library

### Core Functions
- `KPT.calculate(type, params)` - Perform calculations
- `KPT.format(value, unit)` - Format with units
- `KPT.validate(value, rules)` - Validate inputs
- `KPT.aggregate(array, operation)` - Array operations

### Helper Functions
- `KPT.getInput(name)` - Get input value
- `KPT.setOutput(name, value)` - Set output
- `KPT.conditional(test, true, false)` - Conditionals
- `KPT.lookup(table, key)` - Table lookups

## Export Settings

### PDF Options
- Page size (A4, Letter, Legal)
- Orientation (Portrait, Landscape)
- Margins (Normal, Narrow, Wide)
- Headers/Footers
- Page numbers

### HTML Options
- Inline styles
- External CSS
- Include JavaScript
- Minification

## Screenshots
- Step 1: Editor interface
- Step 3: Code completion
- Step 5: Test panel
- Step 6: Test results
- Step 7: Preview modes
- Step 8: Export dialog

## Performance Targets
- Editor response: < 50ms
- Preview update: < 200ms
- Test execution: < 1s
- Export generation: < 3s

## Known Issues
- None identified yet

## Improvement Suggestions
- Version control integration
- Collaborative editing
- Template library
- Formula wizard
- Visual formula builder