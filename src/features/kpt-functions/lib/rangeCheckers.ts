import { RangeConfig, RangeStatus } from '../types';

export interface RangeCheckers {
  checkRange: (value: number, normal?: [number, number], critical?: [number, number]) => string;
  isNormal: (value: number, min: number, max: number) => boolean;
  isCritical: (value: number, criticalMin: number, criticalMax: number) => boolean;
  getRangeStatus: (value: number, ranges: RangeConfig) => RangeStatus;
}

export function createRangeCheckers(): RangeCheckers {
  return {
    checkRange: (
      value: number, 
      normal?: [number, number], 
      critical?: [number, number]
    ): string => {
      if (Number.isNaN(value)) return 'invalid';
      
      // Check critical range first
      if (critical) {
        if (value < critical[0] || value > critical[1]) {
          return 'critical';
        }
      }
      
      // Then check normal range
      if (normal) {
        if (value < normal[0] || value > normal[1]) {
          return 'abnormal';
        }
      }
      
      return 'normal';
    },

    isNormal: (value: number, min: number, max: number): boolean => {
      if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
        return false;
      }
      return value >= min && value <= max;
    },

    isCritical: (value: number, criticalMin: number, criticalMax: number): boolean => {
      if (!Number.isFinite(value) || !Number.isFinite(criticalMin) || !Number.isFinite(criticalMax)) {
        return false;
      }
      return value < criticalMin || value > criticalMax;
    },

    getRangeStatus: (value: number, ranges: RangeConfig): RangeStatus => {
      if (Number.isNaN(value)) {
        return 'normal'; // Default to normal for NaN values
      }
      
      const { criticalLow, low, high, criticalHigh } = ranges;
      
      // Check critical ranges first
      if (criticalLow !== undefined && value < criticalLow) {
        return 'critical-low';
      }
      if (criticalHigh !== undefined && value > criticalHigh) {
        return 'critical-high';
      }
      
      // Check normal ranges
      if (low !== undefined && value < low) {
        return 'low';
      }
      if (high !== undefined && value > high) {
        return 'high';
      }
      
      return 'normal';
    }
  };
}

export const rangeCheckerDocumentation = [
  {
    name: 'checkRange',
    category: 'Range Checking',
    description: 'Checks if a value is within normal or critical ranges',
    parameters: [
      { name: 'value', type: 'number', required: true, description: 'Value to check' },
      { name: 'normal', type: '[number, number]', required: false, description: 'Normal range [min, max]' },
      { name: 'critical', type: '[number, number]', required: false, description: 'Critical range [min, max]' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.checkRange(5, [2, 8])', result: 'normal' },
      { code: 'kpt.checkRange(10, [2, 8])', result: 'abnormal' },
      { code: 'kpt.checkRange(15, [2, 8], [0, 12])', result: 'critical' }
    ]
  },
  {
    name: 'isNormal',
    category: 'Range Checking',
    description: 'Checks if a value is within a normal range',
    parameters: [
      { name: 'value', type: 'number', required: true, description: 'Value to check' },
      { name: 'min', type: 'number', required: true, description: 'Minimum normal value' },
      { name: 'max', type: 'number', required: true, description: 'Maximum normal value' }
    ],
    returnType: 'boolean',
    examples: [
      { code: 'kpt.isNormal(5, 2, 8)', result: 'true' },
      { code: 'kpt.isNormal(10, 2, 8)', result: 'false' }
    ]
  },
  {
    name: 'isCritical',
    category: 'Range Checking',
    description: 'Checks if a value is outside critical thresholds',
    parameters: [
      { name: 'value', type: 'number', required: true, description: 'Value to check' },
      { name: 'criticalMin', type: 'number', required: true, description: 'Critical minimum' },
      { name: 'criticalMax', type: 'number', required: true, description: 'Critical maximum' }
    ],
    returnType: 'boolean',
    examples: [
      { code: 'kpt.isCritical(1, 2, 10)', result: 'true' },
      { code: 'kpt.isCritical(5, 2, 10)', result: 'false' },
      { code: 'kpt.isCritical(15, 2, 10)', result: 'true' }
    ]
  },
  {
    name: 'getRangeStatus',
    category: 'Range Checking',
    description: 'Gets detailed range status with multiple thresholds',
    parameters: [
      { name: 'value', type: 'number', required: true, description: 'Value to check' },
      { name: 'ranges', type: 'RangeConfig', required: true, description: 'Configuration with multiple thresholds' }
    ],
    returnType: 'RangeStatus',
    examples: [
      { 
        code: 'kpt.getRangeStatus(3, { criticalLow: 2, low: 4, high: 8, criticalHigh: 10 })', 
        result: 'low' 
      },
      { 
        code: 'kpt.getRangeStatus(1, { criticalLow: 2, low: 4, high: 8, criticalHigh: 10 })', 
        result: 'critical-low' 
      }
    ]
  }
];