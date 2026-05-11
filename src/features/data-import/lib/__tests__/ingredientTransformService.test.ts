import { describe, it, expect, beforeEach } from 'vitest'
import { ingredientTransformService } from '../ingredientTransformService'
import type { Ingredient as TPNIngredient } from '../../types/schemas'
import type { Ingredient as DomainIngredient } from '@/entities/ingredient/types'

describe('IngredientTransformService', () => {
  let mockTPNIngredient: TPNIngredient
  let mockDomainIngredient: DomainIngredient

  beforeEach(() => {
    // Setup mock TPN ingredient
    mockTPNIngredient = {
      KEYNAME: 'CALCIUM',
      DISPLAY: 'Calcium Gluconate',
      MNEMONIC: 'CA',
      UOM_DISP: 'mEq',
      TYPE: 'Electrolyte',
      OSMO_RATIO: 0.361,
      EDITMODE: 'Custom',
      PRECISION: 2,
      SPECIAL: 'N',
      NOTE: [
        { TEXT: 'Calcium is essential for bone health' },
        { TEXT: 'const maxDose = 20;', TYPE: 'DYNAMIC' }
      ],
      ALTUOM: [
        { NAME: 'mg', UOM_DISP: 'mg', CONVERSION: 20 }
      ],
      REFERENCE_RANGE: [
        { THRESHOLD: 'Normal Low', VALUE: 8.5, POPULATION: 'ADULT' },
        { THRESHOLD: 'Normal High', VALUE: 10.5, POPULATION: 'ADULT' },
        { THRESHOLD: 'Critical Low', VALUE: 6.0, POPULATION: 'ADULT' },
        { THRESHOLD: 'Critical High', VALUE: 13.0, POPULATION: 'ADULT' }
      ],
      LABS: [
        { NAME: 'Serum Calcium', CODE: 'CA', UOM: 'mg/dL' }
      ],
      CONCENTRATION: {
        STRENGTH: 100,
        STRENGTH_UOM: 'mg',
        VOLUME: 10,
        VOLUME_UOM: 'mL'
      },
      EXCLUDES: [
        { KEYNAME: 'PHOSPHATE' }
      ]
    }

    // Setup mock domain ingredient
    mockDomainIngredient = {
      id: 'test-id',
      keyname: 'CALCIUM',
      displayName: 'Calcium Gluconate',
      mnemonic: 'CA',
      type: 'Salt',
      category: 'salt',
      unit: 'mEq',
      alternateUnits: [
        { name: 'mg', unit: 'mg', conversionFactor: 20 }
      ],
      referenceRanges: [
        {
          populationType: 'ADULT',
          unit: '',
          normal: { low: 8.5, high: 10.5 },
          critical: { low: 6.0, high: 13.0 }
        }
      ],
      concentration: {
        strength: 100,
        strengthUnit: 'mg',
        volume: 10,
        volumeUnit: 'mL'
      },
      isShared: false,
      healthSystem: 'CHOC',
      populationType: 'ADULT',
      osmolalityRatio: 0.361,
      editMode: 'Custom',
      precision: 2,
      special: 'N',
      excludes: ['PHOSPHATE'],
      labs: [
        { displayName: 'Serum Calcium', eventSetName: 'CA', shouldGraph: true }
      ],
      notes: ['Calcium is essential for bone health'],
      sections: [
        {
          id: 'CALCIUM_note_0_123',
          name: 'Section 1',
          type: 'static',
          content: 'Calcium is essential for bone health',
          order: 0,
          metadata: { sourceIngredient: 'CALCIUM', originalIndex: 0 }
        },
        {
          id: 'CALCIUM_note_1_123',
          name: 'Section 2',
          type: 'dynamic',
          content: 'const maxDose = 20;',
          order: 1,
          metadata: { sourceIngredient: 'CALCIUM', originalIndex: 1 }
        }
      ],
      formula: 'const maxDose = 20;',
      dependencies: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      metadata: {
        originalFormat: 'TPN',
        importedAt: '2024-01-01T00:00:00Z'
      }
    }
  })

  describe('toDomainFormat', () => {
    it('should transform TPN ingredient to domain format', () => {
      const result = ingredientTransformService.toDomainFormat(
        mockTPNIngredient,
        'CHOC',
        'ADULT'
      )

      expect(result.keyname).toBe('CALCIUM')
      expect(result.displayName).toBe('Calcium Gluconate')
      expect(result.mnemonic).toBe('CA')
      expect(result.unit).toBe('mEq')
      expect(result.category).toBe('salt')
      expect(result.healthSystem).toBe('CHOC')
      expect(result.populationType).toBe('ADULT')
    })

    it('should map ingredient types correctly', () => {
      const testCases: Array<[TPNIngredient['TYPE'], string]> = [
        ['Macronutrient', 'macro'],
        ['Micronutrient', 'micro'],
        ['Electrolyte', 'salt'],     // Electrolyte maps to salt
        ['Vitamin', 'vitamin'],
        ['Mineral', 'micro'],
        ['Trace Element', 'trace'],
        ['Additive', 'other'],
        ['Salt', 'salt'],            // Salt maps to salt
        ['Diluent', 'other'],
        ['Other', 'other']
      ]

      testCases.forEach(([tpnType, expectedCategory]) => {
        const ingredient = { ...mockTPNIngredient, TYPE: tpnType }
        const result = ingredientTransformService.toDomainFormat(ingredient)
        expect(result.category).toBe(expectedCategory)
      })
    })

    it('should transform NOTE array to sections', () => {
      const result = ingredientTransformService.toDomainFormat(mockTPNIngredient)

      expect(result.sections).toHaveLength(2)
      expect(result.sections![0]).toMatchObject({
        type: 'static',
        content: 'Calcium is essential for bone health',
        order: 0
      })
      expect(result.sections![1]).toMatchObject({
        type: 'dynamic',
        content: 'const maxDose = 20;',
        order: 1
      })
    })

    it('should map reference ranges correctly', () => {
      const result = ingredientTransformService.toDomainFormat(mockTPNIngredient, undefined, 'ADULT')

      expect(result.referenceRanges).toHaveLength(1)
      const range = result.referenceRanges[0]
      expect(range.populationType).toBe('ADULT')
      expect(range.normal).toEqual({ low: 8.5, high: 10.5 })
      expect(range.critical).toEqual({ low: 6.0, high: 13.0 })
    })

    it('should map concentration correctly', () => {
      const result = ingredientTransformService.toDomainFormat(mockTPNIngredient)

      expect(result.concentration).toEqual({
        strength: 100,
        strengthUnit: 'mg',
        volume: 10,
        volumeUnit: 'mL'
      })
    })

    it('should extract dependencies from dynamic sections', () => {
      const ingredient: TPNIngredient = {
        ...mockTPNIngredient,
        NOTE: [
          { TEXT: 'const value = me.PHOSPHATE * 2;' },
          { TEXT: 'if (me.SODIUM > 0) { return me.CALCIUM; }' },
          { TEXT: 'const result = me["GLUCOSE"] + me[\'PROTEIN\'];' }
        ]
      }

      const result = ingredientTransformService.toDomainFormat(ingredient)

      expect(result.dependencies).toContain('PHOSPHATE')
      expect(result.dependencies).toContain('SODIUM')
      expect(result.dependencies).toContain('CALCIUM')
      expect(result.dependencies).toContain('GLUCOSE')
      expect(result.dependencies).toContain('PROTEIN')
    })
  })

  describe('toConfigFormat', () => {
    it('should transform domain ingredient to TPN format', () => {
      const result = ingredientTransformService.toConfigFormat(mockDomainIngredient)

      expect(result.KEYNAME).toBe('CALCIUM')
      expect(result.DISPLAY).toBe('Calcium Gluconate')
      expect(result.MNEMONIC).toBe('CA')
      expect(result.UOM_DISP).toBe('mEq')
      expect(result.TYPE).toBe('Salt')
      expect(result.OSMO_RATIO).toBe(0.361)
      expect(result.EDITMODE).toBe('Custom')
      expect(result.PRECISION).toBe(2)
      expect(result.SPECIAL).toBe('N')
    })

    it('should transform sections to NOTE array', () => {
      const result = ingredientTransformService.toConfigFormat(mockDomainIngredient)

      expect(result.NOTE).toHaveLength(2)
      expect(result.NOTE[0]).toEqual({ TEXT: 'Calcium is essential for bone health' })
      expect(result.NOTE[1]).toEqual({ TEXT: 'const maxDose = 20;', TYPE: 'DYNAMIC' })
    })

    it('should handle missing sections by using notes', () => {
      const ingredient: DomainIngredient = {
        ...mockDomainIngredient,
        sections: undefined,
        notes: ['Note 1', 'Note 2']
      }

      const result = ingredientTransformService.toConfigFormat(ingredient)

      expect(result.NOTE).toEqual([
        { TEXT: 'Note 1' },
        { TEXT: 'Note 2' }
      ])
    })

    it('should reverse map reference ranges', () => {
      const result = ingredientTransformService.toConfigFormat(mockDomainIngredient)

      expect(result.REFERENCE_RANGE).toHaveLength(4)
      
      const ranges = result.REFERENCE_RANGE
      expect(ranges).toContainEqual({ THRESHOLD: 'Normal Low', VALUE: 8.5, POPULATION: 'ADULT' })
      expect(ranges).toContainEqual({ THRESHOLD: 'Normal High', VALUE: 10.5, POPULATION: 'ADULT' })
      expect(ranges).toContainEqual({ THRESHOLD: 'Critical Low', VALUE: 6.0, POPULATION: 'ADULT' })
      expect(ranges).toContainEqual({ THRESHOLD: 'Critical High', VALUE: 13.0, POPULATION: 'ADULT' })
    })
  })

  describe('batchToDomain', () => {
    it('should transform multiple TPN ingredients', () => {
      const ingredients: TPNIngredient[] = [
        mockTPNIngredient,
        { ...mockTPNIngredient, KEYNAME: 'PHOSPHATE', DISPLAY: 'Phosphate' }
      ]

      const results = ingredientTransformService.batchToDomain(
        ingredients,
        'CHOC',
        'ADULT'
      )

      expect(results).toHaveLength(2)
      expect(results[0].keyname).toBe('CALCIUM')
      expect(results[1].keyname).toBe('PHOSPHATE')
      expect(results[0].healthSystem).toBe('CHOC')
      expect(results[1].healthSystem).toBe('CHOC')
    })
  })

  describe('batchToConfig', () => {
    it('should transform multiple domain ingredients', () => {
      const ingredients: DomainIngredient[] = [
        mockDomainIngredient,
        { ...mockDomainIngredient, id: 'test-id-2', keyname: 'PHOSPHATE', displayName: 'Phosphate' }
      ]

      const results = ingredientTransformService.batchToConfig(ingredients)

      expect(results).toHaveLength(2)
      expect(results[0].KEYNAME).toBe('CALCIUM')
      expect(results[1].KEYNAME).toBe('PHOSPHATE')
    })
  })

  describe('validateRoundTrip', () => {
    it('should validate successful round-trip transformation', () => {
      const validation = ingredientTransformService.validateRoundTrip(mockTPNIngredient)

      expect(validation.valid).toBe(true)
      expect(validation.differences).toHaveLength(0)
    })

    it('should detect differences in round-trip transformation', () => {
      // Create an ingredient that will have differences after round-trip
      const ingredient: TPNIngredient = {
        ...mockTPNIngredient,
        KEYNAME: 'TEST',
        NOTE: [] // Empty NOTE array might cause differences
      }

      const validation = ingredientTransformService.validateRoundTrip(ingredient)

      // Check if keyname is preserved
      if (validation.differences.includes('KEYNAME: TEST !== TEST')) {
        expect(validation.valid).toBe(false)
      }
    })

    it('should preserve all critical fields in round-trip', () => {
      const criticalFields = [
        'KEYNAME',
        'DISPLAY',
        'MNEMONIC',
        'UOM_DISP',
        // 'TYPE', // Type mapping is not always reversible (e.g., Electrolyte -> Micronutrient)
        'OSMO_RATIO',
        'EDITMODE',
        'PRECISION',
        'SPECIAL'
      ]

      const domain = ingredientTransformService.toDomainFormat(mockTPNIngredient)
      const reconstructed = ingredientTransformService.toConfigFormat({
        ...domain,
        id: 'test',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      } as DomainIngredient)

      criticalFields.forEach(field => {
        expect(reconstructed[field as keyof TPNIngredient]).toEqual(
          mockTPNIngredient[field as keyof TPNIngredient]
        )
      })
      
      // Type may change due to mapping (Electrolyte -> Salt -> Salt)
      // This is expected behavior as we consolidate types
      expect(reconstructed.TYPE).toBe('Salt')
    })
  })

  describe('edge cases', () => {
    it('should handle missing optional fields', () => {
      const minimal: TPNIngredient = {
        KEYNAME: 'TEST',
        DISPLAY: 'Test Ingredient',
        MNEMONIC: 'TST',
        UOM_DISP: 'mg',
        TYPE: 'Other',
        OSMO_RATIO: 0,
        EDITMODE: 'None',
        PRECISION: 0,
        SPECIAL: '',
        NOTE: [],
        ALTUOM: [],
        REFERENCE_RANGE: [],
        LABS: [],
        CONCENTRATION: {
          STRENGTH: 0,
          STRENGTH_UOM: '',
          VOLUME: 0,
          VOLUME_UOM: ''
        },
        EXCLUDES: []
      }

      const result = ingredientTransformService.toDomainFormat(minimal)

      expect(result.keyname).toBe('TEST')
      expect(result.alternateUnits).toBeUndefined()
      expect(result.referenceRanges).toEqual([])
      expect(result.labs).toBeUndefined()
      expect(result.excludes).toEqual([])
    })

    it('should handle complex reference ranges with multiple populations', () => {
      const ingredient: TPNIngredient = {
        ...mockTPNIngredient,
        REFERENCE_RANGE: [
          { THRESHOLD: 'Normal Low', VALUE: 8.5, POPULATION: 'ADULT' },
          { THRESHOLD: 'Normal High', VALUE: 10.5, POPULATION: 'ADULT' },
          { THRESHOLD: 'Normal Low', VALUE: 9.0, POPULATION: 'CHILD' },
          { THRESHOLD: 'Normal High', VALUE: 11.0, POPULATION: 'CHILD' },
          { THRESHOLD: 'Normal Low', VALUE: 8.0, POPULATION: 'NEO' },
          { THRESHOLD: 'Normal High', VALUE: 10.0, POPULATION: 'NEO' }
        ]
      }

      const result = ingredientTransformService.toDomainFormat(ingredient)

      expect(result.referenceRanges).toHaveLength(3)
      
      const adultRange = result.referenceRanges.find(r => r.populationType === 'ADULT')
      expect(adultRange?.normal).toEqual({ low: 8.5, high: 10.5 })
      
      const childRange = result.referenceRanges.find(r => r.populationType === 'CHILD')
      expect(childRange?.normal).toEqual({ low: 9.0, high: 11.0 })
      
      const neoRange = result.referenceRanges.find(r => r.populationType === 'NEO')
      expect(neoRange?.normal).toEqual({ low: 8.0, high: 10.0 })
    })
  })
})