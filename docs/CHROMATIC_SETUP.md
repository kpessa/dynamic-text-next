# Chromatic Visual Testing Setup Guide

## Overview
Chromatic is configured for automated visual regression testing of all Storybook components. It captures screenshots of every component variant and compares them against baselines to detect unintended visual changes.

## Initial Setup

### 1. Get Your Project Token
1. Sign up at [chromatic.com](https://www.chromatic.com)
2. Create a new project
3. Copy your project token

### 2. Set Environment Variables

#### Local Development
Create a `.env.local` file:
```bash
CHROMATIC_PROJECT_TOKEN=your-token-here
```

#### GitHub Repository
Add as a repository secret:
1. Go to Settings → Secrets and variables → Actions
2. Add new secret: `CHROMATIC_PROJECT_TOKEN`

### 3. Run Initial Baseline
```bash
# Create baseline snapshots
pnpm chromatic

# Or with explicit token
npx chromatic --project-token=your-token-here
```

## Usage

### Manual Testing
```bash
# Run Chromatic locally
pnpm chromatic

# Accept all changes as baseline
pnpm chromatic --auto-accept-changes

# Only test changed components
pnpm chromatic --only-changed
```

### Automatic CI/CD Testing
Chromatic runs automatically on:
- Every push to `main` branch
- Every pull request

Results appear as:
- PR comments with visual changes
- Status checks blocking merge if needed
- Links to Chromatic UI for review

## Component Coverage

### Phase 1: Essential Atoms ✅
- Input (5 variants)
- Select (3 variants)  
- Checkbox (4 variants)
- Radio (3 variants)
- Typography (6 variants)

### Phase 2: Feedback Atoms ✅
- Alert (6 variants)
- Badge (5 variants)
- Chip (6 variants)
- Progress (4 variants)
- Skeleton (7 variants)

### Phase 3: Interactive Molecules ✅
- FormField (6 variants)
- SearchBar (5 variants)
- DatePicker (5 variants)
- FileUpload (5 variants)
- Pagination (6 variants)

**Total Coverage: 15 components, 70+ variants**

## Best Practices

### When to Run Chromatic

1. **Before Merging PRs**
   - Automatic via GitHub Actions
   - Review visual changes in Chromatic UI

2. **After Theme Changes**
   ```bash
   pnpm chromatic --auto-accept-changes
   ```

3. **After Dependency Updates**
   ```bash
   pnpm update @mui/material
   pnpm chromatic
   ```

### Handling Visual Changes

#### Intentional Changes
1. Review in Chromatic UI
2. Click "Accept" for intended changes
3. Merge PR

#### Unintentional Changes
1. Review the diff
2. Fix the regression
3. Re-run Chromatic

### Optimizing Test Runs

```javascript
// In .storybook/preview.js
export const parameters = {
  chromatic: {
    // Disable animations
    pauseAnimationAtEnd: true,
    
    // Disable for specific stories
    disableSnapshot: false,
    
    // Set delay for async content
    delay: 200,
    
    // Test specific viewports
    viewports: [320, 768, 1200]
  }
}
```

## Troubleshooting

### Common Issues

1. **Flaky Tests**
   - Add delays for async content
   - Disable animations
   - Use `pauseAnimationAtEnd`

2. **Large Build Size**
   ```bash
   # Use turbo-snap to only test changed components
   pnpm chromatic --only-changed
   ```

3. **Font Loading Issues**
   - Ensure fonts are loaded before capture
   - Add font preloading in `.storybook/preview-head.html`

### Debug Mode
```bash
# Run with debug output
pnpm chromatic --debug

# Check build logs
pnpm chromatic --diagnostics
```

## Cost Management

### Free Tier
- 5,000 snapshots/month
- Sufficient for ~70 PRs/month

### Optimization Tips
1. Use `--only-changed` flag
2. Skip unchanged stories
3. Combine related changes in single PRs
4. Use `exitZeroOnChanges` for non-blocking tests

## Integration with Development Workflow

### Pre-commit Hook
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-push": "pnpm chromatic --only-changed --exit-zero-on-changes"
    }
  }
}
```

### VS Code Extension
Install "Chromatic" extension for:
- In-editor visual diff preview
- Quick access to Chromatic builds
- Component change notifications

## Reporting

### Weekly Visual Regression Report
Access at: `https://www.chromatic.com/builds?appId=<your-app-id>`

Metrics tracked:
- Total visual changes
- Component stability score
- Most frequently changed components
- Team approval time

## Resources
- [Chromatic Documentation](https://www.chromatic.com/docs)
- [Storybook Integration Guide](https://www.chromatic.com/docs/storybook)
- [CI/CD Setup](https://www.chromatic.com/docs/ci)
- [Pricing & Limits](https://www.chromatic.com/pricing)