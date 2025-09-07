import { describe, it, expect } from 'vitest'
import { 
  validateImport, 
  detectDataType, 
  validateIngredients, 
  validateTPNConfig, 
  validateReference,
  validateFullTPNConfig,
  validatePopulationType,
  detectPopulationTypeFromFilename
} from './validator'
import type { TPNConfiguration } from '../types/schemas'

describe('validator', () => {
  describe('detectDataType', () => {
    it('should detect full TPN configuration', () => {
      const data = {
        INGREDIENT: [],
        FLEX: []
      }
      expect(detectDataType(data)).toBe('tpn-full')
    })
    
    it('should detect ingredients data type', () => {
      const data = {
        version: '1.0',
        ingredients: [
          { keyname: 'test', name: 'Test', type: 'basic' }
        ]
      }
      expect(detectDataType(data)).toBe('ingredients')
    })
    
    it('should detect TPN configuration data type', () => {
      const data = {
        version: '1.0',
        advisorType: 'ADULT',
        calculations: {},
        settings: {}
      }
      expect(detectDataType(data)).toBe('tpn')
    })
    
    it('should detect reference data type', () => {
      const data = {
        version: '1.0',
        reference: {
          name: 'Test Reference',
          sections: []
        }
      }
      expect(detectDataType(data)).toBe('reference')
    })
    
    it('should return unknown for unrecognized data', () => {
      const data = { random: 'data' }
      expect(detectDataType(data)).toBe('unknown')
    })
  })
  
  describe('validateImport', () => {
    it('should validate ingredients import', () => {
      const data = {
        version: '1.0',
        ingredients: [
          { keyname: 'sodium', name: 'Sodium', type: 'electrolyte' },
          { keyname: 'glucose', name: 'Glucose', type: 'macronutrient' }
        ]
      }
      
      const result = validateImport(data)
      expect(result.valid).toBe(true)
      expect(result.dataType).toBe('ingredients')
      expect(result.itemCount).toBe(2)
    })
    
    it('should validate TPN configuration', () => {
      const data = {
        version: '1.0',
        name: 'Adult TPN',
        advisorType: 'ADULT',
        ingredients: [],
        calculations: {
          totalVolume: 2000
        },
        settings: {
          units: 'metric'
        }
      }
      
      const result = validateImport(data)
      expect(result.valid).toBe(true)
      expect(result.dataType).toBe('tpn')
      expect(result.itemCount).toBe(1)
    })
    
    it('should validate reference import', () => {
      const data = {
        version: '1.0',
        reference: {
          name: 'Hospital Guidelines',
          healthSystem: 'General Hospital',
          sections: [
            { title: 'Section 1', content: 'Content' }
          ]
        }
      }
      
      const result = validateImport(data)
      expect(result.valid).toBe(true)
      expect(result.dataType).toBe('reference')
      expect(result.itemCount).toBe(1)
    })
    
    it('should reject invalid JSON structure', () => {
      const data = null
      const result = validateImport(data)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid data')
    })
    
    it('should reject unknown data format', () => {
      const data = { random: 'data', without: 'known structure' }
      const result = validateImport(data)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Unknown data format')
    })
  })
  
  describe('validateIngredients', () => {
    it('should validate valid ingredients array', () => {
      const data = {
        version: '1.0',
        ingredients: [
          { keyname: 'sodium', name: 'Sodium', type: 'electrolyte' },
          { keyname: 'glucose', name: 'Glucose', type: 'macronutrient' }
        ]
      }
      
      const result = validateIngredients(data)
      expect(result.valid).toBe(true)
      expect(result.itemCount).toBe(2)
    })
    
    it('should reject ingredients without required fields', () => {
      const data = {
        version: '1.0',
        ingredients: [
          { name: 'Sodium' } // missing keyname and type
        ]
      }
      
      const result = validateIngredients(data)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid ingredient')
    })
    
    it('should reject non-array ingredients', () => {
      const data = {
        version: '1.0',
        ingredients: 'not an array'
      }
      
      const result = validateIngredients(data)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('must be an array')
    })
    
    it('should handle empty ingredients array', () => {
      const data = {
        version: '1.0',
        ingredients: []
      }
      
      const result = validateIngredients(data)
      expect(result.valid).toBe(true)
      expect(result.itemCount).toBe(0)
    })
    
    it('should validate ingredients with reference ranges', () => {
      const data = {
        version: '1.0',
        ingredients: [
          {
            keyname: 'sodium',
            name: 'Sodium',
            type: 'electrolyte',
            referenceRanges: [
              { min: 135, max: 145, unit: 'mEq/L' }
            ]
          }
        ]
      }
      
      const result = validateIngredients(data)
      expect(result.valid).toBe(true)
      expect(result.itemCount).toBe(1)
    })
  })
  
  describe('validateTPNConfig', () => {
    it('should validate valid TPN configuration', () => {
      const data = {
        version: '1.0',
        name: 'Adult TPN',
        advisorType: 'ADULT',
        ingredients: [],
        calculations: {},
        settings: {}
      }
      
      const result = validateTPNConfig(data)
      expect(result.valid).toBe(true)
    })
    
    it('should validate all advisor types', () => {
      const advisorTypes = ['NEO', 'CHILD', 'ADOLESCENT', 'ADULT']
      
      advisorTypes.forEach(type => {
        const data = {
          version: '1.0',
          name: `${type} TPN`,
          advisorType: type,
          ingredients: [],
          calculations: {},
          settings: {}
        }
        
        const result = validateTPNConfig(data)
        expect(result.valid).toBe(true)
      })
    })
    
    it('should reject invalid advisor type', () => {
      const data = {
        version: '1.0',
        name: 'Invalid TPN',
        advisorType: 'INVALID',
        ingredients: [],
        calculations: {},
        settings: {}
      }
      
      const result = validateTPNConfig(data)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid advisor type')
    })
    
    it('should reject TPN config without required fields', () => {
      const data = {
        version: '1.0',
        name: 'Incomplete TPN'
        // missing advisorType and calculations
      }
      
      const result = validateTPNConfig(data)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Missing required fields')
    })
  })
  
  describe('validateReference', () => {
    it('should validate valid reference import', () => {
      const data = {
        version: '1.0',
        reference: {
          name: 'Hospital Guidelines',
          healthSystem: 'General Hospital',
          sections: [
            { title: 'Introduction', content: 'Content here' },
            { title: 'Guidelines', content: 'More content' }
          ]
        }
      }
      
      const result = validateReference(data)
      expect(result.valid).toBe(true)
      expect(result.itemCount).toBe(2) // count sections
    })
    
    it('should validate reference without health system', () => {
      const data = {
        version: '1.0',
        reference: {
          name: 'Basic Guidelines',
          sections: [
            { title: 'Section 1', content: 'Content' }
          ]
        }
      }
      
      const result = validateReference(data)
      expect(result.valid).toBe(true)
    })
    
    it('should reject reference without name', () => {
      const data = {
        version: '1.0',
        reference: {
          sections: []
        }
      }
      
      const result = validateReference(data)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Reference must have a name')
    })
    
    it('should reject reference without sections', () => {
      const data = {
        version: '1.0',
        reference: {
          name: 'Guidelines'
          // missing sections
        }
      }
      
      const result = validateReference(data)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Reference must have sections')
    })
    
    it('should reject invalid section structure', () => {
      const data = {
        version: '1.0',
        reference: {
          name: 'Guidelines',
          sections: [
            { content: 'Missing title' }
          ]
        }
      }
      
      const result = validateReference(data)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid section')
    })
  })

  describe('validateFullTPNConfig', () => {
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
      ],
      FLEX: [
        {
          NAME: 'MAX_DEXTROSE_RATE',
          VALUE: '12',
          CONFIG_COMMENT: 'Maximum dextrose infusion rate',
          ALT_VALUE: [
            { CHECKTYPE: 'population', CHECKMATCH: 'NEO', OVERRIDE_VALUE: '10' }
          ]
        }
      ],
      populationType: 'NEO'
    }

    it('should validate a correct TPN configuration', () => {
      const result = validateFullTPNConfig(validConfig)
      expect(result.valid).toBe(true)
      expect(result.dataType).toBe('tpn-full')
      expect(result.itemCount).toBe(1)
      expect(result.populationType).toBe('NEO')
    })

    it('should detect duplicate KEYNAME', () => {
      const configWithDuplicate = {
        ...validConfig,
        INGREDIENT: [
          ...validConfig.INGREDIENT,
          { ...validConfig.INGREDIENT[0], DISPLAY: 'Dextrose 2' }
        ]
      }
      const result = validateFullTPNConfig(configWithDuplicate)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Duplicate KEYNAME at ingredient 1: dextrose')
    })

    it('should validate PRECISION range', () => {
      const invalidConfig = {
        ...validConfig,
        INGREDIENT: [
          { ...validConfig.INGREDIENT[0], PRECISION: 11 }
        ]
      }
      const result = validateFullTPNConfig(invalidConfig)
      expect(result.valid).toBe(false)
      expect(result.errors?.[0]).toContain('Invalid PRECISION')
    })
  })

  describe('validatePopulationType', () => {
    it('should validate correct population types', () => {
      expect(validatePopulationType('NEO').valid).toBe(true)
      expect(validatePopulationType('CHILD').valid).toBe(true)
      expect(validatePopulationType('ADOLESCENT').valid).toBe(true)
      expect(validatePopulationType('ADULT').valid).toBe(true)
    })

    it('should reject invalid population types', () => {
      const result = validatePopulationType('INVALID')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid population type')
    })
  })

  describe('detectPopulationTypeFromFilename', () => {
    it('should detect NEO from filename', () => {
      expect(detectPopulationTypeFromFilename('neo-cert-east-uhs.json')).toBe('NEO')
    })

    it('should detect CHILD from filename', () => {
      expect(detectPopulationTypeFromFilename('child-build-main-choc.json')).toBe('CHILD')
    })

    it('should detect ADULT from filename', () => {
      expect(detectPopulationTypeFromFilename('adult-cert-west-memorial.json')).toBe('ADULT')
    })

    it('should return null for undetectable population type', () => {
      expect(detectPopulationTypeFromFilename('config.json')).toBeNull()
    })
  })
})