import { describe, it, expect, beforeEach } from 'vitest'
import { 
  getIngredientByKeyname,
  validateIngredientValue,
  getIngredientReferenceRanges,
  isIngredientShared,
  calculateIngredientValue,
  getRequiredIngredients
} from './tpnIngredientService'
import type { Ingredient } from '../types'
import type { TPNAdvisorType, ReferenceRange } from '@/entities/tpn'

describe('TPN Ingredient Service', () => {
  const mockIngredients: Ingredient[] = [
    {
      id: '1',
      keyname: 'sodium',
      displayName: 'Sodium',
      category: 'electrolyte',
      unit: 'mEq/L',
      isShared: true,
      referenceRanges: [
        {
          populationType: 'NEO',
          min: 2,
          max: 4,
          unit: 'mEq/kg'
        },
        {
          populationType: 'ADULT',
          min: 2,
          max: 3,
          unit: 'mEq/kg'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      keyname: 'calories',
      displayName: 'Calories',
      category: 'macro',
      unit: 'kcal',
      isShared: true,
      formula: 'weight * calories_per_kg',
      dependencies: ['weight', 'calories_per_kg'],
      referenceRanges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      keyname: 'custom_ingredient',
      displayName: 'Custom Ingredient',
      category: 'other',
      unit: 'mg',
      isShared: false,
      healthSystem: 'hospital_a',
      referenceRanges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  describe('getIngredientByKeyname', () => {
    it('should find ingredient by keyname', () => {
      const ingredient = getIngredientByKeyname('sodium', mockIngredients)
      expect(ingredient).toBeDefined()
      expect(ingredient?.keyname).toBe('sodium')
      expect(ingredient?.displayName).toBe('Sodium')
    })

    it('should return undefined for non-existent keyname', () => {
      const ingredient = getIngredientByKeyname('nonexistent', mockIngredients)
      expect(ingredient).toBeUndefined()
    })

    it('should be case-insensitive', () => {
      const ingredient = getIngredientByKeyname('SODIUM', mockIngredients)
      expect(ingredient).toBeDefined()
      expect(ingredient?.keyname).toBe('sodium')
    })
  })

  describe('validateIngredientValue', () => {
    it('should validate value within range', () => {
      const result = validateIngredientValue(3, 'sodium', 'NEO', mockIngredients)
      expect(result.isValid).toBe(true)
      expect(result.warnings).toHaveLength(0)
    })

    it('should return warning for value above max', () => {
      const result = validateIngredientValue(5, 'sodium', 'NEO', mockIngredients)
      expect(result.isValid).toBe(false)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0].message).toContain('above maximum')
    })

    it('should return warning for value below min', () => {
      const result = validateIngredientValue(1, 'sodium', 'NEO', mockIngredients)
      expect(result.isValid).toBe(false)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0].message).toContain('below minimum')
    })

    it('should validate ingredient without ranges', () => {
      const result = validateIngredientValue(100, 'calories', 'NEO', mockIngredients)
      expect(result.isValid).toBe(true)
      expect(result.warnings).toHaveLength(0)
    })
  })

  describe('getIngredientReferenceRanges', () => {
    it('should get reference ranges for advisor type', () => {
      const ranges = getIngredientReferenceRanges('sodium', 'NEO', mockIngredients)
      expect(ranges).toHaveLength(2)
      expect(ranges[0].value).toBe(2)
      expect(ranges[0].threshold).toBe('min')
      expect(ranges[1].value).toBe(4)
      expect(ranges[1].threshold).toBe('max')
    })

    it('should return empty array for ingredient without ranges', () => {
      const ranges = getIngredientReferenceRanges('calories', 'NEO', mockIngredients)
      expect(ranges).toEqual([])
    })

    it('should return empty array for non-existent ingredient', () => {
      const ranges = getIngredientReferenceRanges('nonexistent', 'NEO', mockIngredients)
      expect(ranges).toEqual([])
    })
  })

  describe('isIngredientShared', () => {
    it('should return true for shared ingredients', () => {
      expect(isIngredientShared('sodium', mockIngredients)).toBe(true)
      expect(isIngredientShared('calories', mockIngredients)).toBe(true)
    })

    it('should return false for custom ingredients', () => {
      expect(isIngredientShared('custom_ingredient', mockIngredients)).toBe(false)
    })

    it('should return false for non-existent ingredients', () => {
      expect(isIngredientShared('nonexistent', mockIngredients)).toBe(false)
    })
  })

  describe('calculateIngredientValue', () => {
    const context = {
      weight: 70,
      calories_per_kg: 30,
      height: 175
    }

    it('should calculate value using formula', () => {
      const value = calculateIngredientValue('calories', context, mockIngredients)
      expect(value).toBe(2100) // 70 * 30
    })

    it('should return 0 for ingredient without formula', () => {
      const value = calculateIngredientValue('sodium', context, mockIngredients)
      expect(value).toBe(0)
    })

    it('should return 0 for non-existent ingredient', () => {
      const value = calculateIngredientValue('nonexistent', context, mockIngredients)
      expect(value).toBe(0)
    })

    it('should handle missing dependencies', () => {
      const contextMissingDep = { weight: 70 }
      const value = calculateIngredientValue('calories', contextMissingDep, mockIngredients)
      expect(value).toBe(0) // calories_per_kg is missing, defaults to 0
    })
  })

  describe('getRequiredIngredients', () => {
    it('should return electrolytes for NEO', () => {
      const required = getRequiredIngredients('NEO')
      expect(required).toContain('sodium')
      expect(required).toContain('potassium')
      expect(required).toContain('calcium')
      expect(required).toContain('magnesium')
      expect(required).toContain('phosphorus')
    })

    it('should return macronutrients for all advisors', () => {
      const neoRequired = getRequiredIngredients('NEO')
      const adultRequired = getRequiredIngredients('ADULT')
      
      expect(neoRequired).toContain('calories')
      expect(neoRequired).toContain('protein')
      expect(neoRequired).toContain('carbohydrates')
      expect(neoRequired).toContain('lipids')
      
      expect(adultRequired).toContain('calories')
      expect(adultRequired).toContain('protein')
      expect(adultRequired).toContain('carbohydrates')
      expect(adultRequired).toContain('lipids')
    })

    it('should include vitamins for pediatric populations', () => {
      const neoRequired = getRequiredIngredients('NEO')
      const childRequired = getRequiredIngredients('CHILD')
      
      expect(neoRequired).toContain('vitamin_a')
      expect(neoRequired).toContain('vitamin_d')
      expect(childRequired).toContain('vitamin_a')
      expect(childRequired).toContain('vitamin_d')
    })
  })
})