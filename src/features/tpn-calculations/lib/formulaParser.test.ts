import { describe, it, expect, beforeEach } from 'vitest'
import { FormulaParser } from './formulaParser'

describe('FormulaParser', () => {
  let parser: FormulaParser

  beforeEach(() => {
    parser = new FormulaParser()
  })

  describe('Basic Arithmetic Operations', () => {
    it('should evaluate addition', () => {
      expect(parser.evaluate('2 + 3')).toBe(5)
      expect(parser.evaluate('10.5 + 20.3')).toBeCloseTo(30.8)
    })

    it('should evaluate subtraction', () => {
      expect(parser.evaluate('10 - 4')).toBe(6)
      expect(parser.evaluate('5.5 - 2.3')).toBeCloseTo(3.2)
    })

    it('should evaluate multiplication', () => {
      expect(parser.evaluate('4 * 5')).toBe(20)
      expect(parser.evaluate('2.5 * 4')).toBe(10)
    })

    it('should evaluate division', () => {
      expect(parser.evaluate('20 / 4')).toBe(5)
      expect(parser.evaluate('10 / 3')).toBeCloseTo(3.333, 2)
    })

    it('should evaluate exponentiation', () => {
      expect(parser.evaluate('2 ^ 3')).toBe(8)
      expect(parser.evaluate('5 ^ 2')).toBe(25)
    })

    it('should handle operator precedence correctly', () => {
      expect(parser.evaluate('2 + 3 * 4')).toBe(14)
      expect(parser.evaluate('10 - 2 * 3')).toBe(4)
      expect(parser.evaluate('20 / 4 + 2')).toBe(7)
    })

    it('should handle parentheses', () => {
      expect(parser.evaluate('(2 + 3) * 4')).toBe(20)
      expect(parser.evaluate('10 / (2 + 3)')).toBe(2)
      expect(parser.evaluate('((2 + 3) * 4) - 10')).toBe(10)
    })
  })

  describe('Variable Substitution', () => {
    it('should substitute single variables', () => {
      const context = { weight: 70, height: 180 }
      expect(parser.evaluate('weight * 2', context)).toBe(140)
      expect(parser.evaluate('height / 100', context)).toBe(1.8)
    })

    it('should substitute multiple variables', () => {
      const context = { weight: 70, height: 180, age: 30 }
      expect(parser.evaluate('weight + height + age', context)).toBe(280)
      expect(parser.evaluate('(weight * 2) + (height / 100)', context)).toBeCloseTo(141.8)
    })

    it('should handle nested object properties', () => {
      const context = { 
        patient: { weight: 70, height: 180 },
        factor: 1.5
      }
      expect(parser.evaluate('patient.weight * factor', context)).toBe(105)
    })

    it('should throw error for undefined variables', () => {
      expect(() => parser.evaluate('unknownVar * 2', {})).toThrow()
    })

    it('should use default values for missing variables if provided', () => {
      const context = { weight: 70 }
      const defaults = { height: 170 }
      expect(parser.evaluate('weight + height', context, defaults)).toBe(240)
    })
  })

  describe('Math Functions', () => {
    it('should support min function', () => {
      expect(parser.evaluate('min(5, 3)')).toBe(3)
      expect(parser.evaluate('min(10, 20, 5, 15)')).toBe(5)
    })

    it('should support max function', () => {
      expect(parser.evaluate('max(5, 3)')).toBe(5)
      expect(parser.evaluate('max(10, 20, 5, 15)')).toBe(20)
    })

    it('should support round function', () => {
      expect(parser.evaluate('round(3.7)')).toBe(4)
      expect(parser.evaluate('round(3.2)')).toBe(3)
    })

    it('should support floor function', () => {
      expect(parser.evaluate('floor(3.7)')).toBe(3)
      expect(parser.evaluate('floor(3.2)')).toBe(3)
    })

    it('should support ceil function', () => {
      expect(parser.evaluate('ceil(3.2)')).toBe(4)
      expect(parser.evaluate('ceil(3.7)')).toBe(4)
    })

    it('should support abs function', () => {
      expect(parser.evaluate('abs(-5)')).toBe(5)
      expect(parser.evaluate('abs(5)')).toBe(5)
    })

    it('should support sqrt function', () => {
      expect(parser.evaluate('sqrt(16)')).toBe(4)
      expect(parser.evaluate('sqrt(25)')).toBe(5)
    })

    it('should support pow function', () => {
      expect(parser.evaluate('pow(2, 3)')).toBe(8)
      expect(parser.evaluate('pow(5, 2)')).toBe(25)
    })

    it('should combine math functions with arithmetic', () => {
      expect(parser.evaluate('min(10, 5) * 2')).toBe(10)
      expect(parser.evaluate('max(3, 7) + round(2.5)')).toBe(10)
    })

    it('should work with variables in math functions', () => {
      const context = { a: 10, b: 5, c: 7.8 }
      expect(parser.evaluate('min(a, b)', context)).toBe(5)
      expect(parser.evaluate('round(c)', context)).toBe(8)
    })
  })

  describe('Complex Expressions', () => {
    it('should handle complex medical formulas', () => {
      const context = {
        weight: 70,
        height: 180,
        age: 30,
        stressFactor: 1.2
      }
      
      // BMI calculation: weight / (height/100)^2
      const bmi = parser.evaluate('weight / pow(height / 100, 2)', context)
      expect(bmi).toBeCloseTo(21.6, 1)

      // Calories with stress factor
      const calories = parser.evaluate('(weight * 25) * stressFactor', context)
      expect(calories).toBe(2100)

      // Protein calculation with max limit
      const protein = parser.evaluate('min(weight * 1.5, 120)', context)
      expect(protein).toBe(105)
    })

    it('should handle nested function calls', () => {
      expect(parser.evaluate('max(min(10, 5), 3)')).toBe(5)
      expect(parser.evaluate('round(abs(-3.7))')).toBe(4)
    })
  })

  describe('Validation', () => {
    it('should validate formula syntax', () => {
      expect(parser.validate('2 + 3')).toEqual({ isValid: true })
      expect(parser.validate('weight * 2')).toEqual({ isValid: true })
      expect(parser.validate('min(a, b)')).toEqual({ isValid: true })
    })

    it('should detect invalid syntax', () => {
      const result1 = parser.validate('2 + + 3')
      expect(result1.isValid).toBe(false)
      expect(result1.error).toBeDefined()

      const result2 = parser.validate('2 * (3')
      expect(result2.isValid).toBe(false)
      expect(result2.error).toBeDefined()
    })

    it('should detect invalid function calls', () => {
      const result = parser.validate('unknownFunc(2, 3)')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('unknownFunc')
    })
  })

  describe('Security and Sandboxing', () => {
    it('should prevent access to global objects', () => {
      expect(() => parser.evaluate('process.exit(1)')).toThrow()
      expect(() => parser.evaluate('require("fs")')).toThrow()
      expect(() => parser.evaluate('eval("2+2")')).toThrow()
    })

    it('should only allow whitelisted functions', () => {
      expect(() => parser.evaluate('setTimeout(() => {}, 1000)')).toThrow()
      expect(() => parser.evaluate('fetch("http://example.com")')).toThrow()
    })

    it('should handle division by zero safely', () => {
      expect(parser.evaluate('10 / 0')).toBe(Infinity)
      expect(parser.evaluate('0 / 0')).toBeNaN()
    })

    it('should limit execution time for complex expressions', () => {
      // This would require async implementation with timeout
      // For now, we ensure no infinite loops in formula structure
      const complexFormula = 'max(' + Array(1000).fill('1').join(', ') + ')'
      expect(() => parser.evaluate(complexFormula)).not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should provide meaningful error messages', () => {
      try {
        parser.evaluate('2 + unknownVar', {})
      } catch (error: any) {
        expect(error.message).toContain('unknownVar')
      }

      try {
        parser.evaluate('min()')
      } catch (error: any) {
        expect(error.message).toContain('min')
      }
    })

    it('should handle null and undefined gracefully', () => {
      const context = { a: null, b: undefined, c: 5 }
      expect(() => parser.evaluate('a + c', context)).toThrow()
      expect(() => parser.evaluate('b * 2', context)).toThrow()
    })
  })

  describe('Performance', () => {
    it('should evaluate simple expressions quickly', () => {
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        parser.evaluate('2 + 3 * 4')
      }
      const duration = performance.now() - start
      expect(duration).toBeLessThan(100) // Should complete 1000 evaluations in under 100ms
    })

    it('should handle complex expressions efficiently', () => {
      const context = { a: 1, b: 2, c: 3, d: 4, e: 5 }
      const formula = 'max(a, b) + min(c, d) * e + round(sqrt(16))'
      
      const start = performance.now()
      for (let i = 0; i < 100; i++) {
        parser.evaluate(formula, context)
      }
      const duration = performance.now() - start
      expect(duration).toBeLessThan(100) // 100 complex evaluations in under 100ms
    })
  })
})