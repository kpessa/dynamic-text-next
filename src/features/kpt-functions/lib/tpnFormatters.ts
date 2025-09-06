export interface TPNFormatters {
  formatWeight: (weight: number, unit?: string) => string;
  formatVolume: (volume: number, unit?: string) => string;
  formatDose: (dose: number, unit?: string) => string;
  formatConcentration: (concentration: number) => string;
  formatInfusionRate: (rate: number, unit?: string) => string;
  formatOsmolarity: (osmolarity: number) => string;
}

export function createTPNFormatters(): TPNFormatters {
  const formatWithPrecision = (value: number, precision: number = 2): string => {
    if (!Number.isFinite(value)) return '0';
    if (precision === 0) {
      return Math.round(value).toString();
    }
    const formatted = value.toFixed(precision);
    // Only remove trailing zeros after decimal point
    const parts = formatted.split('.');
    if (parts.length === 2) {
      parts[1] = parts[1].replace(/0+$/, '');
      if (parts[1] === '') {
        return parts[0];
      }
      return parts.join('.');
    }
    return formatted;
  };

  return {
    formatWeight: (weight: number, unit: string = 'kg'): string => {
      if (!Number.isFinite(weight)) return '0 kg';
      
      // Convert to grams if less than 1 kg
      if (unit === 'kg' && weight < 1) {
        return `${formatWithPrecision(weight * 1000, 0)} g`;
      }
      
      // Convert to kg if more than 1000 g
      if (unit === 'g' && weight >= 1000) {
        return `${formatWithPrecision(weight / 1000, 2)} kg`;
      }
      
      return `${formatWithPrecision(weight, 2)} ${unit}`;
    },

    formatVolume: (volume: number, unit: string = 'mL'): string => {
      if (!Number.isFinite(volume)) return '0 mL';
      
      // Convert to L if >= 1000 mL
      if (unit === 'mL' && volume >= 1000) {
        return `${formatWithPrecision(volume / 1000, 2)} L`;
      }
      
      // Convert to mL if < 1 L
      if (unit === 'L' && volume < 1) {
        return `${formatWithPrecision(volume * 1000, 0)} mL`;
      }
      
      return `${formatWithPrecision(volume, unit === 'L' ? 2 : 0)} ${unit}`;
    },

    formatDose: (dose: number, unit: string = 'mg'): string => {
      if (!Number.isFinite(dose)) return '0 mg';
      
      // Convert between units for better readability
      if (dose < 1 && unit === 'mg') {
        return `${formatWithPrecision(dose * 1000, 0)} mcg`;
      }
      
      if (dose >= 1000 && unit === 'mg') {
        return `${formatWithPrecision(dose / 1000, 2)} g`;
      }
      
      if (dose < 1 && unit === 'g') {
        return `${formatWithPrecision(dose * 1000, 2)} mg`;
      }
      
      if (dose >= 1000 && unit === 'mcg') {
        return `${formatWithPrecision(dose / 1000, 2)} mg`;
      }
      
      return `${formatWithPrecision(dose, 2)} ${unit}`;
    },

    formatConcentration: (concentration: number): string => {
      if (!Number.isFinite(concentration)) return '0 mg/mL';
      
      // Choose appropriate unit based on concentration
      if (concentration < 1) {
        return `${formatWithPrecision(concentration * 1000, 2)} mcg/mL`;
      }
      
      if (concentration >= 1000) {
        return `${formatWithPrecision(concentration / 1000, 2)} g/mL`;
      }
      
      return `${formatWithPrecision(concentration, 2)} mg/mL`;
    },

    formatInfusionRate: (rate: number, unit: string = 'mL/hr'): string => {
      if (!Number.isFinite(rate)) return '0 mL/hr';
      
      // Round to appropriate precision based on rate
      const precision = rate < 10 ? 1 : 0;
      
      return `${formatWithPrecision(rate, precision)} ${unit}`;
    },

    formatOsmolarity: (osmolarity: number): string => {
      if (!Number.isFinite(osmolarity)) return '0 mOsm/L';
      
      return `${formatWithPrecision(osmolarity, 0)} mOsm/L`;
    }
  };
}

export const tpnFormatterDocumentation = [
  {
    name: 'formatWeight',
    category: 'TPN Formatting',
    description: 'Formats weight with automatic unit conversion',
    parameters: [
      { name: 'weight', type: 'number', required: true, description: 'Weight value' },
      { name: 'unit', type: 'string', required: false, description: 'Unit (kg or g)', defaultValue: 'kg' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.formatWeight(0.5)', result: '500 g' },
      { code: 'kpt.formatWeight(75)', result: '75 kg' },
      { code: 'kpt.formatWeight(1500, "g")', result: '1.5 kg' }
    ]
  },
  {
    name: 'formatVolume',
    category: 'TPN Formatting',
    description: 'Formats volume with automatic mL/L conversion',
    parameters: [
      { name: 'volume', type: 'number', required: true, description: 'Volume value' },
      { name: 'unit', type: 'string', required: false, description: 'Unit (mL or L)', defaultValue: 'mL' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.formatVolume(500)', result: '500 mL' },
      { code: 'kpt.formatVolume(1500)', result: '1.5 L' },
      { code: 'kpt.formatVolume(0.5, "L")', result: '500 mL' }
    ]
  },
  {
    name: 'formatDose',
    category: 'TPN Formatting',
    description: 'Formats medication dose with automatic unit conversion',
    parameters: [
      { name: 'dose', type: 'number', required: true, description: 'Dose value' },
      { name: 'unit', type: 'string', required: false, description: 'Unit (mcg, mg, or g)', defaultValue: 'mg' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.formatDose(0.5)', result: '500 mcg' },
      { code: 'kpt.formatDose(250)', result: '250 mg' },
      { code: 'kpt.formatDose(5000)', result: '5 g' }
    ]
  },
  {
    name: 'formatConcentration',
    category: 'TPN Formatting',
    description: 'Formats concentration values with appropriate units',
    parameters: [
      { name: 'concentration', type: 'number', required: true, description: 'Concentration in mg/mL' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.formatConcentration(0.5)', result: '500 mcg/mL' },
      { code: 'kpt.formatConcentration(10)', result: '10 mg/mL' },
      { code: 'kpt.formatConcentration(5000)', result: '5 g/mL' }
    ]
  },
  {
    name: 'formatInfusionRate',
    category: 'TPN Formatting',
    description: 'Formats infusion rate values',
    parameters: [
      { name: 'rate', type: 'number', required: true, description: 'Infusion rate' },
      { name: 'unit', type: 'string', required: false, description: 'Unit for rate', defaultValue: 'mL/hr' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.formatInfusionRate(125)', result: '125 mL/hr' },
      { code: 'kpt.formatInfusionRate(8.5)', result: '8.5 mL/hr' },
      { code: 'kpt.formatInfusionRate(0.5, "mg/hr")', result: '0.5 mg/hr' }
    ]
  },
  {
    name: 'formatOsmolarity',
    category: 'TPN Formatting',
    description: 'Formats osmolarity values',
    parameters: [
      { name: 'osmolarity', type: 'number', required: true, description: 'Osmolarity value' }
    ],
    returnType: 'string',
    examples: [
      { code: 'kpt.formatOsmolarity(300)', result: '300 mOsm/L' },
      { code: 'kpt.formatOsmolarity(1250.5)', result: '1251 mOsm/L' }
    ]
  }
];