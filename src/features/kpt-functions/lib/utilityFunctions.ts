export interface UtilityFunctions {
  capitalize: (text: string) => string;
  pluralize: (count: number, singular: string, plural?: string) => string;
  abbreviate: (text: string, maxLength: number) => string;
}

export function createUtilityFunctions(): UtilityFunctions {
  return {
    capitalize: (text: string): string => {
      if (!text || typeof text !== 'string') return '';
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },

    pluralize: (count: number, singular: string, plural?: string): string => {
      if (!Number.isFinite(count)) count = 0;
      
      // Handle singular case
      if (count === 1) {
        return `${count} ${singular}`;
      }
      
      // Use provided plural or generate it
      const pluralForm = plural || `${singular}s`;
      return `${count} ${pluralForm}`;
    },

    abbreviate: (text: string, maxLength: number): string => {
      if (!text || typeof text !== 'string') return '';
      if (!Number.isFinite(maxLength) || maxLength < 1) return text;
      
      // If text is already short enough, return as is
      if (text.length <= maxLength) {
        return text;
      }
      
      // If maxLength is very small, just truncate
      if (maxLength <= 3) {
        return text.substring(0, maxLength);
      }
      
      // Otherwise, truncate and add ellipsis
      return text.substring(0, maxLength - 3) + '...';
    }
  };
}

export const utilityFunctionDocumentation = [
  {
    name: 'capitalize',
    category: 'Utilities',
    description: 'Capitalizes the first letter of text',
    parameters: [
      { name: 'text', type: 'string', required: true, description: 'Text to capitalize' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.capitalize("hello")', result: 'Hello' },
      { code: 'kpt.capitalize("WORLD")', result: 'World' }
    ]
  },
  {
    name: 'pluralize',
    category: 'Utilities',
    description: 'Returns singular or plural form based on count',
    parameters: [
      { name: 'count', type: 'number', required: true, description: 'Count value' },
      { name: 'singular', type: 'string', required: true, description: 'Singular form' },
      { name: 'plural', type: 'string', required: false, description: 'Plural form (auto-generated if not provided)' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.pluralize(1, "item")', result: '1 item' },
      { code: 'kpt.pluralize(5, "item")', result: '5 items' },
      { code: 'kpt.pluralize(3, "child", "children")', result: '3 children' }
    ]
  },
  {
    name: 'abbreviate',
    category: 'Utilities',
    description: 'Abbreviates text to a maximum length',
    parameters: [
      { name: 'text', type: 'string', required: true, description: 'Text to abbreviate' },
      { name: 'maxLength', type: 'number', required: true, description: 'Maximum length' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.abbreviate("Long text here", 10)', result: 'Long te...' },
      { code: 'kpt.abbreviate("Short", 10)', result: 'Short' }
    ]
  }
];