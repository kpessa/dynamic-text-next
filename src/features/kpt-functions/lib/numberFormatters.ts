export interface NumberFormatters {
  roundTo: (num: number, decimals?: number) => number;
  formatNumber: (num: number, decimals?: number) => string;
  formatPercent: (num: number, decimals?: number) => string;
  formatCurrency: (num: number, currency?: string) => string;
}

export function createNumberFormatters(): NumberFormatters {
  return {
    roundTo: (num: number, decimals: number = 2): number => {
      if (!Number.isFinite(num)) return 0;
      const factor = Math.pow(10, decimals);
      return Math.round(num * factor) / factor;
    },

    formatNumber: (num: number, decimals: number = 2): string => {
      if (!Number.isFinite(num)) return '0';
      
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(num);
    },

    formatPercent: (num: number, decimals: number = 1): string => {
      if (!Number.isFinite(num)) return '0%';
      
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(num / 100);
    },

    formatCurrency: (num: number, currency: string = 'USD'): string => {
      if (!Number.isFinite(num)) return '$0.00';
      
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency
        }).format(num);
      } catch (error) {
        // Fallback for invalid currency codes
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(num);
      }
    }
  };
}

export const numberFormatterDocumentation = [
  {
    name: 'roundTo',
    category: 'Number Formatting',
    description: 'Rounds a number to specified decimal places',
    parameters: [
      { name: 'num', type: 'number', required: true, description: 'Number to round' },
      { name: 'decimals', type: 'number', required: false, description: 'Number of decimal places', defaultValue: 2 }
    ],
    returnType: 'number',
    examples: [
      { code: 'kpt.roundTo(3.14159, 2)', result: '3.14' },
      { code: 'kpt.roundTo(10.5678, 0)', result: '11' }
    ]
  },
  {
    name: 'formatNumber',
    category: 'Number Formatting',
    description: 'Formats a number with thousands separators and decimal places',
    parameters: [
      { name: 'num', type: 'number', required: true, description: 'Number to format' },
      { name: 'decimals', type: 'number', required: false, description: 'Number of decimal places', defaultValue: 2 }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.formatNumber(1234567.89)', result: '1,234,567.89' },
      { code: 'kpt.formatNumber(1000, 0)', result: '1,000' }
    ]
  },
  {
    name: 'formatPercent',
    category: 'Number Formatting',
    description: 'Formats a number as a percentage (multiplies by 100 and adds %)',
    parameters: [
      { name: 'num', type: 'number', required: true, description: 'Number to format (0-100 scale)' },
      { name: 'decimals', type: 'number', required: false, description: 'Number of decimal places', defaultValue: 1 }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.formatPercent(75.5)', result: '75.5%' },
      { code: 'kpt.formatPercent(33.333, 0)', result: '33%' }
    ]
  },
  {
    name: 'formatCurrency',
    category: 'Number Formatting',
    description: 'Formats a number as currency',
    parameters: [
      { name: 'num', type: 'number', required: true, description: 'Amount to format' },
      { name: 'currency', type: 'string', required: false, description: 'Currency code (ISO 4217)', defaultValue: 'USD' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.formatCurrency(1234.56)', result: '$1,234.56' },
      { code: 'kpt.formatCurrency(99.99, "EUR")', result: '€99.99' }
    ]
  }
];