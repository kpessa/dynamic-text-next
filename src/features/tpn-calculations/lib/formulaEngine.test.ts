import { describe, it, expect, beforeEach } from 'vitest'
import { FormulaEngine } from './formulaEngine'

describe('FormulaEngine', () => {
  let engine: FormulaEngine

  beforeEach(() => {
    engine = new FormulaEngine()
  })

  describe('Basic Calculations', () => {
    it('should calculate simple formulas', async () => {
      const result = await engine.calculate('2 + 3 * 4')
      expect(result.value).toBe(14)
      expect(result.error).toBeUndefined()
    })

    it('should calculate formulas with variables', async () => {
      const context = { weight: 70, height: 180 }
      const result = await engine.calculate('weight * 2 + height / 100', context)
      expect(result.value).toBeCloseTo(141.8)
    })

    it('should use default values', async () => {
      const context = { weight: 70 }
      const defaults = { height: 170 }
      const result = await engine.calculate('weight + height', context, { defaults })
      expect(result.value).toBe(240)
    })

    it('should handle math functions', async () => {
      const context = { a: 10, b: 5, c: 7 }
      const result = await engine.calculate('min(a, b) + max(b, c)', context)
      expect(result.value).toBe(12) // min(10,5) + max(5,7) = 5 + 7
    })
  })

  describe('Unit Conversions', () => {
    it('should handle unit conversions in formulas', async () => {
      const context = { weight_kg: 70, kg: 'kg', lb: 'lb' }
      const result = await engine.calculate("convert(weight_kg, kg, lb)", context)
      expect(result.value).toBeCloseTo(154.32, 1)
    })

    it('should validate unit compatibility', async () => {
      const context = { kg: 'kg', cm: 'cm' }
      const result = await engine.calculate("convert(70, kg, cm)", context)
      expect(result.error).toContain('Incompatible')
    })
  })

  describe('Error Handling', () => {
    it('should handle undefined variables', async () => {
      const result = await engine.calculate('unknownVar * 2')
      expect(result.error).toBeDefined()
      expect(result.error).toContain('unknownVar')
    })

    it('should handle invalid syntax', async () => {
      const result = await engine.calculate('2 + + 3')
      expect(result.error).toBeDefined()
    })

    it('should handle division by zero', async () => {
      const result = await engine.calculate('10 / 0')
      expect(result.value).toBe(Infinity)
    })
  })

  describe('Batch Calculations', () => {
    it('should calculate multiple formulas', async () => {
      const formulas = new Map([
        ['calories', 'weight * 25'],
        ['protein', 'weight * 1.5'],
        ['fluid', 'weight * 30']
      ])
      const context = { weight: 70 }
      
      const results = await engine.calculateBatch(formulas, context)
      
      expect(results.get('calories')?.value).toBe(1750)
      expect(results.get('protein')?.value).toBe(105)
      expect(results.get('fluid')?.value).toBe(2100)
    })

    it('should handle dependencies between formulas', async () => {
      const formulas = new Map([
        ['base', '100'],
        ['double', 'base * 2'],
        ['triple', 'base * 3'],
        ['sum', 'double + triple']
      ])
      
      const results = await engine.calculateBatch(formulas)
      
      expect(results.get('base')?.value).toBe(100)
      expect(results.get('double')?.value).toBe(200)
      expect(results.get('triple')?.value).toBe(300)
      expect(results.get('sum')?.value).toBe(500)
    })

    it('should detect circular dependencies', async () => {
      const formulas = new Map([
        ['a', 'b + 1'],
        ['b', 'a + 1']
      ])
      
      const results = await engine.calculateBatch(formulas)
      expect(results.get('a')?.error).toContain('Circular')
    })
  })

  describe('Caching', () => {
    it('should cache calculation results', async () => {
      const context = { weight: 70 }
      
      // First calculation
      const result1 = await engine.calculate('weight * 25', context)
      expect(result1.cached).toBe(false)
      
      // Second calculation (should be cached)
      const result2 = await engine.calculate('weight * 25', context)
      expect(result2.cached).toBe(true)
      expect(result2.value).toBe(result1.value)
    })

    it('should invalidate cache on context change', async () => {
      const context1 = { weight: 70 }
      const context2 = { weight: 75 }
      
      const result1 = await engine.calculate('weight * 25', context1)
      expect(result1.value).toBe(1750)
      
      const result2 = await engine.calculate('weight * 25', context2)
      expect(result2.value).toBe(1875)
      expect(result2.cached).toBe(false)
    })

    it('should clear cache', () => {
      engine.clearCache()
      // Cache should be empty
      expect(engine.getCacheSize()).toBe(0)
    })
  })

  describe('Complex Medical Formulas', () => {
    it('should calculate BMI', async () => {
      const context = {
        weight: 70, // kg
        height: 180 // cm
      }
      
      const bmi = await engine.calculate('weight / pow(height / 100, 2)', context)
      expect(bmi.value).toBeCloseTo(21.6, 1)
    })

    it('should calculate Harris-Benedict equation', async () => {
      const context = {
        weight: 70,
        height: 180,
        age: 30,
        gender: 'M',
        male_factor: 88.362,
        weight_factor: 13.397,
        height_factor: 4.799,
        age_factor: 5.677
      }
      
      // Male: 88.362 + (13.397 × weight) + (4.799 × height) - (5.677 × age)
      const formula = 'male_factor + (weight_factor * weight) + (height_factor * height) - (age_factor * age)'
      const bmr = await engine.calculate(formula, context)
      expect(bmr.value).toBeCloseTo(1720, 0)
    })

    it('should calculate TPN requirements', async () => {
      const context = {
        weight: 70,
        stress_factor: 1.2,
        activity_factor: 1.3,
        protein_per_kg: 1.5,
        fluid_per_kg: 30
      }
      
      const formulas = new Map([
        ['basal_calories', 'weight * 25'],
        ['total_calories', 'basal_calories * stress_factor * activity_factor'],
        ['protein_grams', 'min(weight * protein_per_kg, 120)'],
        ['fluid_ml', 'weight * fluid_per_kg']
      ])
      
      const results = await engine.calculateBatch(formulas, context)
      
      expect(results.get('basal_calories')?.value).toBe(1750)
      expect(results.get('total_calories')?.value).toBe(2730)
      expect(results.get('protein_grams')?.value).toBe(105)
      expect(results.get('fluid_ml')?.value).toBe(2100)
    })
  })

  describe('Performance', () => {
    it('should calculate formulas quickly', async () => {
      const context = { a: 1, b: 2, c: 3, d: 4, e: 5 }
      const formula = 'a + b * c - min(d, e) + max(a, b)'
      
      const start = performance.now()
      for (let i = 0; i < 100; i++) {
        await engine.calculate(formula, context)
      }
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(100) // 100 calculations in under 100ms
    })

    it('should handle batch calculations efficiently', async () => {
      const formulas = new Map()
      for (let i = 0; i < 50; i++) {
        formulas.set(`var${i}`, `${i} * 2 + 10`)
      }
      
      const start = performance.now()
      await engine.calculateBatch(formulas)
      const duration = performance.now() - start
      
      expect(duration).toBeLessThan(200) // 50 formulas in under 200ms
    })
  })
})