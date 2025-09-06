export interface KPTNamespace {
  // Text formatting functions
  redText: (text: string | number) => string;
  greenText: (text: string | number) => string;
  blueText: (text: string | number) => string;
  boldText: (text: string | number) => string;
  italicText: (text: string | number) => string;
  underlineText: (text: string | number) => string;
  highlightText: (text: string | number, color?: string) => string;
  
  // Number formatting functions
  roundTo: (num: number, decimals?: number) => number;
  formatNumber: (num: number, decimals?: number) => string;
  formatPercent: (num: number, decimals?: number) => string;
  formatCurrency: (num: number, currency?: string) => string;
  
  // TPN-specific formatting
  formatWeight: (weight: number, unit?: string) => string;
  formatVolume: (volume: number, unit?: string) => string;
  formatDose: (dose: number, unit?: string) => string;
  formatConcentration: (concentration: number) => string;
  formatInfusionRate: (rate: number, unit?: string) => string;
  formatOsmolarity: (osmolarity: number) => string;
  
  // Conditional display functions
  showIf: (condition: boolean, content: string) => string;
  hideIf: (condition: boolean, content: string) => string;
  whenAbove: (value: number, threshold: number, content: string) => string;
  whenBelow: (value: number, threshold: number, content: string) => string;
  whenInRange: (value: number, min: number, max: number, content: string) => string;
  
  // Range checking functions
  checkRange: (value: number, normal?: [number, number], critical?: [number, number]) => string;
  isNormal: (value: number, min: number, max: number) => boolean;
  isCritical: (value: number, criticalMin: number, criticalMax: number) => boolean;
  getRangeStatus: (value: number, ranges: RangeConfig) => RangeStatus;
  
  // HTML building functions
  createTable: (data: Array<Array<string | number>>, headers?: string[]) => string;
  createList: (items: Array<string | number>, ordered?: boolean) => string;
  createAlert: (message: string, type?: AlertType) => string;
  createCard: (title: string, content: string, footer?: string) => string;
  createProgress: (value: number, max: number, label?: string) => string;
  
  // Utility functions
  capitalize: (text: string) => string;
  pluralize: (count: number, singular: string, plural?: string) => string;
  abbreviate: (text: string, maxLength: number) => string;
}

export type AlertType = 'info' | 'warning' | 'error' | 'success';

export type RangeStatus = 'critical-low' | 'low' | 'normal' | 'high' | 'critical-high';

export interface RangeConfig {
  criticalLow?: number;
  low?: number;
  high?: number;
  criticalHigh?: number;
}

export interface CustomFunction {
  id: string;
  name: string;
  description: string;
  parameters: FunctionParameter[];
  body: string;
  returnType: 'string' | 'number' | 'boolean';
  category: string;
  isPublic: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface FunctionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'any';
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface FunctionRegistry {
  [key: string]: Function;
}

export interface KPTFunctionCategory {
  name: string;
  description: string;
  functions: string[];
  icon?: string;
}

export interface FunctionDocumentation {
  name: string;
  category: string;
  description: string;
  parameters: FunctionParameter[];
  returnType: string;
  examples: FunctionExample[];
}

export interface FunctionExample {
  code: string;
  result: string;
  description?: string;
}