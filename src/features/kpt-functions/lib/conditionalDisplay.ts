export interface ConditionalDisplay {
  showIf: (condition: boolean, content: string) => string;
  hideIf: (condition: boolean, content: string) => string;
  whenAbove: (value: number, threshold: number, content: string) => string;
  whenBelow: (value: number, threshold: number, content: string) => string;
  whenInRange: (value: number, min: number, max: number, content: string) => string;
}

export function createConditionalDisplay(): ConditionalDisplay {
  return {
    showIf: (condition: boolean, content: string): string => {
      return condition ? content : '';
    },

    hideIf: (condition: boolean, content: string): string => {
      return condition ? '' : content;
    },

    whenAbove: (value: number, threshold: number, content: string): string => {
      if (Number.isNaN(value) || Number.isNaN(threshold)) return '';
      return value > threshold ? content : '';
    },

    whenBelow: (value: number, threshold: number, content: string): string => {
      if (Number.isNaN(value) || Number.isNaN(threshold)) return '';
      return value < threshold ? content : '';
    },

    whenInRange: (value: number, min: number, max: number, content: string): string => {
      if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) return '';
      return value >= min && value <= max ? content : '';
    }
  };
}

export const conditionalDisplayDocumentation = [
  {
    name: 'showIf',
    category: 'Conditional Display',
    description: 'Shows content only if condition is true',
    parameters: [
      { name: 'condition', type: 'boolean', required: true, description: 'Condition to evaluate' },
      { name: 'content', type: 'string', required: true, description: 'Content to display' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.showIf(true, "Visible")', result: 'Visible' },
      { code: 'kpt.showIf(false, "Hidden")', result: '' }
    ]
  },
  {
    name: 'hideIf',
    category: 'Conditional Display',
    description: 'Hides content if condition is true',
    parameters: [
      { name: 'condition', type: 'boolean', required: true, description: 'Condition to evaluate' },
      { name: 'content', type: 'string', required: true, description: 'Content to display' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.hideIf(true, "Hidden")', result: '' },
      { code: 'kpt.hideIf(false, "Visible")', result: 'Visible' }
    ]
  },
  {
    name: 'whenAbove',
    category: 'Conditional Display',
    description: 'Shows content when value is above threshold',
    parameters: [
      { name: 'value', type: 'number', required: true, description: 'Value to check' },
      { name: 'threshold', type: 'number', required: true, description: 'Threshold value' },
      { name: 'content', type: 'string', required: true, description: 'Content to display' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.whenAbove(10, 5, "High")', result: 'High' },
      { code: 'kpt.whenAbove(3, 5, "High")', result: '' }
    ]
  },
  {
    name: 'whenBelow',
    category: 'Conditional Display',
    description: 'Shows content when value is below threshold',
    parameters: [
      { name: 'value', type: 'number', required: true, description: 'Value to check' },
      { name: 'threshold', type: 'number', required: true, description: 'Threshold value' },
      { name: 'content', type: 'string', required: true, description: 'Content to display' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.whenBelow(3, 5, "Low")', result: 'Low' },
      { code: 'kpt.whenBelow(10, 5, "Low")', result: '' }
    ]
  },
  {
    name: 'whenInRange',
    category: 'Conditional Display',
    description: 'Shows content when value is within range',
    parameters: [
      { name: 'value', type: 'number', required: true, description: 'Value to check' },
      { name: 'min', type: 'number', required: true, description: 'Minimum value' },
      { name: 'max', type: 'number', required: true, description: 'Maximum value' },
      { name: 'content', type: 'string', required: true, description: 'Content to display' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.whenInRange(5, 1, 10, "Normal")', result: 'Normal' },
      { code: 'kpt.whenInRange(15, 1, 10, "Normal")', result: '' }
    ]
  }
];