import { describe, it, expect, beforeEach } from 'vitest'
import { MockMe, getValue, maxP, calculate, evaluateExpression, convertUnit } from './calculator'
import type { TPNAdvisorType } from '@/entities/tpn'

describe('TPN Calculator', () => {
  describe('MockMe Class', () => {
    let mockMe: MockMe
    const values = {
      weight: 70,
      height: 175,
      age: 30,
      sodium: 140
    }

    beforeEach(() => {
      mockMe = new MockMe(values, 'ADULT')
    })

    it('should initialize with values and advisor type', () => {
      expect(mockMe.getAdvisorType()).toBe('ADULT')
      expect(mockMe.getValue('weight')).toBe(70)
    })

    it('should return 0 for non-existent keys', () => {
      expect(mockMe.getValue('nonexistent')).toBe(0)
    })

    it('should format values with precision', () => {
      expect(mockMe.maxP(3.14159)).toBe('3.14')
      expect(mockMe.maxP(3.14159, 4)).toBe('3.1416')
      expect(mockMe.maxP(100, 0)).toBe('100')
    })

    it('should calculate expressions', () => {
      expect(mockMe.calculate('weight * 2')).toBe(140)
      expect(mockMe.calculate('weight + height')).toBe(245)
      expect(mockMe.calculate('sodium / 2')).toBe(70)
    })
  })

  describe('getValue function', () => {
    const context = {
      weight: 70,
      height: 175,
      calories: 2100
    }

    it('should retrieve values from context', () => {
      expect(getValue('weight', context)).toBe(70)
      expect(getValue('calories', context)).toBe(2100)
    })

    it('should return 0 for missing keys', () => {
      expect(getValue('missing', context)).toBe(0)
    })

    it('should handle null and undefined values', () => {
      const contextWithNulls = {
        nullValue: null,
        undefinedValue: undefined,
        zeroValue: 0
      }
      expect(getValue('nullValue', contextWithNulls)).toBe(0)
      expect(getValue('undefinedValue', contextWithNulls)).toBe(0)
      expect(getValue('zeroValue', contextWithNulls)).toBe(0)
    })
  })

  describe('maxP function', () => {
    it('should format numbers with default precision', () => {
      expect(maxP(3.14159)).toBe('3.14')
      expect(maxP(100)).toBe('100.00')
      expect(maxP(0.1234)).toBe('0.12')
    })

    it('should format numbers with custom precision', () => {
      expect(maxP(3.14159, 0)).toBe('3')
      expect(maxP(3.14159, 1)).toBe('3.1')
      expect(maxP(3.14159, 3)).toBe('3.142')
      expect(maxP(3.14159, 5)).toBe('3.14159')
    })

    it('should handle negative numbers', () => {
      expect(maxP(-3.14159)).toBe('-3.14')
      expect(maxP(-100, 0)).toBe('-100')
    })

    it('should handle very large and small numbers', () => {
      expect(maxP(1000000)).toBe('1000000.00')
      expect(maxP(0.000001, 6)).toBe('0.000001')
    })
  })

  describe('calculate function', () => {
    const context = {
      weight: 70,
      height: 175,
      age: 30,
      bmi: 22.86
    }

    it('should evaluate basic arithmetic', () => {
      expect(calculate('weight * 2', context)).toBe(140)
      expect(calculate('height / 100', context)).toBe(1.75)
      expect(calculate('age + 10', context)).toBe(40)
      expect(calculate('weight - 20', context)).toBe(50)
    })

    it('should evaluate complex expressions', () => {
      expect(calculate('(weight * 2) + height', context)).toBe(315)
      expect(calculate('weight * height / 100', context)).toBe(122.5)
      expect(calculate('(age + 20) * 2', context)).toBe(100)
    })

    it('should handle expressions with multiple variables', () => {
      expect(calculate('weight + height + age', context)).toBe(275)
      expect(calculate('weight * age / 10', context)).toBe(210)
    })

    it('should return 0 for invalid expressions', () => {
      expect(calculate('invalid expression', context)).toBe(0)
      expect(calculate('', context)).toBe(0)
    })

    it('should handle division by zero', () => {
      const contextWithZero = { value: 0 }
      expect(calculate('10 / value', contextWithZero)).toBe(Infinity)
    })
  })

  describe('evaluateExpression function', () => {
    const context = {
      a: 10,
      b: 20,
      c: 30
    }

    it('should safely evaluate mathematical expressions', () => {
      expect(evaluateExpression('a + b', context)).toBe(30)
      expect(evaluateExpression('b * 2', context)).toBe(40)
      expect(evaluateExpression('c / 3', context)).toBe(10)
    })

    it('should support parentheses', () => {
      expect(evaluateExpression('(a + b) * 2', context)).toBe(60)
      expect(evaluateExpression('a * (b + c)', context)).toBe(500)
    })

    it('should support power operations', () => {
      expect(evaluateExpression('a ^ 2', context)).toBe(100)
      expect(evaluateExpression('2 ^ 3', context)).toBe(8)
    })

    it('should handle missing variables as 0', () => {
      expect(evaluateExpression('missing + a', context)).toBe(10)
      expect(evaluateExpression('missing * 10', context)).toBe(0)
    })

    it('should throw or return 0 for dangerous expressions', () => {
      expect(evaluateExpression('alert("hack")', context)).toBe(0)
      expect(evaluateExpression('process.exit()', context)).toBe(0)
    })
  })

  describe('convertUnit function', () => {
    it('should convert weight units', () => {
      expect(convertUnit(1, 'kg', 'g')).toBe(1000)
      expect(convertUnit(1000, 'g', 'kg')).toBe(1)
      expect(convertUnit(1, 'kg', 'lb')).toBeCloseTo(2.20462, 4)
      expect(convertUnit(2.20462, 'lb', 'kg')).toBeCloseTo(1, 4)
    })

    it('should convert volume units', () => {
      expect(convertUnit(1, 'L', 'mL')).toBe(1000)
      expect(convertUnit(1000, 'mL', 'L')).toBe(1)
      expect(convertUnit(1, 'L', 'dL')).toBe(10)
      expect(convertUnit(10, 'dL', 'L')).toBe(1)
    })

    it('should convert concentration units', () => {
      expect(convertUnit(1, 'g/L', 'mg/dL')).toBe(100)
      expect(convertUnit(100, 'mg/dL', 'g/L')).toBe(1)
      expect(convertUnit(1, 'mEq/L', 'mmol/L')).toBe(1)
    })

    it('should return the same value for same units', () => {
      expect(convertUnit(100, 'kg', 'kg')).toBe(100)
      expect(convertUnit(50, 'mL', 'mL')).toBe(50)
    })

    it('should handle unknown unit conversions', () => {
      expect(convertUnit(100, 'unknown', 'kg')).toBe(100)
      expect(convertUnit(100, 'kg', 'unknown')).toBe(100)
    })
  })
})