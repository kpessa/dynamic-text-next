import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { KPTDemo } from './KPTDemo';

const meta = {
  title: 'Features/KPT Functions/Demo',
  component: KPTDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The KPT Functions Demo showcases the comprehensive KPT namespace available in dynamic text sections.

## Features
- **Text Formatting**: Color, bold, italic, underline, and highlight functions
- **Number Formatting**: Number, currency, and percentage formatters
- **TPN Formatters**: Weight, volume, dose, concentration, and infusion rate formatters
- **Conditional Display**: Show/hide content based on conditions
- **Range Checking**: Check values against normal and critical ranges
- **HTML Builders**: Create tables, lists, alerts, cards, and progress bars
- **Utility Functions**: Capitalize, pluralize, and abbreviate text

## Usage
All KPT functions are automatically available in dynamic text sections via the \`kpt\` object.

### In Dynamic Sections
\`\`\`javascript
return kpt.redText("Critical");
\`\`\`

### In Text Interpolation
\`\`\`
Weight: \${kpt.formatWeight(75)}
\`\`\`
        `
      }
    }
  },
} satisfies Meta<typeof KPTDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const TextFormattingExample: Story = {
  name: 'Text Formatting',
  parameters: {
    docs: {
      description: {
        story: `
Example showing text formatting functions:
- \`kpt.redText()\` - Red colored text
- \`kpt.greenText()\` - Green colored text  
- \`kpt.blueText()\` - Blue colored text
- \`kpt.boldText()\` - Bold text
- \`kpt.italicText()\` - Italic text
- \`kpt.underlineText()\` - Underlined text
- \`kpt.highlightText()\` - Highlighted text with custom colors
        `
      }
    }
  }
};

export const NumberFormattingExample: Story = {
  name: 'Number Formatting',
  parameters: {
    docs: {
      description: {
        story: `
Number formatting functions for different use cases:
- \`kpt.formatNumber()\` - Formats with thousands separators
- \`kpt.formatCurrency()\` - Currency formatting with symbols
- \`kpt.formatPercent()\` - Percentage formatting
- \`kpt.roundTo()\` - Round to specific decimal places
        `
      }
    }
  }
};

export const TPNFormattersExample: Story = {
  name: 'TPN Formatters',
  parameters: {
    docs: {
      description: {
        story: `
Specialized formatters for TPN calculations:
- \`kpt.formatWeight()\` - Auto-converts between kg and g
- \`kpt.formatVolume()\` - Auto-converts between mL and L
- \`kpt.formatDose()\` - Auto-converts between mcg, mg, and g
- \`kpt.formatConcentration()\` - Formats concentration values
- \`kpt.formatInfusionRate()\` - Formats infusion rates
- \`kpt.formatOsmolarity()\` - Formats osmolarity values
        `
      }
    }
  }
};

export const ConditionalDisplayExample: Story = {
  name: 'Conditional Display',
  parameters: {
    docs: {
      description: {
        story: `
Functions for conditional content display:
- \`kpt.showIf()\` - Shows content when condition is true
- \`kpt.hideIf()\` - Hides content when condition is true
- \`kpt.whenAbove()\` - Shows content when value exceeds threshold
- \`kpt.whenBelow()\` - Shows content when value is below threshold
- \`kpt.whenInRange()\` - Shows content when value is within range
        `
      }
    }
  }
};

export const RangeCheckingExample: Story = {
  name: 'Range Checking',
  parameters: {
    docs: {
      description: {
        story: `
Functions for checking values against ranges:
- \`kpt.checkRange()\` - Returns "normal", "abnormal", or "critical"
- \`kpt.isNormal()\` - Boolean check for normal range
- \`kpt.isCritical()\` - Boolean check for critical values
- \`kpt.getRangeStatus()\` - Detailed status with multiple thresholds
        `
      }
    }
  }
};

export const HTMLBuildersExample: Story = {
  name: 'HTML Builders',
  parameters: {
    docs: {
      description: {
        story: `
Functions for creating HTML elements:
- \`kpt.createTable()\` - Creates formatted tables with headers
- \`kpt.createList()\` - Creates ordered or unordered lists
- \`kpt.createAlert()\` - Creates alert boxes (info, warning, error, success)
- \`kpt.createCard()\` - Creates card components with title and content
- \`kpt.createProgress()\` - Creates progress bars with labels

All HTML output is sanitized with DOMPurify for security.
        `
      }
    }
  }
};