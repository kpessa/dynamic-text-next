export enum UnitType {
  WEIGHT = 'weight',
  LENGTH = 'length',
  VOLUME = 'volume',
  TEMPERATURE = 'temperature',
  ENERGY = 'energy'
}

interface ConversionData {
  variable: string
  fromUnit: string
  toUnit: string
}

interface UnitDefinition {
  type: UnitType
  baseUnit: string
  toBase: number | ((value: number) => number)
  fromBase?: (value: number) => number
}

export class UnitConverter {
  private units: Map<string, UnitDefinition>

  constructor() {
    this.units = new Map()
    this.initializeUnits()
  }

  /**
   * Convert a value from one unit to another
   */
  convert(value: number, fromUnit: string, toUnit: string): number {
    // Validate input
    if (isNaN(value) || !isFinite(value)) {
      throw new Error('Invalid value')
    }

    // Handle same unit conversion
    if (fromUnit === toUnit) {
      return value
    }

    // Get unit definitions
    const fromDef = this.units.get(fromUnit)
    const toDef = this.units.get(toUnit)

    if (!fromDef) {
      throw new Error(`Unknown unit: ${fromUnit}`)
    }
    if (!toDef) {
      throw new Error(`Unknown unit: ${toUnit}`)
    }

    // Check compatibility
    if (fromDef.type !== toDef.type) {
      throw new Error(`Incompatible units: ${fromUnit} and ${toUnit}`)
    }

    // Convert through base unit
    let baseValue: number
    if (typeof fromDef.toBase === 'function') {
      baseValue = fromDef.toBase(value)
    } else {
      baseValue = value * fromDef.toBase
    }

    // Convert from base to target unit
    let result: number
    if (toDef.fromBase) {
      result = toDef.fromBase(baseValue)
    } else if (typeof toDef.toBase === 'function') {
      // For temperature, we need special handling
      throw new Error('Invalid conversion path')
    } else {
      result = baseValue / toDef.toBase
    }

    return result
  }

  /**
   * Get the unit type for a given unit
   */
  getUnitType(unit: string): UnitType | undefined {
    const def = this.units.get(unit)
    return def?.type
  }

  /**
   * Check if two units are compatible for conversion
   */
  areUnitsCompatible(unit1: string, unit2: string): boolean {
    const type1 = this.getUnitType(unit1)
    const type2 = this.getUnitType(unit2)
    return type1 !== undefined && type1 === type2
  }

  /**
   * Parse a convert function from a formula string
   */
  parseConvertFunction(formula: string): ConversionData | null {
    const match = formula.match(/convert\s*\(\s*([^,]+)\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/)
    if (!match) {
      return null
    }

    return {
      variable: match[1].trim(),
      fromUnit: match[2],
      toUnit: match[3]
    }
  }

  /**
   * Extract all conversion functions from a formula
   */
  extractConversions(formula: string): ConversionData[] {
    const conversions: ConversionData[] = []
    const pattern = /convert\s*\(\s*([^,]+)\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g
    
    let match
    while ((match = pattern.exec(formula)) !== null) {
      conversions.push({
        variable: match[1].trim(),
        fromUnit: match[2],
        toUnit: match[3]
      })
    }

    return conversions
  }

  /**
   * Apply conversions directly in a formula (for literal values)
   */
  applyConversions(formula: string): string {
    let result = formula
    const pattern = /convert\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g
    
    result = result.replace(pattern, (match, value, fromUnit, toUnit) => {
      try {
        const numValue = parseFloat(value)
        const converted = this.convert(numValue, fromUnit, toUnit)
        // Round to 2 decimal places for display
        return converted.toFixed(2)
      } catch (error) {
        return match // Keep original if conversion fails
      }
    })

    return result
  }

  /**
   * Initialize unit definitions
   */
  private initializeUnits(): void {
    // Weight units
    this.units.set('kg', { type: UnitType.WEIGHT, baseUnit: 'kg', toBase: 1 })
    this.units.set('g', { type: UnitType.WEIGHT, baseUnit: 'kg', toBase: 0.001 })
    this.units.set('mg', { type: UnitType.WEIGHT, baseUnit: 'kg', toBase: 0.000001 })
    this.units.set('mcg', { type: UnitType.WEIGHT, baseUnit: 'kg', toBase: 0.000000001 })
    this.units.set('lb', { type: UnitType.WEIGHT, baseUnit: 'kg', toBase: 0.453592 })
    this.units.set('oz', { type: UnitType.WEIGHT, baseUnit: 'kg', toBase: 0.0283495 })

    // Length units
    this.units.set('m', { type: UnitType.LENGTH, baseUnit: 'm', toBase: 1 })
    this.units.set('cm', { type: UnitType.LENGTH, baseUnit: 'm', toBase: 0.01 })
    this.units.set('mm', { type: UnitType.LENGTH, baseUnit: 'm', toBase: 0.001 })
    this.units.set('km', { type: UnitType.LENGTH, baseUnit: 'm', toBase: 1000 })
    this.units.set('in', { type: UnitType.LENGTH, baseUnit: 'm', toBase: 0.0254 })
    this.units.set('ft', { type: UnitType.LENGTH, baseUnit: 'm', toBase: 0.3048 })
    this.units.set('yd', { type: UnitType.LENGTH, baseUnit: 'm', toBase: 0.9144 })
    this.units.set('mi', { type: UnitType.LENGTH, baseUnit: 'm', toBase: 1609.34 })

    // Volume units
    this.units.set('L', { type: UnitType.VOLUME, baseUnit: 'L', toBase: 1 })
    this.units.set('ml', { type: UnitType.VOLUME, baseUnit: 'L', toBase: 0.001 })
    this.units.set('cl', { type: UnitType.VOLUME, baseUnit: 'L', toBase: 0.01 })
    this.units.set('dl', { type: UnitType.VOLUME, baseUnit: 'L', toBase: 0.1 })
    this.units.set('fl_oz', { type: UnitType.VOLUME, baseUnit: 'L', toBase: 0.0295735 })
    this.units.set('cup', { type: UnitType.VOLUME, baseUnit: 'L', toBase: 0.236588 })
    this.units.set('pt', { type: UnitType.VOLUME, baseUnit: 'L', toBase: 0.473176 })
    this.units.set('qt', { type: UnitType.VOLUME, baseUnit: 'L', toBase: 0.946353 })
    this.units.set('gal', { type: UnitType.VOLUME, baseUnit: 'L', toBase: 3.78541 })
    this.units.set('tsp', { type: UnitType.VOLUME, baseUnit: 'L', toBase: 0.00492892 })
    this.units.set('tbsp', { type: UnitType.VOLUME, baseUnit: 'L', toBase: 0.0147868 })

    // Temperature units (special handling)
    this.units.set('C', {
      type: UnitType.TEMPERATURE,
      baseUnit: 'C',
      toBase: (c: number) => c, // Celsius is our base
      fromBase: (c: number) => c
    })
    this.units.set('F', {
      type: UnitType.TEMPERATURE,
      baseUnit: 'C',
      toBase: (f: number) => (f - 32) * 5 / 9, // F to C
      fromBase: (c: number) => c * 9 / 5 + 32   // C to F
    })
    this.units.set('K', {
      type: UnitType.TEMPERATURE,
      baseUnit: 'C',
      toBase: (k: number) => k - 273.15,        // K to C
      fromBase: (c: number) => c + 273.15       // C to K
    })

    // Energy units
    this.units.set('cal', { type: UnitType.ENERGY, baseUnit: 'cal', toBase: 1 })
    this.units.set('kcal', { type: UnitType.ENERGY, baseUnit: 'cal', toBase: 1000 })
    this.units.set('J', { type: UnitType.ENERGY, baseUnit: 'cal', toBase: 0.239006 })
    this.units.set('kJ', { type: UnitType.ENERGY, baseUnit: 'cal', toBase: 239.006 })
  }
}