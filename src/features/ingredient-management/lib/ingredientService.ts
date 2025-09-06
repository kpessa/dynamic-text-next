import { ingredientService as baseService } from '@/entities/ingredient/model/ingredientService'
import type { 
  Ingredient, 
  IngredientFilter, 
  IngredientValidationRules,
  PopulationType,
  IngredientType
} from '@/entities/ingredient/types'
import { ServiceResult } from '@/shared/api/firestore/baseService'

// Default validation rules
const defaultValidationRules: IngredientValidationRules = {
  keynameRequired: true,
  displayNameRequired: true,
  unitRequired: true,
  keynameUnique: true,
  referenceRangesRequired: false,
  concentrationRequired: false
}

export class EnhancedIngredientService {
  private validationRules: IngredientValidationRules

  constructor(rules: Partial<IngredientValidationRules> = {}) {
    this.validationRules = { ...defaultValidationRules, ...rules }
  }

  // Validate a single ingredient
  async validateIngredient(
    ingredient: Partial<Ingredient>,
    checkUniqueness = true
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Required field validation
    if (this.validationRules.keynameRequired && !ingredient.keyname) {
      errors.push('Keyname is required')
    }

    if (this.validationRules.displayNameRequired && !ingredient.displayName) {
      errors.push('Display name is required')
    }

    if (this.validationRules.unitRequired && !ingredient.unit) {
      errors.push('Unit is required')
    }

    // Keyname uniqueness check
    if (checkUniqueness && this.validationRules.keynameUnique && ingredient.keyname) {
      const exists = await baseService.keynameExists(
        ingredient.keyname,
        ingredient.healthSystem
      )
      if (exists) {
        errors.push(`Keyname "${ingredient.keyname}" already exists`)
      }
    }

    // Reference ranges validation
    if (this.validationRules.referenceRangesRequired) {
      if (!ingredient.referenceRanges || ingredient.referenceRanges.length === 0) {
        errors.push('At least one reference range is required')
      } else {
        // Validate each reference range
        ingredient.referenceRanges.forEach((range, index) => {
          if (!range.populationType) {
            errors.push(`Reference range ${index + 1} missing population type`)
          }
          if (!range.unit) {
            errors.push(`Reference range ${index + 1} missing unit`)
          }
          
          // Validate threshold values are logical
          if (range.critical && range.normal) {
            if (range.critical.low > range.normal.low) {
              errors.push(`Reference range ${index + 1}: Critical low cannot be higher than normal low`)
            }
            if (range.critical.high < range.normal.high) {
              errors.push(`Reference range ${index + 1}: Critical high cannot be lower than normal high`)
            }
          }
        })
      }
    }

    // Concentration validation
    if (this.validationRules.concentrationRequired && !ingredient.concentration) {
      errors.push('Concentration is required')
    } else if (ingredient.concentration) {
      if (!ingredient.concentration.strength || ingredient.concentration.strength <= 0) {
        errors.push('Concentration strength must be greater than 0')
      }
      if (!ingredient.concentration.strengthUnit) {
        errors.push('Concentration strength unit is required')
      }
      if (!ingredient.concentration.volume || ingredient.concentration.volume <= 0) {
        errors.push('Concentration volume must be greater than 0')
      }
      if (!ingredient.concentration.volumeUnit) {
        errors.push('Concentration volume unit is required')
      }
    }

    // Validate precision
    if (ingredient.precision !== undefined && ingredient.precision < 0) {
      errors.push('Precision cannot be negative')
    }

    // Validate osmolality ratio
    if (ingredient.osmolalityRatio !== undefined && ingredient.osmolalityRatio < 0) {
      errors.push('Osmolality ratio cannot be negative')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Create ingredient with validation
  async createWithValidation(
    ingredient: Omit<Ingredient, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ServiceResult<Ingredient>> {
    const validation = await this.validateIngredient(ingredient)
    
    if (!validation.valid) {
      return {
        error: {
          code: 'validation-failed',
          message: validation.errors.join('; ')
        }
      }
    }

    const now = new Date().toISOString()
    const ingredientWithTimestamps = {
      ...ingredient,
      createdAt: now,
      updatedAt: now,
      version: '1.0.0'
    }

    return baseService.create(ingredientWithTimestamps)
  }

  // Update ingredient with validation
  async updateWithValidation(
    id: string,
    updates: Partial<Ingredient>
  ): Promise<ServiceResult<Ingredient>> {
    // Get existing ingredient first
    const existing = await baseService.getById(id)
    if (!existing.data) {
      return { 
        error: {
          code: 'not-found',
          message: 'Ingredient not found'
        }
      }
    }

    // Merge with existing data for validation
    const merged = { ...existing.data, ...updates }
    
    // Don't check uniqueness if keyname hasn't changed
    const checkUniqueness = !!(updates.keyname && updates.keyname !== existing.data.keyname)
    
    const validation = await this.validateIngredient(merged, checkUniqueness)
    
    if (!validation.valid) {
      return {
        error: {
          code: 'validation-failed',
          message: validation.errors.join('; ')
        }
      }
    }

    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return baseService.update(id, updatesWithTimestamp)
  }

  // Advanced search with filters
  async searchWithFilters(filter: IngredientFilter): Promise<ServiceResult<Ingredient[]>> {
    try {
      // Start with all ingredients
      let result = await baseService.getAll()
      
      if (!result.data) {
        return { data: [] }
      }

      let filtered = result.data

      // Apply search term filter
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase()
        filtered = filtered.filter(i => 
          i.keyname.toLowerCase().includes(term) ||
          i.displayName.toLowerCase().includes(term) ||
          i.mnemonic?.toLowerCase().includes(term)
        )
      }

      // Apply type filter
      if (filter.types && filter.types.length > 0) {
        filtered = filtered.filter(i => i.type && filter.types!.includes(i.type))
      }

      // Apply category filter
      if (filter.categories && filter.categories.length > 0) {
        filtered = filtered.filter(i => filter.categories!.includes(i.category))
      }

      // Apply population filter
      if (filter.populations && filter.populations.length > 0) {
        filtered = filtered.filter(i => 
          i.referenceRanges.some(r => filter.populations!.includes(r.populationType))
        )
      }

      // Apply reference ranges filter
      if (filter.hasReferenceRanges !== undefined) {
        filtered = filtered.filter(i => 
          filter.hasReferenceRanges ? i.referenceRanges.length > 0 : i.referenceRanges.length === 0
        )
      }

      // Apply shared filter
      if (filter.isShared !== undefined) {
        filtered = filtered.filter(i => i.isShared === filter.isShared)
      }

      // Apply health system filter
      if (filter.healthSystem) {
        filtered = filtered.filter(i => i.healthSystem === filter.healthSystem)
      }

      // Apply modified after filter
      if (filter.modifiedAfter) {
        const cutoffDate = filter.modifiedAfter.toISOString()
        filtered = filtered.filter(i => i.updatedAt > cutoffDate)
      }

      return { data: filtered }
    } catch (error) {
      return {
        error: {
          code: 'search-failed',
          message: error instanceof Error ? error.message : 'Search failed'
        }
      }
    }
  }

  // Get ingredients by type
  async getByType(type: IngredientType): Promise<ServiceResult<Ingredient[]>> {
    const result = await baseService.getAll()
    if (!result.data) {
      return { data: [] }
    }
    
    const filtered = result.data.filter(i => i.type === type)
    return { data: filtered }
  }

  // Get ingredients for specific population
  async getForPopulation(population: PopulationType): Promise<ServiceResult<Ingredient[]>> {
    const result = await baseService.getAll()
    if (!result.data) {
      return { data: [] }
    }
    
    const filtered = result.data.filter(i => 
      i.referenceRanges.some(r => r.populationType === population)
    )
    return { data: filtered }
  }

  // Clone an ingredient
  async cloneIngredient(
    id: string,
    overrides: Partial<Ingredient> = {}
  ): Promise<ServiceResult<Ingredient>> {
    const existing = await baseService.getById(id)
    if (!existing.data) {
      return { 
        error: {
          code: 'not-found',
          message: 'Source ingredient not found'
        }
      }
    }

    const cloned = {
      ...existing.data,
      ...overrides,
      keyname: overrides.keyname || `${existing.data.keyname}_COPY`,
      displayName: overrides.displayName || `${existing.data.displayName} (Copy)`,
      isShared: false // Clones start as not shared
    }

    // Remove id to create new
    const { id: _, ...ingredientData } = cloned

    return this.createWithValidation(ingredientData)
  }

  // Validate multiple ingredients (for import)
  async validateBatch(
    ingredients: Array<Partial<Ingredient>>
  ): Promise<{ 
    valid: boolean; 
    results: Array<{ index: number; valid: boolean; errors: string[] }> 
  }> {
    const results = await Promise.all(
      ingredients.map(async (ingredient, index) => {
        const validation = await this.validateIngredient(ingredient)
        return { index, ...validation }
      })
    )

    const allValid = results.every(r => r.valid)
    return { valid: allValid, results }
  }
}

// Export singleton instance
export const enhancedIngredientService = new EnhancedIngredientService()