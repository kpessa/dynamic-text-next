import { describe, it, expect, beforeEach } from 'vitest'
import { VariableResolver } from './variableResolver'

describe('VariableResolver', () => {
  let resolver: VariableResolver

  beforeEach(() => {
    resolver = new VariableResolver()
  })

  describe('Simple Variable Resolution', () => {
    it('should resolve top-level variables', () => {
      const context = { weight: 70, height: 180, age: 30 }
      expect(resolver.resolve('weight', context)).toBe(70)
      expect(resolver.resolve('height', context)).toBe(180)
      expect(resolver.resolve('age', context)).toBe(30)
    })

    it('should return undefined for missing variables', () => {
      const context = { weight: 70 }
      expect(resolver.resolve('height', context)).toBeUndefined()
    })

    it('should use default values when provided', () => {
      const context = { weight: 70 }
      const defaults = { height: 170, age: 25 }
      expect(resolver.resolve('height', context, defaults)).toBe(170)
      expect(resolver.resolve('age', context, defaults)).toBe(25)
      expect(resolver.resolve('weight', context, defaults)).toBe(70) // Context overrides defaults
    })

    it('should handle null and undefined values', () => {
      const context = { weight: null, height: undefined, age: 0 }
      expect(resolver.resolve('weight', context)).toBeNull()
      expect(resolver.resolve('height', context)).toBeUndefined()
      expect(resolver.resolve('age', context)).toBe(0)
    })
  })

  describe('Nested Property Access', () => {
    it('should resolve nested object properties', () => {
      const context = {
        patient: {
          weight: 70,
          height: 180,
          demographics: {
            age: 30,
            gender: 'M'
          }
        }
      }
      
      expect(resolver.resolve('patient.weight', context)).toBe(70)
      expect(resolver.resolve('patient.demographics.age', context)).toBe(30)
      expect(resolver.resolve('patient.demographics.gender', context)).toBe('M')
    })

    it('should handle missing nested properties', () => {
      const context = {
        patient: {
          weight: 70
        }
      }
      
      expect(resolver.resolve('patient.height', context)).toBeUndefined()
      expect(resolver.resolve('patient.demographics.age', context)).toBeUndefined()
      expect(resolver.resolve('nonexistent.property', context)).toBeUndefined()
    })

    it('should use defaults for nested properties', () => {
      const context = {
        patient: { weight: 70 }
      }
      const defaults = {
        patient: { height: 170, age: 25 }
      }
      
      expect(resolver.resolve('patient.height', context, defaults)).toBe(170)
      expect(resolver.resolve('patient.age', context, defaults)).toBe(25)
    })
  })

  describe('Array Indexing', () => {
    it('should support array indexing', () => {
      const context = {
        values: [10, 20, 30, 40],
        patients: [
          { name: 'John', weight: 70 },
          { name: 'Jane', weight: 60 }
        ]
      }
      
      expect(resolver.resolve('values[0]', context)).toBe(10)
      expect(resolver.resolve('values[2]', context)).toBe(30)
      expect(resolver.resolve('patients[0].name', context)).toBe('John')
      expect(resolver.resolve('patients[1].weight', context)).toBe(60)
    })

    it('should handle out of bounds array access', () => {
      const context = {
        values: [10, 20, 30]
      }
      
      expect(resolver.resolve('values[5]', context)).toBeUndefined()
      expect(resolver.resolve('values[-1]', context)).toBeUndefined()
    })

    it('should support nested array access', () => {
      const context = {
        data: {
          measurements: [
            { values: [1, 2, 3] },
            { values: [4, 5, 6] }
          ]
        }
      }
      
      expect(resolver.resolve('data.measurements[0].values[1]', context)).toBe(2)
      expect(resolver.resolve('data.measurements[1].values[2]', context)).toBe(6)
    })
  })

  describe('Variable Extraction', () => {
    it('should extract all variables from a formula', () => {
      const variables = resolver.extractVariables('weight * height + age')
      expect(variables).toContain('weight')
      expect(variables).toContain('height')
      expect(variables).toContain('age')
      expect(variables).toHaveLength(3)
    })

    it('should extract nested variables', () => {
      const variables = resolver.extractVariables('patient.weight * factor.stress')
      expect(variables).toContain('patient.weight')
      expect(variables).toContain('factor.stress')
      expect(variables).toHaveLength(2)
    })

    it('should extract array indexed variables', () => {
      const variables = resolver.extractVariables('values[0] + patients[1].weight')
      expect(variables).toContain('values[0]')
      expect(variables).toContain('patients[1].weight')
      expect(variables).toHaveLength(2)
    })

    it('should not duplicate variables', () => {
      const variables = resolver.extractVariables('weight + weight * weight')
      expect(variables).toContain('weight')
      expect(variables).toHaveLength(1)
    })

    it('should ignore function names', () => {
      const variables = resolver.extractVariables('min(weight, maxWeight) + round(height)')
      expect(variables).toContain('weight')
      expect(variables).toContain('maxWeight')
      expect(variables).toContain('height')
      expect(variables).not.toContain('min')
      expect(variables).not.toContain('round')
    })
  })

  describe('Variable Validation', () => {
    it('should validate all variables exist', () => {
      const context = { weight: 70, height: 180 }
      const result = resolver.validateVariables(['weight', 'height'], context)
      expect(result.isValid).toBe(true)
      expect(result.missing).toEqual([])
    })

    it('should identify missing variables', () => {
      const context = { weight: 70 }
      const result = resolver.validateVariables(['weight', 'height', 'age'], context)
      expect(result.isValid).toBe(false)
      expect(result.missing).toContain('height')
      expect(result.missing).toContain('age')
    })

    it('should validate nested variables', () => {
      const context = {
        patient: { weight: 70 }
      }
      const result = resolver.validateVariables(
        ['patient.weight', 'patient.height'],
        context
      )
      expect(result.isValid).toBe(false)
      expect(result.missing).toContain('patient.height')
    })

    it('should consider defaults in validation', () => {
      const context = { weight: 70 }
      const defaults = { height: 170 }
      const result = resolver.validateVariables(
        ['weight', 'height'],
        context,
        defaults
      )
      expect(result.isValid).toBe(true)
      expect(result.missing).toEqual([])
    })
  })

  describe('Context Merging', () => {
    it('should merge multiple contexts', () => {
      const context1 = { weight: 70, height: 180 }
      const context2 = { age: 30, gender: 'M' }
      const context3 = { weight: 75 } // Override
      
      const merged = resolver.mergeContexts(context1, context2, context3)
      expect(merged.weight).toBe(75) // Last value wins
      expect(merged.height).toBe(180)
      expect(merged.age).toBe(30)
      expect(merged.gender).toBe('M')
    })

    it('should deep merge nested objects', () => {
      const context1 = {
        patient: { weight: 70, height: 180 }
      }
      const context2 = {
        patient: { age: 30 },
        factor: { stress: 1.2 }
      }
      
      const merged = resolver.mergeContexts(context1, context2)
      expect(merged.patient.weight).toBe(70)
      expect(merged.patient.height).toBe(180)
      expect(merged.patient.age).toBe(30)
      expect(merged.factor.stress).toBe(1.2)
    })

    it('should handle arrays in merge', () => {
      const context1 = { values: [1, 2, 3] }
      const context2 = { values: [4, 5] } // Replace, not merge arrays
      
      const merged = resolver.mergeContexts(context1, context2)
      expect(merged.values).toEqual([4, 5])
    })
  })

  describe('TPN Context Integration', () => {
    it('should resolve TPN-specific variables', () => {
      const tpnContext = {
        patient: {
          weight: 70,
          height: 180,
          age: 30,
          gender: 'M'
        },
        advisor: {
          type: 'ADULT',
          factors: {
            stress: 1.2,
            activity: 1.3
          }
        },
        calculations: {
          bmi: 21.6,
          idealWeight: 72
        }
      }
      
      expect(resolver.resolve('patient.weight', tpnContext)).toBe(70)
      expect(resolver.resolve('advisor.factors.stress', tpnContext)).toBe(1.2)
      expect(resolver.resolve('calculations.bmi', tpnContext)).toBe(21.6)
    })

    it('should handle TPN formula variables', () => {
      const formula = 'patient.weight * advisor.factors.stress + calculations.baseCalories'
      const variables = resolver.extractVariables(formula)
      
      expect(variables).toContain('patient.weight')
      expect(variables).toContain('advisor.factors.stress')
      expect(variables).toContain('calculations.baseCalories')
    })
  })

  describe('Performance', () => {
    it('should resolve variables quickly', () => {
      const context = {
        a: 1, b: 2, c: 3, d: 4, e: 5,
        nested: {
          f: 6, g: 7, h: 8,
          deep: {
            i: 9, j: 10
          }
        }
      }
      
      const start = performance.now()
      for (let i = 0; i < 10000; i++) {
        resolver.resolve('nested.deep.j', context)
      }
      const duration = performance.now() - start
      expect(duration).toBeLessThan(100) // 10000 resolutions in under 100ms
    })

    it('should extract variables efficiently', () => {
      const formula = 'a + b.c + d[0] + e.f.g + min(h, i) * j + k[1].l'
      
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        resolver.extractVariables(formula)
      }
      const duration = performance.now() - start
      expect(duration).toBeLessThan(100) // 1000 extractions in under 100ms
    })
  })
})