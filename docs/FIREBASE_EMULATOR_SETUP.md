# Firebase Emulator Setup

## Prerequisites

1. Node.js 20 or higher
2. Firebase CLI (will be installed automatically if not present)

## Installation

```bash
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Install functions dependencies
cd functions && npm install && cd ..
```

## Running the Emulators

### Quick Start

```bash
# Start all emulators with one command
pnpm emulators
```

### Manual Start

```bash
# Start emulators manually
firebase emulators:start

# Or start specific emulators
firebase emulators:start --only functions,firestore
```

## Emulator URLs

- **Emulator UI**: http://localhost:4000
- **Functions**: http://localhost:5001
- **Firestore**: http://localhost:8080
- **Auth**: http://localhost:9099
- **Storage**: http://localhost:9199

## Environment Configuration

Set the following in your `.env.local` file:

```env
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
```

## Available Cloud Functions

The following Cloud Functions are available in the emulator:

### TPN Functions
- `calculateTPNValues` - Calculate TPN nutrient values
- `validateIngredients` - Validate ingredient compatibility
- `optimizeFormula` - Optimize TPN formula
- `compareFormulas` - Compare multiple formulas

### Document Functions
- `generatePDF` - Generate PDF reports
- `exportData` - Export data in various formats
- `generateReport` - Generate detailed reports
- `convertDocument` - Convert between document formats

### AI Functions
- `generateTestCases` - Generate test cases for sections
- `getRecommendations` - Get AI-powered recommendations
- `analyzeFormula` - Analyze formula composition
- `predictOutcome` - Predict treatment outcomes
- `suggestIngredients` - Suggest optimal ingredients
- `validateMedicalContent` - Validate medical content

### Utility Functions
- `healthCheck` - Check function health status

## Testing Functions

### Using the Functions UI

1. Navigate to http://localhost:4000
2. Click on "Functions" tab
3. Select a function to test
4. Enter test data and execute

### Using the Application

Functions are automatically called through the application when:
- Calculating TPN values
- Generating reports
- Getting recommendations
- Exporting data

### Manual Testing with cURL

```bash
# Example: Call healthCheck function
curl -X POST http://localhost:5001/dynamic-text-next-dev/us-central1/healthCheck \
  -H "Content-Type: application/json" \
  -d '{"data": {}}'
```

## Data Persistence

Emulator data is automatically:
- Exported to `./emulator-data` on exit
- Imported from `./emulator-data` on start

To manually export data:
```bash
pnpm emulators:export
```

## Troubleshooting

### Port Already in Use

If you get port conflicts:

1. Check for running processes:
```bash
lsof -i :5001  # Check functions port
lsof -i :8080  # Check Firestore port
```

2. Kill the process:
```bash
kill -9 <PID>
```

3. Or use different ports in `firebase.json`

### Functions Not Loading

1. Rebuild functions:
```bash
pnpm functions:build
```

2. Check for TypeScript errors:
```bash
cd functions && npx tsc --noEmit
```

### Emulator Not Starting

1. Clear emulator data:
```bash
rm -rf ./emulator-data
```

2. Reinstall dependencies:
```bash
cd functions && rm -rf node_modules && npm install
```

## Development Workflow

1. Start the emulators:
```bash
pnpm emulators
```

2. In another terminal, start the Next.js dev server:
```bash
pnpm dev
```

3. The application will automatically connect to the emulators when `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`

## Production Deployment

For production, Cloud Functions are deployed with:

```bash
firebase deploy --only functions
```

Make sure to:
1. Set production environment variables
2. Configure proper security rules
3. Test thoroughly before deployment