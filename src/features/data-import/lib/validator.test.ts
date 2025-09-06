import { describe, it, expect } from 'vitest'
import { validateImport, detectDataType, validateIngredients, validateTPNConfig, validateReference } from './validator'

describe('validator', () => {
  describe('detectDataType', () => {
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
})