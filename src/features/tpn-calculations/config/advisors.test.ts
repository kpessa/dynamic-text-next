import { describe, it, expect } from 'vitest'
import { 
  advisorConfigs, 
  getAdvisorConfig, 
  getAdvisorByAlias,
  getCalculationForAdvisor,
  getReferenceRangesForAdvisor,
  isValueInRange
} from './advisors'
import type { TPNAdvisorType } from '@/entities/tpn'

describe('Advisor Configurations', () => {
  describe('advisorConfigs', () => {
    it('should have all four advisor types', () => {
      expect(advisorConfigs.NEO).toBeDefined()
      expect(advisorConfigs.CHILD).toBeDefined()
      expect(advisorConfigs.ADOLESCENT).toBeDefined()
      expect(advisorConfigs.ADULT).toBeDefined()
    })

    it('should have weight ranges for each advisor', () => {
      expect(advisorConfigs.NEO.weightRange).toEqual({ min: 0.5, max: 10 })
      expect(advisorConfigs.CHILD.weightRange).toEqual({ min: 10, max: 30 })
      expect(advisorConfigs.ADOLESCENT.weightRange).toEqual({ min: 30, max: 60 })
      expect(advisorConfigs.ADULT.weightRange).toEqual({ min: 40, max: 200 })
    })

    it('should have aliases for each advisor', () => {
      expect(advisorConfigs.NEO.aliases).toContain('neonatal')
      expect(advisorConfigs.NEO.aliases).toContain('infant')
      expect(advisorConfigs.CHILD.aliases).toContain('child')
      expect(advisorConfigs.ADOLESCENT.aliases).toContain('teen')
      expect(advisorConfigs.ADULT.aliases).toContain('adult')
    })

    it('should have calculation formulas for NEO', () => {
      const neo = advisorConfigs.NEO
      expect(neo.calculations.calories).toBe('weight * 100')
      expect(neo.calculations.protein).toBe('weight * 3.5')
      expect(neo.calculations.carbohydrates).toBe('weight * 12')
      expect(neo.calculations.lipids).toBe('weight * 3')
      expect(neo.calculations.sodium).toBe('weight * 3')
      expect(neo.calculations.potassium).toBe('weight * 2.5')
      expect(neo.calculations.calcium).toBe('weight * 2')
      expect(neo.calculations.magnesium).toBe('weight * 0.3')
      expect(neo.calculations.phosphorus).toBe('weight * 1.5')
    })

    it('should have calculation formulas for CHILD', () => {
      const child = advisorConfigs.CHILD
      expect(child.calculations.calories).toBe('1000 + (weight * 50)')
      expect(child.calculations.protein).toBe('weight * 2.5')
      expect(child.calculations.carbohydrates).toBe('weight * 10')
      expect(child.calculations.lipids).toBe('weight * 2.5')
    })

    it('should have calculation formulas for ADOLESCENT', () => {
      const adolescent = advisorConfigs.ADOLESCENT
      expect(adolescent.calculations.calories).toBe('(weight * 50) + 500')
      expect(adolescent.calculations.protein).toBe('weight * 2')
    })

    it('should have calculation formulas for ADULT', () => {
      const adult = advisorConfigs.ADULT
      expect(adult.calculations.calories).toBe('weight * 30')
      expect(adult.calculations.protein).toBe('weight * 1.2')
      expect(adult.calculations.carbohydrates).toBe('weight * 4')
      expect(adult.calculations.lipids).toBe('weight * 1')
    })
  })

  describe('getAdvisorConfig', () => {
    it('should return correct config for each advisor type', () => {
      expect(getAdvisorConfig('NEO')).toBe(advisorConfigs.NEO)
      expect(getAdvisorConfig('CHILD')).toBe(advisorConfigs.CHILD)
      expect(getAdvisorConfig('ADOLESCENT')).toBe(advisorConfigs.ADOLESCENT)
      expect(getAdvisorConfig('ADULT')).toBe(advisorConfigs.ADULT)
    })
  })

  describe('getAdvisorByAlias', () => {
    it('should return correct advisor type for aliases', () => {
      expect(getAdvisorByAlias('neonatal')).toBe('NEO')
      expect(getAdvisorByAlias('infant')).toBe('NEO')
      expect(getAdvisorByAlias('newborn')).toBe('NEO')
      expect(getAdvisorByAlias('child')).toBe('CHILD')
      expect(getAdvisorByAlias('pediatric')).toBe('CHILD')
      expect(getAdvisorByAlias('teen')).toBe('ADOLESCENT')
      expect(getAdvisorByAlias('teenager')).toBe('ADOLESCENT')
      expect(getAdvisorByAlias('adult')).toBe('ADULT')
      expect(getAdvisorByAlias('elderly')).toBe('ADULT')
    })

    it('should return null for unknown aliases', () => {
      expect(getAdvisorByAlias('unknown')).toBeNull()
      expect(getAdvisorByAlias('alien')).toBeNull()
    })

    it('should be case-insensitive', () => {
      expect(getAdvisorByAlias('NEONATAL')).toBe('NEO')
      expect(getAdvisorByAlias('Child')).toBe('CHILD')
      expect(getAdvisorByAlias('TEEN')).toBe('ADOLESCENT')
    })
  })

  describe('getCalculationForAdvisor', () => {
    it('should return calculation formula for given advisor and field', () => {
      expect(getCalculationForAdvisor('NEO', 'calories')).toBe('weight * 100')
      expect(getCalculationForAdvisor('CHILD', 'protein')).toBe('weight * 2.5')
      expect(getCalculationForAdvisor('ADOLESCENT', 'calories')).toBe('(weight * 50) + 500')
      expect(getCalculationForAdvisor('ADULT', 'lipids')).toBe('weight * 1')
    })

    it('should return null for non-existent calculations', () => {
      expect(getCalculationForAdvisor('NEO', 'nonexistent')).toBeNull()
      expect(getCalculationForAdvisor('ADULT', 'invalid')).toBeNull()
    })
  })

  describe('getReferenceRangesForAdvisor', () => {
    it('should return reference ranges for NEO sodium', () => {
      const ranges = getReferenceRangesForAdvisor('NEO', 'sodium')
      expect(ranges).toHaveLength(2)
      expect(ranges.find(r => r.threshold === 'min')).toEqual({
        threshold: 'min',
        value: 2,
        advisorType: 'NEO',
        unit: 'mEq/kg',
        ingredient: 'sodium'
      })
      expect(ranges.find(r => r.threshold === 'max')).toEqual({
        threshold: 'max',
        value: 4,
        advisorType: 'NEO',
        unit: 'mEq/kg',
        ingredient: 'sodium'
      })
    })

    it('should return reference ranges for ADULT sodium', () => {
      const ranges = getReferenceRangesForAdvisor('ADULT', 'sodium')
      expect(ranges).toHaveLength(2)
      expect(ranges.find(r => r.threshold === 'min')?.value).toBe(2)
      expect(ranges.find(r => r.threshold === 'max')?.value).toBe(3)
    })

    it('should return reference ranges for potassium', () => {
      const neoRanges = getReferenceRangesForAdvisor('NEO', 'potassium')
      expect(neoRanges).toHaveLength(2)
      expect(neoRanges.find(r => r.threshold === 'min')?.value).toBe(2)
      expect(neoRanges.find(r => r.threshold === 'max')?.value).toBe(3)
    })

    it('should return empty array for ingredients without ranges', () => {
      const ranges = getReferenceRangesForAdvisor('NEO', 'unknown')
      expect(ranges).toEqual([])
    })
  })

  describe('isValueInRange', () => {
    it('should validate values against reference ranges', () => {
      expect(isValueInRange(3, 'NEO', 'sodium')).toBe(true)
      expect(isValueInRange(5, 'NEO', 'sodium')).toBe(false)
      expect(isValueInRange(1, 'NEO', 'sodium')).toBe(false)
      
      expect(isValueInRange(2.5, 'ADULT', 'sodium')).toBe(true)
      expect(isValueInRange(4, 'ADULT', 'sodium')).toBe(false)
    })

    it('should return true for ingredients without ranges', () => {
      expect(isValueInRange(100, 'NEO', 'nonexistent')).toBe(true)
    })

    it('should validate calcium ranges', () => {
      expect(isValueInRange(1.5, 'NEO', 'calcium')).toBe(true)
      expect(isValueInRange(0.5, 'NEO', 'calcium')).toBe(false)
      expect(isValueInRange(3, 'NEO', 'calcium')).toBe(false)
    })
  })
})