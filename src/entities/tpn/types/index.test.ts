import { describe, it, expect } from 'vitest'
import type {
  TPNAdvisorType,
  TPNInstance,
  TPNValues,
  MockMeInterface,
  ReferenceRange,
  ValidationResult,
  ValidationWarning,
  CalculationHistory
} from './index'

describe('TPN Types', () => {
  describe('TPNAdvisorType', () => {
    it('should have all required advisor types', () => {
      const advisorTypes: TPNAdvisorType[] = ['NEO', 'CHILD', 'ADOLESCENT', 'ADULT']
      advisorTypes.forEach(type => {
        expect(type).toBeTruthy()
      })
    })
  })

  describe('TPNInstance', () => {
    it('should have required properties', () => {
      const instance: TPNInstance = {
        id: 'test-123',
        advisorType: 'ADULT',
        patientId: 'patient-456',
        values: {
          weight: 70,
          height: 175,
          age: 30
        },
        calculatedValues: {
          calories: 2100,
          protein: 84,
          sodium: 140
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      expect(instance.id).toBe('test-123')
      expect(instance.advisorType).toBe('ADULT')
      expect(instance.values.weight).toBe(70)
      expect(instance.calculatedValues?.calories).toBe(2100)
    })
  })

  describe('TPNValues', () => {
    it('should store calculation results', () => {
      const values: TPNValues = {
        calories: 2100,
        protein: 84,
        carbohydrates: 300,
        lipids: 70,
        sodium: 140,
        potassium: 80,
        calcium: 10,
        magnesium: 8,
        phosphorus: 30
      }

      expect(values.calories).toBe(2100)
      expect(values.sodium).toBe(140)
    })
  })

  describe('MockMeInterface', () => {
    it('should define required methods', () => {
      const mockMe: MockMeInterface = {
        getValue: (key: string) => 0,
        maxP: (value: number, precision?: number) => value.toFixed(precision || 2),
        calculate: (expression: string) => 0,
        getAdvisorType: () => 'ADULT'
      }

      expect(mockMe.getValue('test')).toBe(0)
      expect(mockMe.maxP(3.14159, 2)).toBe('3.14')
      expect(mockMe.getAdvisorType()).toBe('ADULT')
    })
  })

  describe('ReferenceRange', () => {
    it('should define reference ranges for ingredients', () => {
      const range: ReferenceRange = {
        threshold: 'max',
        value: 4,
        advisorType: 'NEO',
        unit: 'mEq/kg',
        ingredient: 'sodium'
      }

      expect(range.threshold).toBe('max')
      expect(range.value).toBe(4)
      expect(range.advisorType).toBe('NEO')
      expect(range.unit).toBe('mEq/kg')
    })
  })

  describe('ValidationResult', () => {
    it('should contain validation information', () => {
      const warning: ValidationWarning = {
        field: 'sodium',
        value: 5,
        range: { min: 2, max: 4 },
        message: 'Sodium level above maximum recommended range',
        severity: 'high'
      }

      const result: ValidationResult = {
        isValid: false,
        warnings: [warning],
        errors: []
      }

      expect(result.isValid).toBe(false)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0].severity).toBe('high')
    })
  })

  describe('CalculationHistory', () => {
    it('should track calculation history', () => {
      const history: CalculationHistory = {
        id: 'calc-789',
        instanceId: 'instance-123',
        timestamp: new Date().toISOString(),
        inputValues: { weight: 70 },
        calculatedValues: { calories: 2100 },
        advisorType: 'ADULT',
        userId: 'user-456'
      }

      expect(history.id).toBe('calc-789')
      expect(history.advisorType).toBe('ADULT')
      expect(history.calculatedValues.calories).toBe(2100)
    })
  })
})