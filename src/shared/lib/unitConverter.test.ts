import { describe, it, expect, beforeEach } from 'vitest'
import { UnitConverter, UnitType } from './unitConverter'

describe('UnitConverter', () => {
  let converter: UnitConverter

  beforeEach(() => {
    converter = new UnitConverter()
  })

  describe('Weight Conversions', () => {
    it('should convert kilograms to pounds', () => {
      expect(converter.convert(70, 'kg', 'lb')).toBeCloseTo(154.324, 2)
      expect(converter.convert(1, 'kg', 'lb')).toBeCloseTo(2.20462, 2)
    })

    it('should convert pounds to kilograms', () => {
      expect(converter.convert(154.324, 'lb', 'kg')).toBeCloseTo(70, 2)
      expect(converter.convert(2.20462, 'lb', 'kg')).toBeCloseTo(1, 2)
    })

    it('should convert grams to kilograms', () => {
      expect(converter.convert(1000, 'g', 'kg')).toBe(1)
      expect(converter.convert(500, 'g', 'kg')).toBe(0.5)
    })

    it('should convert kilograms to grams', () => {
      expect(converter.convert(1, 'kg', 'g')).toBe(1000)
      expect(converter.convert(0.5, 'kg', 'g')).toBe(500)
    })

    it('should convert milligrams to grams', () => {
      expect(converter.convert(1000, 'mg', 'g')).toBe(1)
      expect(converter.convert(500, 'mg', 'g')).toBe(0.5)
    })

    it('should convert ounces to grams', () => {
      expect(converter.convert(1, 'oz', 'g')).toBeCloseTo(28.3495, 2)
    })

    it('should handle same unit conversion', () => {
      expect(converter.convert(70, 'kg', 'kg')).toBe(70)
      expect(converter.convert(150, 'lb', 'lb')).toBe(150)
    })
  })

  describe('Length Conversions', () => {
    it('should convert centimeters to inches', () => {
      expect(converter.convert(180, 'cm', 'in')).toBeCloseTo(70.8661, 2)
      expect(converter.convert(2.54, 'cm', 'in')).toBeCloseTo(1, 2)
    })

    it('should convert inches to centimeters', () => {
      expect(converter.convert(70.8661, 'in', 'cm')).toBeCloseTo(180, 2)
      expect(converter.convert(1, 'in', 'cm')).toBeCloseTo(2.54, 2)
    })

    it('should convert meters to feet', () => {
      expect(converter.convert(1.8, 'm', 'ft')).toBeCloseTo(5.90551, 2)
      expect(converter.convert(1, 'm', 'ft')).toBeCloseTo(3.28084, 2)
    })

    it('should convert feet to meters', () => {
      expect(converter.convert(5.90551, 'ft', 'm')).toBeCloseTo(1.8, 2)
      expect(converter.convert(3.28084, 'ft', 'm')).toBeCloseTo(1, 2)
    })

    it('should convert centimeters to meters', () => {
      expect(converter.convert(180, 'cm', 'm')).toBe(1.8)
      expect(converter.convert(100, 'cm', 'm')).toBe(1)
    })

    it('should convert millimeters to centimeters', () => {
      expect(converter.convert(10, 'mm', 'cm')).toBe(1)
      expect(converter.convert(25, 'mm', 'cm')).toBe(2.5)
    })
  })

  describe('Volume Conversions', () => {
    it('should convert milliliters to liters', () => {
      expect(converter.convert(1000, 'ml', 'L')).toBe(1)
      expect(converter.convert(500, 'ml', 'L')).toBe(0.5)
    })

    it('should convert liters to milliliters', () => {
      expect(converter.convert(1, 'L', 'ml')).toBe(1000)
      expect(converter.convert(0.5, 'L', 'ml')).toBe(500)
    })

    it('should convert fluid ounces to milliliters', () => {
      expect(converter.convert(1, 'fl_oz', 'ml')).toBeCloseTo(29.5735, 2)
    })

    it('should convert cups to milliliters', () => {
      expect(converter.convert(1, 'cup', 'ml')).toBeCloseTo(236.588, 2)
    })

    it('should convert teaspoons to milliliters', () => {
      expect(converter.convert(1, 'tsp', 'ml')).toBeCloseTo(4.92892, 2)
    })

    it('should convert tablespoons to milliliters', () => {
      expect(converter.convert(1, 'tbsp', 'ml')).toBeCloseTo(14.7868, 2)
    })
  })

  describe('Temperature Conversions', () => {
    it('should convert Celsius to Fahrenheit', () => {
      expect(converter.convert(0, 'C', 'F')).toBe(32)
      expect(converter.convert(100, 'C', 'F')).toBe(212)
      expect(converter.convert(37, 'C', 'F')).toBeCloseTo(98.6, 1)
    })

    it('should convert Fahrenheit to Celsius', () => {
      expect(converter.convert(32, 'F', 'C')).toBe(0)
      expect(converter.convert(212, 'F', 'C')).toBe(100)
      expect(converter.convert(98.6, 'F', 'C')).toBeCloseTo(37, 1)
    })

    it('should convert Celsius to Kelvin', () => {
      expect(converter.convert(0, 'C', 'K')).toBe(273.15)
      expect(converter.convert(100, 'C', 'K')).toBe(373.15)
    })

    it('should convert Kelvin to Celsius', () => {
      expect(converter.convert(273.15, 'K', 'C')).toBe(0)
      expect(converter.convert(373.15, 'K', 'C')).toBe(100)
    })
  })

  describe('Energy Conversions', () => {
    it('should convert calories to kilocalories', () => {
      expect(converter.convert(1000, 'cal', 'kcal')).toBe(1)
      expect(converter.convert(500, 'cal', 'kcal')).toBe(0.5)
    })

    it('should convert kilocalories to joules', () => {
      expect(converter.convert(1, 'kcal', 'J')).toBeCloseTo(4184, 0)
    })

    it('should convert kilojoules to kilocalories', () => {
      expect(converter.convert(4.184, 'kJ', 'kcal')).toBeCloseTo(1, 2)
    })
  })

  describe('Unit Detection', () => {
    it('should detect unit type from unit string', () => {
      expect(converter.getUnitType('kg')).toBe(UnitType.WEIGHT)
      expect(converter.getUnitType('lb')).toBe(UnitType.WEIGHT)
      expect(converter.getUnitType('cm')).toBe(UnitType.LENGTH)
      expect(converter.getUnitType('in')).toBe(UnitType.LENGTH)
      expect(converter.getUnitType('ml')).toBe(UnitType.VOLUME)
      expect(converter.getUnitType('L')).toBe(UnitType.VOLUME)
      expect(converter.getUnitType('C')).toBe(UnitType.TEMPERATURE)
      expect(converter.getUnitType('F')).toBe(UnitType.TEMPERATURE)
    })

    it('should return undefined for unknown units', () => {
      expect(converter.getUnitType('xyz')).toBeUndefined()
      expect(converter.getUnitType('foo')).toBeUndefined()
    })

    it('should validate unit compatibility', () => {
      expect(converter.areUnitsCompatible('kg', 'lb')).toBe(true)
      expect(converter.areUnitsCompatible('cm', 'in')).toBe(true)
      expect(converter.areUnitsCompatible('ml', 'L')).toBe(true)
      
      expect(converter.areUnitsCompatible('kg', 'cm')).toBe(false)
      expect(converter.areUnitsCompatible('ml', 'kg')).toBe(false)
      expect(converter.areUnitsCompatible('C', 'kg')).toBe(false)
    })
  })

  describe('Formula Integration', () => {
    it('should parse convert function from formula', () => {
      const formula = "convert(weight, 'kg', 'lb')"
      const parsed = converter.parseConvertFunction(formula)
      
      expect(parsed).toEqual({
        variable: 'weight',
        fromUnit: 'kg',
        toUnit: 'lb'
      })
    })

    it('should parse multiple convert functions', () => {
      const formula = "convert(weight, 'kg', 'lb') + convert(height, 'cm', 'in')"
      const conversions = converter.extractConversions(formula)
      
      expect(conversions).toHaveLength(2)
      expect(conversions[0]).toEqual({
        variable: 'weight',
        fromUnit: 'kg',
        toUnit: 'lb'
      })
      expect(conversions[1]).toEqual({
        variable: 'height',
        fromUnit: 'cm',
        toUnit: 'in'
      })
    })

    it('should apply conversions to formula', () => {
      const formula = "convert(70, 'kg', 'lb') + 10"
      const result = converter.applyConversions(formula)
      
      // Should replace convert(70, 'kg', 'lb') with 154.324
      expect(result).toContain('154.32')
    })
  })

  describe('Precision and Rounding', () => {
    it('should maintain precision for medical calculations', () => {
      // Medical dosing often requires high precision
      const mgPerKg = 2.5
      const weightKg = 70.5
      const doseMg = mgPerKg * weightKg
      
      const doseMcg = converter.convert(doseMg, 'mg', 'mcg')
      expect(doseMcg).toBe(doseMg * 1000)
      
      // Convert back should maintain precision
      const doseMgBack = converter.convert(doseMcg, 'mcg', 'mg')
      expect(doseMgBack).toBeCloseTo(doseMg, 6)
    })

    it('should handle very small values', () => {
      expect(converter.convert(0.001, 'g', 'mg')).toBe(1)
      expect(converter.convert(0.000001, 'L', 'ml')).toBeCloseTo(0.001, 6)
    })

    it('should handle very large values', () => {
      expect(converter.convert(1000000, 'mg', 'kg')).toBe(1)
      expect(converter.convert(1000000, 'ml', 'L')).toBe(1000)
    })
  })

  describe('Error Handling', () => {
    it('should throw error for incompatible units', () => {
      expect(() => converter.convert(70, 'kg', 'cm')).toThrow('Incompatible units')
      expect(() => converter.convert(100, 'ml', 'kg')).toThrow('Incompatible units')
    })

    it('should throw error for unknown units', () => {
      expect(() => converter.convert(100, 'xyz', 'kg')).toThrow('Unknown unit')
      expect(() => converter.convert(100, 'kg', 'xyz')).toThrow('Unknown unit')
    })

    it('should handle invalid input values', () => {
      expect(() => converter.convert(NaN, 'kg', 'lb')).toThrow('Invalid value')
      expect(() => converter.convert(Infinity, 'kg', 'lb')).toThrow('Invalid value')
    })
  })

  describe('Performance', () => {
    it('should convert quickly', () => {
      const start = performance.now()
      for (let i = 0; i < 10000; i++) {
        converter.convert(70, 'kg', 'lb')
      }
      const duration = performance.now() - start
      expect(duration).toBeLessThan(100) // 10000 conversions in under 100ms
    })

    it('should parse formulas efficiently', () => {
      const formula = "convert(weight, 'kg', 'lb') + convert(height, 'cm', 'in') * 2"
      
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        converter.extractConversions(formula)
      }
      const duration = performance.now() - start
      expect(duration).toBeLessThan(100) // 1000 parses in under 100ms
    })
  })
})