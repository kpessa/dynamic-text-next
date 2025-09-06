# KPT Functions Guide

The KPT namespace provides a comprehensive set of formatting and utility functions for use in dynamic text sections. These functions are automatically available in all dynamic text evaluations.

## Table of Contents
- [Text Formatting](#text-formatting)
- [Number Formatting](#number-formatting)
- [TPN-Specific Formatters](#tpn-specific-formatters)
- [Conditional Display](#conditional-display)
- [Range Checking](#range-checking)
- [HTML Builders](#html-builders)
- [Utility Functions](#utility-functions)
- [Usage Examples](#usage-examples)

## Text Formatting

### Color Functions
```javascript
kpt.redText("Critical")     // Red text
kpt.greenText("Success")    // Green text
kpt.blueText("Info")        // Blue text
```

### Style Functions
```javascript
kpt.boldText("Important")           // Bold text
kpt.italicText("Emphasis")          // Italic text
kpt.underlineText("Underlined")     // Underlined text
kpt.highlightText("Note")           // Yellow highlight
kpt.highlightText("Alert", "#ffcccc") // Custom highlight color
```

## Number Formatting

```javascript
kpt.roundTo(3.14159, 2)              // 3.14
kpt.formatNumber(1234567.89)         // "1,234,567.89"
kpt.formatPercent(75.5)              // "75.5%"
kpt.formatCurrency(1234.56)          // "$1,234.56"
kpt.formatCurrency(99.99, "EUR")     // "€99.99"
```

## TPN-Specific Formatters

### Weight Formatting
```javascript
kpt.formatWeight(75)        // "75 kg"
kpt.formatWeight(0.5)       // "500 g" (auto-converts)
kpt.formatWeight(1500, "g") // "1.5 kg" (auto-converts)
```

### Volume Formatting
```javascript
kpt.formatVolume(500)       // "500 mL"
kpt.formatVolume(1500)      // "1.5 L" (auto-converts)
kpt.formatVolume(0.5, "L")  // "500 mL" (auto-converts)
```

### Dose Formatting
```javascript
kpt.formatDose(250)         // "250 mg"
kpt.formatDose(0.5)         // "500 mcg" (auto-converts)
kpt.formatDose(5000)        // "5 g" (auto-converts)
```

### Other TPN Formatters
```javascript
kpt.formatConcentration(10)      // "10 mg/mL"
kpt.formatInfusionRate(125)      // "125 mL/hr"
kpt.formatOsmolarity(300)        // "300 mOsm/L"
```

## Conditional Display

```javascript
kpt.showIf(condition, "Content")           // Shows if true
kpt.hideIf(condition, "Content")           // Hides if true
kpt.whenAbove(value, 10, "High")          // Shows when value > 10
kpt.whenBelow(value, 5, "Low")            // Shows when value < 5
kpt.whenInRange(value, 1, 10, "Normal")   // Shows when 1 <= value <= 10
```

## Range Checking

```javascript
// Basic range checking
kpt.isNormal(value, min, max)              // Returns boolean
kpt.isCritical(value, critMin, critMax)    // Returns boolean

// Advanced range checking
kpt.checkRange(value, [2, 8], [0, 10])     // Returns "normal", "abnormal", or "critical"

// Detailed status
kpt.getRangeStatus(value, {
  criticalLow: 130,
  low: 135,
  high: 145,
  criticalHigh: 150
})  // Returns "critical-low", "low", "normal", "high", or "critical-high"
```

## HTML Builders

### Tables
```javascript
const data = [
  ["Name", "Value"],
  ["Glucose", 250],
  ["Sodium", 140]
];
kpt.createTable(data, ["Parameter", "Result"])
```

### Lists
```javascript
kpt.createList(["Item 1", "Item 2", "Item 3"])        // Unordered list
kpt.createList(["First", "Second", "Third"], true)    // Ordered list
```

### Alerts
```javascript
kpt.createAlert("Information", "info")
kpt.createAlert("Warning!", "warning")
kpt.createAlert("Error occurred", "error")
kpt.createAlert("Success!", "success")
```

### Cards
```javascript
kpt.createCard(
  "Patient Information",                    // Title
  "Weight: 75 kg<br>Height: 180 cm",       // Content
  "Last updated: Today"                     // Footer (optional)
)
```

### Progress Bars
```javascript
kpt.createProgress(75, 100, "Completion")  // 75% progress with label
```

## Utility Functions

```javascript
kpt.capitalize("hello")                    // "Hello"
kpt.pluralize(1, "item")                   // "1 item"
kpt.pluralize(5, "item")                   // "5 items"
kpt.pluralize(3, "child", "children")      // "3 children"
kpt.abbreviate("Long text here", 10)       // "Long te..."
```

## Usage Examples

### In Dynamic Text Sections

#### Example 1: Patient Data Display
```javascript
// Dynamic section code:
const weight = 75;
const sodium = 135;
const glucose = 180;

const sodiumStatus = kpt.checkRange(sodium, [136, 145]);
const glucoseStatus = glucose > 140 ? "high" : "normal";

const output = [
  kpt.boldText("Patient Metrics:"),
  "Weight: " + kpt.formatWeight(weight),
  "Sodium: " + sodium + " mEq/L - " + 
    (sodiumStatus === "normal" ? kpt.greenText("Normal") : kpt.redText("Abnormal")),
  "Glucose: " + glucose + " mg/dL - " + 
    (glucoseStatus === "high" ? kpt.redText("High") : kpt.greenText("Normal"))
].join("\n");

return output;
```

#### Example 2: TPN Calculation Display
```javascript
// Dynamic section code:
const patientWeight = 70; // kg
const infusionRate = 125; // mL/hr
const concentration = 10; // mg/mL
const dailyVolume = infusionRate * 24;

const table = kpt.createTable([
  ["Patient Weight", kpt.formatWeight(patientWeight)],
  ["Infusion Rate", kpt.formatInfusionRate(infusionRate)],
  ["Concentration", kpt.formatConcentration(concentration)],
  ["Daily Volume", kpt.formatVolume(dailyVolume)]
], ["Parameter", "Value"]);

return table;
```

### In Text Interpolation

You can use KPT functions directly in text with the `${}` syntax:

```markdown
Patient weight: ${kpt.formatWeight(weight)}
Sodium level: ${kpt.whenAbove(sodium, 145, kpt.redText("High"))}
Dose: ${kpt.boldText(kpt.formatDose(dose))}
```

### Complex Conditional Formatting

```javascript
// Dynamic section with conditional formatting
const labValue = 150;
const normalRange = [136, 145];
const criticalRange = [130, 155];

const status = kpt.checkRange(labValue, normalRange, criticalRange);

let output;
switch(status) {
  case 'normal':
    output = kpt.greenText("✓ Normal");
    break;
  case 'abnormal':
    output = kpt.redText("⚠ Abnormal");
    break;
  case 'critical':
    output = kpt.boldText(kpt.redText("⚠️ CRITICAL"));
    break;
}

return kpt.createAlert(
  `Lab Value: ${labValue} - ${output}`,
  status === 'critical' ? 'error' : status === 'abnormal' ? 'warning' : 'success'
);
```

### Creating Dynamic Reports

```javascript
// Generate a formatted report
const patientData = {
  name: "John Doe",
  weight: 75,
  height: 180,
  medications: [
    { name: "Medication A", dose: 250, unit: "mg" },
    { name: "Medication B", dose: 0.5, unit: "mg" }
  ]
};

const medicationList = patientData.medications.map(med => 
  `${med.name}: ${kpt.formatDose(med.dose, med.unit)}`
);

const report = [
  kpt.boldText("Patient Report"),
  "",
  kpt.createCard(
    "Basic Information",
    `Name: ${patientData.name}<br>` +
    `Weight: ${kpt.formatWeight(patientData.weight)}<br>` +
    `Height: ${patientData.height} cm`
  ),
  "",
  kpt.boldText("Medications:"),
  kpt.createList(medicationList)
].join("\n");

return report;
```

## Best Practices

1. **Use appropriate formatters**: Always use TPN-specific formatters for medical values (weight, volume, dose) as they handle unit conversions automatically.

2. **Combine functions for rich formatting**: Chain functions like `kpt.boldText(kpt.redText("Critical"))` for emphasis.

3. **Leverage conditional display**: Use `whenAbove`, `whenBelow`, and `whenInRange` for threshold-based content.

4. **Sanitization is automatic**: All HTML output from KPT functions is sanitized with DOMPurify to prevent XSS attacks.

5. **Performance**: KPT functions are lightweight and optimized. Feel free to use them extensively in your dynamic sections.

## Security Notes

- All HTML generated by KPT functions is sanitized using DOMPurify
- Functions validate input to prevent injection attacks
- Color values in `highlightText` are validated against safe patterns
- Custom functions (when implemented) will have security validation

## Troubleshooting

### Function not found
If you get an error about a KPT function not being found, ensure you're using the correct syntax:
- ✅ `kpt.functionName(args)`
- ❌ `functionName(args)`
- ❌ `KPT.functionName(args)`

### HTML not rendering
If HTML output appears as plain text, ensure your display component supports HTML rendering. The KPT functions return sanitized HTML strings that are safe to render.

### Unit conversion not working
The TPN formatters automatically convert units based on the value. If you want to force a specific unit, you may need to adjust your logic:
```javascript
// Force display in grams even for values > 1000
const weightInGrams = weight * 1000;
return `${weightInGrams} g`; // Manual formatting

// vs automatic conversion
return kpt.formatWeight(weight); // Will auto-convert to appropriate unit
```