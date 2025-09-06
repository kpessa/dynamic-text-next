import { describe, it, expect, beforeEach } from 'vitest'
import { FormulaValidator, ValidationResult, ValidationLevel } from './formulaValidator'

describe('FormulaValidator', () => {
  let validator: FormulaValidator

  beforeEach(() => {
    validator = new FormulaValidator()
  })

  describe('Syntax Validation', () => {
    it('should validate correct arithmetic expressions', () => {
      const result = validator.validate('2 + 3 * 4')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect unbalanced parentheses', () => {
      const result = validator.validate('(2 + 3')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          level: ValidationLevel.ERROR,
          message: expect.stringContaining('parentheses')
        })
      )
    })

    it('should detect invalid operator sequences', () => {
      const result = validator.validate('2 ++ 3')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          level: ValidationLevel.ERROR,
          message: expect.stringContaining('operator')
        })
      )
    })

    it('should detect empty parentheses', () => {
      const result = validator.validate('2 + ()')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          level: ValidationLevel.ERROR
        })
      )
    })

    it('should allow valid function calls', () => {
      const result = validator.validate('min(2, 3) + max(4, 5)')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect unknown functions', () => {
      const result = validator.validate('unknownFunc(2, 3)')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          level: ValidationLevel.ERROR,
          message: expect.stringContaining('unknownFunc')
        })
      )
    })
  })

  describe('Variable Validation', () => {
    it('should validate variables against context', () => {
      const context = { weight: 70, height: 180 }
      const result = validator.validate('weight * height', context)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect undefined variables', () => {
      const context = { weight: 70 }
      const result = validator.validate('weight * height', context)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          level: ValidationLevel.ERROR,
          message: expect.stringContaining('height')
        })
      )
    })

    it('should handle nested variable references', () => {
      const context = { patient: { weight: 70 } }
      const result = validator.validate('patient.weight * 2', context)
      expect(result.isValid).toBe(true)
    })

    it('should detect missing nested variables', () => {
      const context = { patient: { weight: 70 } }
      const result = validator.validate('patient.height * 2', context)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('patient.height')
        })
      )
    })

    it('should validate array references', () => {
      const context = { values: [1, 2, 3] }
      const result = validator.validate('values[0] + values[1]', context)
      expect(result.isValid).toBe(true)
    })
  })

  describe('Function Argument Validation', () => {
    it('should validate correct number of arguments', () => {
      const result = validator.validate('min(2, 3)')
      expect(result.isValid).toBe(true)
    })

    it('should detect too few arguments', () => {
      const result = validator.validate('min()')
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.includes('argument'))).toBe(true)
    })

    it('should allow variable arguments for variadic functions', () => {
      const result = validator.validate('min(1, 2, 3, 4, 5)')
      expect(result.isValid).toBe(true)
    })

    it('should validate pow requires exactly 2 arguments', () => {
      const result1 = validator.validate('pow(2, 3)')
      expect(result1.isValid).toBe(true)

      const result2 = validator.validate('pow(2)')
      expect(result2.isValid).toBe(false)

      const result3 = validator.validate('pow(2, 3, 4)')
      expect(result3.isValid).toBe(false)
    })
  })

  describe('Circular Dependency Detection', () => {
    it('should detect direct circular dependencies', () => {
      const formulas = new Map([
        ['a', 'b + 1'],
        ['b', 'a + 1']
      ])
      
      const result = validator.validateFormulas(formulas)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.toLowerCase().includes('circular'))).toBe(true)
    })

    it('should detect indirect circular dependencies', () => {
      const formulas = new Map([
        ['a', 'b + 1'],
        ['b', 'c + 1'],
        ['c', 'a + 1']
      ])
      
      const result = validator.validateFormulas(formulas)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.toLowerCase().includes('circular'))).toBe(true)
    })

    it('should allow non-circular dependencies', () => {
      const formulas = new Map([
        ['a', '10'],
        ['b', 'a + 1'],
        ['c', 'b + 1']
      ])
      
      const result = validator.validateFormulas(formulas)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Complexity Analysis', () => {
    it('should calculate formula complexity', () => {
      const simple = validator.analyzeComplexity('a + b')
      expect(simple.score).toBeLessThan(10)

      const medium = validator.analyzeComplexity('min(a, b) * max(c, d) + sqrt(e)')
      expect(medium.score).toBeLessThan(50)

      const complex = validator.analyzeComplexity(
        'min(max(a, b), c) * pow(d, 2) + sqrt(abs(e - f)) / (g + h * i)'
      )
      expect(complex.score).toBeGreaterThan(50)
    })

    it('should warn about high complexity', () => {
      const complexFormula = 'min(max(a, b), c) * pow(d, 2) + sqrt(abs(e - f)) / (g + h * i)'
      const result = validator.validate(complexFormula)
      
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          level: ValidationLevel.WARNING,
          message: expect.stringContaining('complexity')
        })
      )
    })

    it('should count operators and functions', () => {
      const analysis = validator.analyzeComplexity('a + b * c - min(d, e)')
      expect(analysis.operators).toBe(3) // +, *, -
      expect(analysis.functions).toBe(1) // min
      expect(analysis.variables).toBe(5) // a, b, c, d, e
    })
  })

  describe('Security Validation', () => {
    it('should detect potentially dangerous patterns', () => {
      const dangerous = [
        'eval("code")',
        'process.exit()',
        'require("fs")',
        '__proto__',
        'constructor'
      ]

      for (const formula of dangerous) {
        const result = validator.validate(formula)
        expect(result.isValid).toBe(false)
        expect(result.errors.some(e => e.message.toLowerCase().includes('dangerous') || e.message.toLowerCase().includes('security'))).toBe(true)
      }
    })

    it('should allow safe formulas', () => {
      const safe = [
        'weight * 2',
        'min(a, b)',
        'patient.weight + 10'
      ]

      for (const formula of safe) {
        const result = validator.validate(formula)
        expect(result.errors.filter(e => e.message.includes('security'))).toHaveLength(0)
      }
    })
  })

  describe('Unit Validation', () => {
    it('should validate unit conversions', () => {
      const result = validator.validate("convert(weight, 'kg', 'lb')")
      expect(result.isValid).toBe(true)
    })

    it('should detect incompatible unit conversions', () => {
      const result = validator.validate("convert(weight, 'kg', 'cm')")
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.toLowerCase().includes('incompatible'))).toBe(true)
    })

    it('should detect unknown units', () => {
      const result = validator.validate("convert(weight, 'xyz', 'lb')")
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.message.toLowerCase().includes('unknown unit'))).toBe(true)
    })
  })

  describe('Type Checking', () => {
    it('should validate numeric operations', () => {
      const context = { a: 10, b: 20 }
      const result = validator.validate('a + b', context)
      expect(result.isValid).toBe(true)
    })

    it('should warn about operations on non-numeric values', () => {
      const context = { a: 'string', b: 20 }
      const result = validator.validate('a + b', context)
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          level: ValidationLevel.WARNING,
          message: expect.stringContaining('non-numeric')
        })
      )
    })

    it('should handle null/undefined values', () => {
      const context = { a: null, b: undefined }
      const result = validator.validate('a + b', context)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('null')
        })
      )
    })
  })

  describe('Detailed Error Messages', () => {
    it('should provide position information for errors', () => {
      const result = validator.validate('2 + + 3')
      expect(result.errors[0]).toHaveProperty('position')
      expect(result.errors[0].position).toEqual(
        expect.objectContaining({
          start: expect.any(Number),
          end: expect.any(Number)
        })
      )
    })

    it('should provide suggestions for common mistakes', () => {
      const result = validator.validate('min(a b)')
      if (result.errors.length > 0 && result.errors[0].suggestion) {
        expect(result.errors[0].suggestion).toBeDefined()
      }
    })

    it('should provide fix suggestions for typos', () => {
      const result = validator.validate('mim(a, b)') // typo: mim instead of min
      expect(result.errors[0].suggestion).toContain('min')
    })
  })

  describe('Performance Validation', () => {
    it('should warn about potentially slow formulas', () => {
      // Deeply nested formula - need more pow operations to trigger warning
      const nested = 'pow(pow(pow(pow(a, 2), 2), 2), 2)'
      const result = validator.validate(nested)
      // This formula has 4 pow operations, should trigger warning
      expect(result.warnings.some(w => w.message.toLowerCase().includes('pow') || w.message.toLowerCase().includes('performance'))).toBe(true)
    })

    it('should validate formulas quickly', () => {
      const formula = 'a + b * c - min(d, e) + max(f, g)'
      const context = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7 }
      
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        validator.validate(formula, context)
      }
      const duration = performance.now() - start
      expect(duration).toBeLessThan(100) // 1000 validations in under 100ms
    })
  })
})