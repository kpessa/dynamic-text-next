import { describe, it, expect } from 'vitest'
import {
  isIngredientType,
  isEditMode,
  isThresholdType,
  isPopulationType,
  isTPNConfiguration,
  isValidIngredient,
  isValidFlexConfig,
  type Ingredient,
  type FlexConfig,
  type TPNConfiguration
} from './schemas'

describe('Schema Type Guards', () => {
  describe('isIngredientType', () => {
    it('should validate correct ingredient types', () => {
      expect(isIngredientType('Macronutrient')).toBe(true)
      expect(isIngredientType('Electrolyte')).toBe(true)
      expect(isIngredientType('Mineral')).toBe(true)
      expect(isIngredientType('Vitamin')).toBe(true)
      expect(isIngredientType('Trace Element')).toBe(true)
      expect(isIngredientType('Other')).toBe(true)
    })

    it('should reject invalid ingredient types', () => {
      expect(isIngredientType('Invalid')).toBe(false)
      expect(isIngredientType(123)).toBe(false)
      expect(isIngredientType(null)).toBe(false)
      expect(isIngredientType(undefined)).toBe(false)
    })
  })

  describe('isEditMode', () => {
    it('should validate correct edit modes', () => {
      expect(isEditMode('Custom')).toBe(true)
      expect(isEditMode('Standard')).toBe(true)
      expect(isEditMode('ReadOnly')).toBe(true)
    })

    it('should reject invalid edit modes', () => {
      expect(isEditMode('Invalid')).toBe(false)
      expect(isEditMode(123)).toBe(false)
    })
  })

  describe('isThresholdType', () => {
    it('should validate correct threshold types', () => {
      expect(isThresholdType('Feasible Low')).toBe(true)
      expect(isThresholdType('Critical Low')).toBe(true)
      expect(isThresholdType('Normal Low')).toBe(true)
      expect(isThresholdType('Normal High')).toBe(true)
      expect(isThresholdType('Critical High')).toBe(true)
      expect(isThresholdType('Feasible High')).toBe(true)
    })

    it('should reject invalid threshold types', () => {
      expect(isThresholdType('Invalid')).toBe(false)
      expect(isThresholdType(123)).toBe(false)
    })
  })

  describe('isPopulationType', () => {
    it('should validate correct population types', () => {
      expect(isPopulationType('NEO')).toBe(true)
      expect(isPopulationType('CHILD')).toBe(true)
      expect(isPopulationType('ADOLESCENT')).toBe(true)
      expect(isPopulationType('ADULT')).toBe(true)
    })

    it('should reject invalid population types', () => {
      expect(isPopulationType('INVALID')).toBe(false)
      expect(isPopulationType(123)).toBe(false)
    })
  })

  describe('isValidIngredient', () => {
    const validIngredient: Ingredient = {
      KEYNAME: 'dextrose',
      DISPLAY: 'Dextrose',
      MNEMONIC: 'DEX',
      UOM_DISP: 'g/kg/day',
      TYPE: 'Macronutrient',
      OSMO_RATIO: 5.5,
      EDITMODE: 'Custom',
      PRECISION: 1,
      SPECIAL: '',
      NOTE: [{ TEXT: 'Primary energy source' }],
      ALTUOM: [{ NAME: 'mg/kg/min', UOM_DISP: 'mg/kg/min' }],
      REFERENCE_RANGE: [
        { THRESHOLD: 'Normal Low', VALUE: 4.0 },
        { THRESHOLD: 'Normal High', VALUE: 18.0 }
      ],
      LABS: [],
      CONCENTRATION: { STRENGTH: 50, STRENGTH_UOM: 'g', VOLUME: 100, VOLUME_UOM: 'mL' },
      EXCLUDES: []
    }

    it('should validate a correct ingredient', () => {
      expect(isValidIngredient(validIngredient)).toBe(true)
    })

    it('should reject invalid ingredients', () => {
      expect(isValidIngredient({})).toBe(false)
      expect(isValidIngredient(null)).toBe(false)
      expect(isValidIngredient(undefined)).toBe(false)
      
      const invalidIngredient = { ...validIngredient, TYPE: 'InvalidType' }
      expect(isValidIngredient(invalidIngredient)).toBe(false)
    })
  })

  describe('isValidFlexConfig', () => {
    const validFlex: FlexConfig = {
      NAME: 'MAX_DEXTROSE_RATE',
      VALUE: '12',
      CONFIG_COMMENT: 'Maximum dextrose infusion rate',
      ALT_VALUE: [
        { CHECKTYPE: 'population', CHECKMATCH: 'NEO', OVERRIDE_VALUE: '10' }
      ]
    }

    it('should validate a correct flex config', () => {
      expect(isValidFlexConfig(validFlex)).toBe(true)
    })

    it('should validate flex config without optional fields', () => {
      const minimalFlex = { NAME: 'TEST', VALUE: '10' }
      expect(isValidFlexConfig(minimalFlex)).toBe(true)
    })

    it('should reject invalid flex configs', () => {
      expect(isValidFlexConfig({})).toBe(false)
      expect(isValidFlexConfig(null)).toBe(false)
      expect(isValidFlexConfig({ NAME: 'TEST' })).toBe(false)
    })
  })

  describe('isTPNConfiguration', () => {
    const validConfig: TPNConfiguration = {
      INGREDIENT: [
        {
          KEYNAME: 'dextrose',
          DISPLAY: 'Dextrose',
          MNEMONIC: 'DEX',
          UOM_DISP: 'g/kg/day',
          TYPE: 'Macronutrient',
          OSMO_RATIO: 5.5,
          EDITMODE: 'Custom',
          PRECISION: 1,
          SPECIAL: '',
          NOTE: [],
          ALTUOM: [],
          REFERENCE_RANGE: [],
          LABS: [],
          CONCENTRATION: { STRENGTH: 50, STRENGTH_UOM: 'g', VOLUME: 100, VOLUME_UOM: 'mL' },
          EXCLUDES: []
        }
      ],
      FLEX: [
        { NAME: 'MAX_DEXTROSE_RATE', VALUE: '12' }
      ]
    }

    it('should validate a correct TPN configuration', () => {
      expect(isTPNConfiguration(validConfig)).toBe(true)
    })

    it('should reject invalid configurations', () => {
      expect(isTPNConfiguration({})).toBe(false)
      expect(isTPNConfiguration(null)).toBe(false)
      expect(isTPNConfiguration({ INGREDIENT: [], FLEX: null })).toBe(false)
    })
  })
})