import { describe, it, expect } from 'vitest'
import {
  validateTPNValues,
  validateInputParameters,
  checkCriticalValues,
  createSafetyAlert,
  validateEdgeCases,
  getValidationSummary
} from './validator'
import type { TPNValues, TPNAdvisorType } from '@/entities/tpn'

describe('TPN Validator', () => {
  describe('validateTPNValues', () => {
    it('should validate normal TPN values', () => {
      const values: TPNValues = {
        calories: 2100,
        protein: 84,
        carbohydrates: 300,
        lipids: 70,
        sodium: 2.5,
        potassium: 1.5,
        calcium: 0.5,
        magnesium: 0.15,
        phosphorus: 0.5
      }

      const result = validateTPNValues(values, 'ADULT')
      expect(result.isValid).toBe(true)
      expect(result.warnings).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect out-of-range sodium for NEO', () => {
      const values: TPNValues = {
        calories: 100,
        protein: 3.5,
        carbohydrates: 12,
        lipids: 3,
        sodium: 5, // Too high for NEO (max 4)
        potassium: 2.5,
        calcium: 2,
        magnesium: 0.3,
        phosphorus: 1.5
      }

      const result = validateTPNValues(values, 'NEO')
      expect(result.isValid).toBe(false)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0].field).toBe('sodium')
      expect(result.warnings[0].severity).toBe('high')
    })

    it('should detect multiple out-of-range values', () => {
      const values: TPNValues = {
        calories: 10000, // Too high
        protein: 500, // Too high
        carbohydrates: 1000, // Too high
        lipids: 300, // Too high
        sodium: 500, // Too high
        potassium: 300, // Too high
        calcium: 50, // Too high
        magnesium: 30, // Too high
        phosphorus: 100 // Too high
      }

      const result = validateTPNValues(values, 'ADULT')
      expect(result.isValid).toBe(false)
      expect(result.warnings.length).toBeGreaterThan(5)
    })
  })

  describe('validateInputParameters', () => {
    it('should validate normal input parameters', () => {
      const params = {
        weight: 70,
        height: 175,
        age: 30
      }

      const result = validateInputParameters(params, 'ADULT')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject negative weight', () => {
      const params = {
        weight: -10,
        height: 175,
        age: 30
      }

      const result = validateInputParameters(params, 'ADULT')
      expect(result.isValid).toBe(false)
      expect(result.errors[0].field).toBe('weight')
      expect(result.errors[0].code).toBe('INVALID_WEIGHT')
    })

    it('should reject weight outside advisor range', () => {
      const params = {
        weight: 100, // Too heavy for NEO (max 10kg)
        height: 100,
        age: 0.5
      }

      const result = validateInputParameters(params, 'NEO')
      expect(result.isValid).toBe(false)
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0].field).toBe('weight')
    })

    it('should validate missing optional parameters', () => {
      const params = {
        weight: 70
      }

      const result = validateInputParameters(params, 'ADULT')
      expect(result.isValid).toBe(true)
    })
  })

  describe('checkCriticalValues', () => {
    it('should detect critical sodium levels', () => {
      const values: TPNValues = {
        calories: 2100,
        protein: 84,
        carbohydrates: 300,
        lipids: 70,
        sodium: 10, // Critically high
        potassium: 2,
        calcium: 1,
        magnesium: 0.5,
        phosphorus: 1
      }

      const alerts = checkCriticalValues(values, 'ADULT')
      expect(alerts.length).toBeGreaterThan(0)
      const sodiumAlert = alerts.find(a => a.field === 'sodium')
      expect(sodiumAlert).toBeDefined()
      expect(sodiumAlert?.severity).toBe('critical')
    })

    it('should detect multiple critical values', () => {
      const values: TPNValues = {
        calories: 0, // Critically low
        protein: 0, // Critically low
        carbohydrates: 0,
        lipids: 0,
        sodium: 20, // Critically high
        potassium: 15, // Critically high
        calcium: 0,
        magnesium: 0,
        phosphorus: 0
      }

      const alerts = checkCriticalValues(values, 'ADULT')
      expect(alerts.length).toBeGreaterThan(2)
    })

    it('should not alert for normal values', () => {
      const values: TPNValues = {
        calories: 2100,
        protein: 84,
        carbohydrates: 300,
        lipids: 70,
        sodium: 2.5,
        potassium: 1.5,
        calcium: 0.5,
        magnesium: 0.15,
        phosphorus: 0.5
      }

      const alerts = checkCriticalValues(values, 'ADULT')
      expect(alerts).toHaveLength(0)
    })
  })

  describe('createSafetyAlert', () => {
    it('should create a safety alert', () => {
      const alert = createSafetyAlert('sodium', 10, 'critical', 'Sodium level critically high')
      
      expect(alert.field).toBe('sodium')
      expect(alert.value).toBe(10)
      expect(alert.severity).toBe('critical')
      expect(alert.message).toBe('Sodium level critically high')
      expect(alert.timestamp).toBeDefined()
    })
  })

  describe('validateEdgeCases', () => {
    it('should handle zero weight', () => {
      const params = {
        weight: 0,
        height: 175,
        age: 30
      }

      const result = validateEdgeCases(params, 'ADULT')
      expect(result.isValid).toBe(false)
      expect(result.errors[0].message).toContain('Weight must be greater than zero')
    })

    it('should handle extremely high values', () => {
      const params = {
        weight: 1000,
        height: 500,
        age: 200
      }

      const result = validateEdgeCases(params, 'ADULT')
      expect(result.isValid).toBe(false)
      expect(result.warnings.length).toBeGreaterThan(0)
    })

    it('should handle NEO with adult weight', () => {
      const params = {
        weight: 70,
        height: 175,
        age: 30
      }

      const result = validateEdgeCases(params, 'NEO')
      expect(result.isValid).toBe(false)
      expect(result.errors[0].message).toContain('incompatible with NEO advisor')
    })
  })

  describe('getValidationSummary', () => {
    it('should provide a summary of validation results', () => {
      const values: TPNValues = {
        calories: 2100,
        protein: 84,
        carbohydrates: 300,
        lipids: 70,
        sodium: 2.5,
        potassium: 1.5,
        calcium: 0.5,
        magnesium: 0.15,
        phosphorus: 0.5
      }

      const params = {
        weight: 70,
        height: 175,
        age: 30
      }

      const summary = getValidationSummary(values, params, 'ADULT')
      
      expect(summary.overallValid).toBe(true)
      expect(summary.totalWarnings).toBe(0)
      expect(summary.totalErrors).toBe(0)
      expect(summary.criticalAlerts).toHaveLength(0)
      expect(summary.recommendations).toBeDefined()
    })

    it('should summarize issues when present', () => {
      const values: TPNValues = {
        calories: 10000,
        protein: 500,
        carbohydrates: 1000,
        lipids: 300,
        sodium: 20,
        potassium: 15,
        calcium: 10,
        magnesium: 5,
        phosphorus: 10
      }

      const params = {
        weight: 70,
        height: 175,
        age: 30
      }

      const summary = getValidationSummary(values, params, 'ADULT')
      
      expect(summary.overallValid).toBe(false)
      expect(summary.totalWarnings).toBeGreaterThan(0)
      expect(summary.criticalAlerts.length).toBeGreaterThan(0)
      expect(summary.recommendations).toContain('Review')
    })
  })
})