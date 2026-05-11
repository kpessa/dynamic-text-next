/**
 * Service for extracting and processing ingredients from TPN configurations
 * Handles deduplication, validation, and transformation
 */

import type { 
  TPNConfiguration, 
  Ingredient as TPNIngredient,
  PopulationType as TPNPopulationType 
} from '../types/schemas'
import type { Ingredient as DomainIngredient, PopulationType } from '@/entities/ingredient/types'
import { ingredientTransformService } from './ingredientTransformService'
import { ingredientService } from '@/entities/ingredient/model/ingredientService'

export interface ExtractedIngredient {
  /** Original TPN format ingredient */
  original: TPNIngredient
  
  /** Transformed domain format */
  domain: Omit<DomainIngredient, 'id' | 'createdAt' | 'updatedAt'>
  
  /** Unique identifier for deduplication */
  uniqueKey: string
  
  /** Whether this ingredient already exists */
  exists?: boolean
  
  /** ID of existing ingredient if found */
  existingId?: string
}

export interface ExtractionResult {
  /** Successfully extracted ingredients */
  ingredients: ExtractedIngredient[]
  
  /** Total count in original config */
  totalCount: number
  
  /** Number of unique ingredients */
  uniqueCount: number
  
  /** Number of duplicates found within the config */
  internalDuplicates: number
  
  /** Number that already exist in database */
  existingCount: number
  
  /** Health system from config */
  healthSystem?: string
  
  /** Population type from config */
  populationType?: PopulationType
  
  /** Any errors encountered */
  errors: Array<{
    ingredient: string
    error: string
  }>
}

export interface ExtractionOptions {
  /** Health system to assign to ingredients */
  healthSystem?: string
  
  /** Population type to assign */
  populationType?: PopulationType
  
  /** Whether to check for existing ingredients in database */
  checkExisting?: boolean
  
  /** Whether to skip invalid ingredients */
  skipInvalid?: boolean
  
  /** Custom deduplication key generator */
  keyGenerator?: (ingredient: TPNIngredient) => string
}

export class IngredientExtractionService {
  /**
   * Extract ingredients from a TPN configuration
   * @param config - TPN configuration object
   * @param options - Extraction options
   * @returns Extraction result with processed ingredients
   */
  async extractFromConfig(
    config: TPNConfiguration,
    options: ExtractionOptions = {}
  ): Promise<ExtractionResult> {
    const result: ExtractionResult = {
      ingredients: [],
      totalCount: 0,
      uniqueCount: 0,
      internalDuplicates: 0,
      existingCount: 0,
      healthSystem: options.healthSystem || config.healthSystem,
      populationType: options.populationType || config.populationType,
      errors: []
    }

    // Validate config has ingredients
    if (!config.INGREDIENT || !Array.isArray(config.INGREDIENT)) {
      result.errors.push({
        ingredient: 'CONFIG',
        error: 'No INGREDIENT array found in configuration'
      })
      return result
    }

    result.totalCount = config.INGREDIENT.length

    // Process each ingredient
    const uniqueMap = new Map<string, ExtractedIngredient>()
    
    for (const tpnIngredient of config.INGREDIENT) {
      try {
        // Validate ingredient has required fields
        if (!tpnIngredient.KEYNAME) {
          result.errors.push({
            ingredient: 'UNKNOWN',
            error: 'Ingredient missing KEYNAME'
          })
          if (!options.skipInvalid) continue
        }

        // Generate unique key for deduplication
        const uniqueKey = options.keyGenerator ? 
          options.keyGenerator(tpnIngredient) :
          this.generateUniqueKey(tpnIngredient, result.healthSystem)

        // Check for internal duplicates
        if (uniqueMap.has(uniqueKey)) {
          result.internalDuplicates++
          continue
        }

        // Transform to domain format
        const domainIngredient = ingredientTransformService.toDomainFormat(
          tpnIngredient,
          result.healthSystem,
          result.populationType
        )

        const extracted: ExtractedIngredient = {
          original: tpnIngredient,
          domain: domainIngredient,
          uniqueKey
        }

        // Check if ingredient exists in database
        if (options.checkExisting) {
          const exists = await this.checkExistingIngredient(
            tpnIngredient.KEYNAME,
            result.healthSystem
          )
          
          if (exists.found) {
            extracted.exists = true
            extracted.existingId = exists.id
            result.existingCount++
          }
        }

        uniqueMap.set(uniqueKey, extracted)
      } catch (error) {
        result.errors.push({
          ingredient: tpnIngredient.KEYNAME || 'UNKNOWN',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        if (!options.skipInvalid) {
          throw error
        }
      }
    }

    result.ingredients = Array.from(uniqueMap.values())
    result.uniqueCount = result.ingredients.length

    return result
  }

  /**
   * Extract ingredients from multiple configurations
   * @param configs - Array of TPN configurations
   * @param options - Extraction options
   * @returns Combined extraction result
   */
  async extractFromMultipleConfigs(
    configs: TPNConfiguration[],
    options: ExtractionOptions = {}
  ): Promise<ExtractionResult> {
    const combinedResult: ExtractionResult = {
      ingredients: [],
      totalCount: 0,
      uniqueCount: 0,
      internalDuplicates: 0,
      existingCount: 0,
      errors: []
    }

    const globalUniqueMap = new Map<string, ExtractedIngredient>()

    for (const config of configs) {
      const result = await this.extractFromConfig(config, options)
      
      combinedResult.totalCount += result.totalCount
      combinedResult.errors.push(...result.errors)

      // Merge ingredients, checking for cross-config duplicates
      for (const ingredient of result.ingredients) {
        if (globalUniqueMap.has(ingredient.uniqueKey)) {
          combinedResult.internalDuplicates++
        } else {
          globalUniqueMap.set(ingredient.uniqueKey, ingredient)
          if (ingredient.exists) {
            combinedResult.existingCount++
          }
        }
      }
    }

    combinedResult.ingredients = Array.from(globalUniqueMap.values())
    combinedResult.uniqueCount = combinedResult.ingredients.length

    return combinedResult
  }

  /**
   * Generate a unique key for ingredient deduplication
   * @param ingredient - TPN ingredient
   * @param healthSystem - Optional health system for namespacing
   * @returns Unique key string
   */
  private generateUniqueKey(
    ingredient: TPNIngredient,
    healthSystem?: string
  ): string {
    // Combine keyname with health system for uniqueness
    const parts = [ingredient.KEYNAME]
    
    if (healthSystem) {
      parts.push(healthSystem)
    }
    
    // Include type for further differentiation if needed
    if (ingredient.TYPE) {
      parts.push(ingredient.TYPE)
    }

    return parts.join('::').toLowerCase()
  }

  /**
   * Check if an ingredient already exists in the database
   * @param keyname - Ingredient keyname
   * @param healthSystem - Optional health system
   * @returns Whether ingredient exists and its ID
   */
  private async checkExistingIngredient(
    keyname: string,
    healthSystem?: string
  ): Promise<{ found: boolean; id?: string }> {
    try {
      const exists = await ingredientService.keynameExists(keyname, healthSystem)
      
      if (exists) {
        // Try to get the actual ingredient to return its ID
        const result = healthSystem ? 
          await ingredientService.getByHealthSystem(healthSystem) :
          await ingredientService.getAll()
        
        if (result.data) {
          const found = result.data.find(ing => ing.keyname === keyname)
          if (found) {
            return { found: true, id: found.id }
          }
        }
      }
      
      return { found: false }
    } catch (error) {
      console.error('Error checking existing ingredient:', error)
      return { found: false }
    }
  }

  /**
   * Group extracted ingredients by category
   * @param ingredients - Extracted ingredients
   * @returns Grouped ingredients
   */
  groupByCategory(ingredients: ExtractedIngredient[]): Record<string, ExtractedIngredient[]> {
    const grouped: Record<string, ExtractedIngredient[]> = {}
    
    for (const ingredient of ingredients) {
      const category = ingredient.domain.category || 'other'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(ingredient)
    }
    
    return grouped
  }

  /**
   * Group extracted ingredients by type
   * @param ingredients - Extracted ingredients
   * @returns Grouped ingredients
   */
  groupByType(ingredients: ExtractedIngredient[]): Record<string, ExtractedIngredient[]> {
    const grouped: Record<string, ExtractedIngredient[]> = {}
    
    for (const ingredient of ingredients) {
      const type = ingredient.original.TYPE || 'Other'
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(ingredient)
    }
    
    return grouped
  }

  /**
   * Filter ingredients that need to be created (don't exist yet)
   * @param ingredients - Extracted ingredients
   * @returns Ingredients that need creation
   */
  filterNewIngredients(ingredients: ExtractedIngredient[]): ExtractedIngredient[] {
    return ingredients.filter(ing => !ing.exists)
  }

  /**
   * Filter ingredients that already exist
   * @param ingredients - Extracted ingredients  
   * @returns Existing ingredients
   */
  filterExistingIngredients(ingredients: ExtractedIngredient[]): ExtractedIngredient[] {
    return ingredients.filter(ing => ing.exists)
  }

  /**
   * Get summary statistics for extraction
   * @param result - Extraction result
   * @returns Summary statistics
   */
  getSummaryStats(result: ExtractionResult): {
    totalIngredients: number
    uniqueIngredients: number
    duplicatesFound: number
    existingIngredients: number
    newIngredients: number
    errorCount: number
    successRate: number
    categories: Record<string, number>
    types: Record<string, number>
  } {
    const categoryCounts: Record<string, number> = {}
    const typeCounts: Record<string, number> = {}
    
    for (const ingredient of result.ingredients) {
      // Count by category
      const category = ingredient.domain.category || 'other'
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
      
      // Count by type
      const type = ingredient.original.TYPE || 'Other'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    }
    
    const successfulExtractions = result.totalCount - result.errors.length
    const successRate = result.totalCount > 0 ? 
      (successfulExtractions / result.totalCount) * 100 : 0
    
    return {
      totalIngredients: result.totalCount,
      uniqueIngredients: result.uniqueCount,
      duplicatesFound: result.internalDuplicates,
      existingIngredients: result.existingCount,
      newIngredients: result.uniqueCount - result.existingCount,
      errorCount: result.errors.length,
      successRate: Math.round(successRate),
      categories: categoryCounts,
      types: typeCounts
    }
  }

  /**
   * Validate extraction result
   * @param result - Extraction result
   * @returns Validation status and issues
   */
  validateExtraction(result: ExtractionResult): {
    valid: boolean
    issues: string[]
    warnings: string[]
  } {
    const issues: string[] = []
    const warnings: string[] = []
    
    // Check for critical issues
    if (result.ingredients.length === 0 && result.totalCount > 0) {
      issues.push('No ingredients were successfully extracted')
    }
    
    if (result.errors.length > result.totalCount * 0.5) {
      issues.push('More than 50% of ingredients failed to extract')
    }
    
    // Check for warnings
    if (result.internalDuplicates > 0) {
      warnings.push(`Found ${result.internalDuplicates} duplicate ingredients in configuration`)
    }
    
    if (result.existingCount > result.uniqueCount * 0.8) {
      warnings.push('More than 80% of ingredients already exist')
    }
    
    if (!result.healthSystem) {
      warnings.push('No health system specified for ingredients')
    }
    
    if (!result.populationType) {
      warnings.push('No population type specified for ingredients')
    }
    
    return {
      valid: issues.length === 0,
      issues,
      warnings
    }
  }
}

// Export singleton instance
export const ingredientExtractionService = new IngredientExtractionService()