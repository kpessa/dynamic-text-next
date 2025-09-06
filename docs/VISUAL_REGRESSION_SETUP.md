# Visual Regression Testing Setup

## Overview
This guide documents the visual regression testing setup for the Dynamic Text Next component library using Chromatic and Storybook.

## Table of Contents
1. [Chromatic Integration](#chromatic-integration)
2. [Setup Instructions](#setup-instructions)
3. [Running Visual Tests](#running-visual-tests)
4. [CI/CD Integration](#cicd-integration)
5. [Best Practices](#best-practices)
6. [Component Coverage](#component-coverage)

## Chromatic Integration

Chromatic provides automated visual regression testing by capturing snapshots of all Storybook stories and comparing them against baselines.

### Features
- **Automatic Visual Testing**: Every story becomes a visual test
- **Cross-browser Testing**: Tests across Chrome, Firefox, Safari, and Edge
- **Responsive Testing**: Validates components at different viewport sizes
- **UI Review**: Collaborative review process for visual changes
- **Git Integration**: Seamless integration with GitHub/GitLab

## Setup Instructions

### 1. Environment Configuration

Create or update `.env.local`:
```env
CHROMATIC_PROJECT_TOKEN=your_token_here
```

### 2. Install Chromatic

```bash
# Already included in package.json
pnpm add -D chromatic
```

### 3. Configure Storybook for Chromatic

Update `.storybook/main.ts`:
```typescript
export default {
  // ... existing config
  features: {
    buildStoriesJson: true // Required for Chromatic
  }
}
```

### 4. Add Chromatic Scripts

Already configured in `package.json`:
```json
{
  "scripts": {
    "chromatic": "chromatic --project-token=$CHROMATIC_PROJECT_TOKEN",
    "chromatic:ci": "chromatic --project-token=$CHROMATIC_PROJECT_TOKEN --exit-once-uploaded"
  }
}
```

## Running Visual Tests

### Local Testing

#### Quick Test (Exit after upload)
```bash
pnpm chromatic:ci
```

#### Full Interactive Mode
```bash
pnpm chromatic
```

#### With Specific Token
```bash
pnpm dlx chromatic --project-token=<token> --exit-once-uploaded
```

### Options

```bash
# Auto-accept changes for specific components
pnpm chromatic --auto-accept-changes "src/shared/ui/atoms/**"

# Only run specific stories
pnpm chromatic --only-story-names "Button/*"

# Skip specific stories
pnpm chromatic --skip "*.Mobile*"

# Test at specific viewports
pnpm chromatic --viewport 320,768,1024
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/chromatic.yml`:
```yaml
name: Chromatic

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0 # Required for Chromatic

      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Build Storybook
        run: pnpm build-storybook

      - name: Run Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          exitOnceUploaded: true
          autoAcceptChanges: 'main'
```

### GitLab CI

Create `.gitlab-ci.yml`:
```yaml
chromatic:
  stage: test
  image: node:20
  before_script:
    - npm install -g pnpm
    - pnpm install
  script:
    - pnpm build-storybook
    - pnpm chromatic --project-token=$CHROMATIC_PROJECT_TOKEN --exit-once-uploaded
  only:
    - merge_requests
    - main
    - develop
```

## Best Practices

### 1. Story Organization

Structure stories for optimal visual testing:

```tsx
// Component.stories.tsx
export default {
  title: 'Category/ComponentName',
  component: Component,
  parameters: {
    chromatic: {
      // Capture at multiple viewports
      viewports: [320, 768, 1200],
      // Delay capture for animations
      delay: 300,
      // Disable animations
      pauseAnimationAtEnd: true
    }
  }
}

// Test specific states
export const Default: Story = {}
export const Loading: Story = {}
export const Error: Story = {}
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' }
  }
}
```

### 2. Handling Dynamic Content

#### Disable Animations
```tsx
export const AnimatedComponent: Story = {
  parameters: {
    chromatic: { pauseAnimationAtEnd: true }
  }
}
```

#### Mock Dates/Times
```tsx
export const DateComponent: Story = {
  args: {
    date: new Date('2024-01-01T12:00:00')
  }
}
```

#### Stable Random Data
```tsx
import { seed } from 'faker'
seed(123) // Always use same seed for consistency
```

### 3. Ignore Flaky Elements

```tsx
// Ignore specific elements
export const WithDynamicContent: Story = {
  parameters: {
    chromatic: {
      diffThreshold: 0.2, // Allow 20% difference
      diffIncludeAntiAliasing: false
    }
  }
}

// Skip story entirely
export const SkipThisStory: Story = {
  parameters: {
    chromatic: { disableSnapshot: true }
  }
}
```

### 4. Performance Optimization

```tsx
// Reduce snapshot count for similar variants
export default {
  parameters: {
    chromatic: {
      modes: {
        light: { theme: 'light' },
        dark: { theme: 'dark' }
      }
    }
  }
}
```

## Component Coverage

### Current Coverage Status

#### ✅ Atoms (12/12)
- [x] Alert - All variants and states
- [x] Badge - Numeric and dot variants
- [x] Button - All sizes and variants
- [x] Checkbox - With indeterminate state
- [x] Chip - Clickable and deletable
- [x] Input - All input types
- [x] MuiButton - Material UI integration
- [x] Progress - Circular and linear
- [x] Radio - With RadioGroup
- [x] Select - Single and multi-select
- [x] Skeleton - All loading variants
- [x] Typography - All text styles

#### ✅ Molecules (10/10)
- [x] Card - Elevated and outlined
- [x] DatePicker - With range selection
- [x] FileUpload - Drag and drop
- [x] FormField - With validation
- [x] Pagination - With size selector
- [x] SearchBar - With suggestions
- [x] Modal - All dialog types
- [x] Drawer - All positions
- [x] Tabs - Horizontal and vertical
- [x] Accordion - Single and multiple

#### ✅ Organisms (7/7)
- [x] DataTable - With sorting and filtering
- [x] EmptyState - All variants
- [x] Form - With all field types
- [x] List - With virtual scrolling
- [x] StepperForm - Multi-step forms
- [x] Navigation - Desktop and mobile
- [x] Footer - All layout variants

### Testing Matrix

| Component Type | Desktop | Tablet | Mobile | Dark Mode | RTL | A11y |
|---------------|---------|--------|--------|-----------|-----|------|
| Atoms         | ✅      | ✅     | ✅     | ✅        | ⏳  | ✅   |
| Molecules     | ✅      | ✅     | ✅     | ✅        | ⏳  | ✅   |
| Organisms     | ✅      | ✅     | ✅     | ✅        | ⏳  | ✅   |

## Chromatic Test Configuration

### Component-Specific Settings

```typescript
// atoms/Button/Button.stories.tsx
export default {
  parameters: {
    chromatic: {
      viewports: [320, 1200],
      disableSnapshot: false
    }
  }
}

// molecules/Modal/Modal.stories.tsx
export default {
  parameters: {
    chromatic: {
      delay: 500, // Wait for animation
      viewports: [768, 1200]
    }
  }
}

// organisms/DataTable/DataTable.stories.tsx
export default {
  parameters: {
    chromatic: {
      viewports: [1200], // Desktop only
      diffThreshold: 0.1
    }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Token Not Found
```bash
Error: Missing project token
Solution: Set CHROMATIC_PROJECT_TOKEN in .env.local
```

#### 2. Build Too Large
```bash
Error: Build exceeds size limit
Solution: Optimize stories, reduce variants
```

#### 3. Flaky Snapshots
```bash
Problem: Tests fail due to animations/dynamic content
Solution: Use pauseAnimationAtEnd or mock dynamic data
```

#### 4. Slow Uploads
```bash
Problem: Chromatic upload takes too long
Solution: Use --exit-once-uploaded flag
```

## Monitoring & Reporting

### Chromatic Dashboard
- View test results at: https://www.chromatic.com/builds?appId=[YOUR_APP_ID]
- Review visual changes before merging
- Track component coverage metrics
- Monitor performance trends

### Metrics to Track
- **Visual Coverage**: % of components with visual tests
- **Change Frequency**: How often components change visually
- **Review Time**: Average time to review visual changes
- **Catch Rate**: Bugs caught by visual testing

## Best Practices Summary

1. **Write Comprehensive Stories**: Cover all component states
2. **Use Consistent Data**: Mock dynamic content
3. **Test Responsiveness**: Include mobile/tablet viewports
4. **Review Changes**: Don't auto-accept without review
5. **Optimize Performance**: Minimize unnecessary snapshots
6. **Document Exceptions**: Explain why certain stories are skipped
7. **Regular Baseline Updates**: Keep baselines current
8. **Cross-browser Testing**: Test in multiple browsers quarterly

## Next Steps

1. ✅ Configure Chromatic project token
2. ✅ Build Storybook with all components
3. ⏳ Run initial baseline capture
4. ⏳ Set up CI/CD integration
5. ⏳ Configure team review process
6. ⏳ Establish visual testing guidelines

## Resources

- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Storybook Visual Testing](https://storybook.js.org/docs/react/writing-tests/visual-testing)
- [Component Story Format](https://storybook.js.org/docs/react/api/csf)
- [CI/CD Integration Guide](https://www.chromatic.com/docs/ci)