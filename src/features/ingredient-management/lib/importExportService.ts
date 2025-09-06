import type { 
  Ingredient, 
  IngredientExport,
  PopulationType,
  IngredientType,
  IngredientCategory,
  ThresholdType,
  Concentration
} from '@/entities/ingredient/types'
import { enhancedIngredientService } from './ingredientService'
import { referenceRangeService } from './referenceRangeService'
import { ingredientService } from '@/entities/ingredient/model/ingredientService'

// Parent project ingredient format (from dynamic-text)
interface ParentIngredient {
  KEYNAME: string
  DISPLAY: string
  MNEMONIC: string
  UOM_DISP: string
  TYPE: 'Macronutrient' | 'Micronutrient' | 'Additive' | 'Salt' | 'Diluent' | 'Other'
  OSMO_RATIO: number
  EDITMODE: 'None' | 'Custom'
  PRECISION: number
  SPECIAL?: string
  NOTE?: Array<{ TEXT: string }>
  ALTUOM?: Array<{ NAME: string; UOM_DISP: string }>
  REFERENCE_RANGE?: Array<{
    THRESHOLD: ThresholdType
    VALUE: number
  }>
  LABS?: Array<{
    DISPLAY: string
    EVENT_SET_NAME: string
    GRAPH: 0 | 1
  }>
  CONCENTRATION?: {
    STRENGTH: number
    STRENGTH_UOM: string
    VOLUME: number
    VOLUME_UOM: string
  }
  EXCLUDES?: Array<{ keyname: string }>
}

export class ImportExportService {
  // Export ingredients to JSON format
  async exportIngredients(
    ingredientIds?: string[],
    format: 'native' | 'parent' = 'native'
  ): Promise<IngredientExport> {
    let ingredients: Ingredient[] = []

    if (ingredientIds && ingredientIds.length > 0) {
      // Export specific ingredients
      const results = await Promise.all(
        ingredientIds.map(id => ingredientService.getById(id))
      )
      ingredients = results
        .filter(r => r.data !== undefined)
        .map(r => r.data!)
    } else {
      // Export all ingredients
      const result = await ingredientService.getAll()
      ingredients = result.data || []
    }

    if (format === 'parent') {
      // Convert to parent project format
      const parentIngredients = ingredients.map(i => this.toParentFormat(i))
      return {
        version: '2.0.0',
        exportDate: new Date().toISOString(),
        ingredients: parentIngredients as any, // Type mismatch expected
        metadata: this.generateMetadata(ingredients)
      }
    }

    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      ingredients,
      metadata: this.generateMetadata(ingredients)
    }
  }

  // Import ingredients from JSON
  async importIngredients(
    data: string | IngredientExport | ParentIngredient[],
    options: {
      skipValidation?: boolean
      skipDuplicates?: boolean
      mergeStrategy?: 'replace' | 'skip' | 'rename'
      healthSystem?: string
    } = {}
  ): Promise<{
    success: boolean
    imported: number
    skipped: number
    errors: Array<{ ingredient: string; error: string }>
  }> {
    const errors: Array<{ ingredient: string; error: string }> = []
    let ingredients: Ingredient[] = []
    let imported = 0
    let skipped = 0

    try {
      // Parse input data
      if (typeof data === 'string') {
        const parsed = JSON.parse(data)
        
        if (Array.isArray(parsed)) {
          // Array of parent format ingredients
          ingredients = await Promise.all(
            parsed.map(p => this.fromParentFormat(p, options.healthSystem))
          )
        } else if (parsed.ingredients) {
          // IngredientExport format
          ingredients = parsed.ingredients
        } else {
          throw new Error('Invalid import format')
        }
      } else if (Array.isArray(data)) {
        // Array of parent format ingredients
        ingredients = await Promise.all(
          data.map(p => this.fromParentFormat(p, options.healthSystem))
        )
      } else {
        // IngredientExport format
        ingredients = data.ingredients
      }

      // Validate if not skipped
      if (!options.skipValidation) {
        const validation = await enhancedIngredientService.validateBatch(ingredients)
        if (!validation.valid) {
          validation.results.forEach((result, index) => {
            if (!result.valid) {
              errors.push({
                ingredient: ingredients[index].keyname || `Index ${index}`,
                error: result.errors.join('; ')
              })
            }
          })
          
          // Remove invalid ingredients
          ingredients = ingredients.filter((_, index) => 
            validation.results[index].valid
          )
        }
      }

      // Process each ingredient
      for (const ingredient of ingredients) {
        try {
          // Check for duplicates
          const exists = await ingredientService.keynameExists(
            ingredient.keyname,
            ingredient.healthSystem
          )

          if (exists) {
            if (options.skipDuplicates) {
              skipped++
              continue
            }

            if (options.mergeStrategy === 'skip') {
              skipped++
              continue
            }

            if (options.mergeStrategy === 'rename') {
              ingredient.keyname = await this.generateUniqueKeyname(
                ingredient.keyname,
                ingredient.healthSystem
              )
              ingredient.displayName = `${ingredient.displayName} (Imported)`
            }
            // If 'replace', continue with import (will update existing)
          }

          // Remove id to create new
          const { id, ...ingredientData } = ingredient

          // Create ingredient
          const result = await enhancedIngredientService.createWithValidation(ingredientData)
          
          if (result.data) {
            imported++
          } else if (result.error) {
            errors.push({
              ingredient: ingredient.keyname,
              error: typeof result.error === 'string' ? result.error : result.error.message
            })
          }
        } catch (error) {
          errors.push({
            ingredient: ingredient.keyname,
            error: error instanceof Error ? error.message : 'Import failed'
          })
        }
      }

      return {
        success: errors.length === 0,
        imported,
        skipped,
        errors
      }
    } catch (error) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        errors: [{
          ingredient: 'General',
          error: error instanceof Error ? error.message : 'Import failed'
        }]
      }
    }
  }

  // Convert from parent project format to our format
  private async fromParentFormat(
    parent: ParentIngredient,
    healthSystem?: string
  ): Promise<Ingredient> {
    const now = new Date().toISOString()
    
    const ingredient: Ingredient = {
      id: '', // Will be generated
      keyname: parent.KEYNAME,
      displayName: parent.DISPLAY,
      mnemonic: parent.MNEMONIC,
      type: parent.TYPE as IngredientType,
      category: this.mapTypeToCategory(parent.TYPE),
      unit: parent.UOM_DISP,
      alternateUnits: parent.ALTUOM?.map(alt => ({
        name: alt.NAME,
        unit: alt.UOM_DISP
      })),
      referenceRanges: [],
      isShared: false,
      healthSystem,
      osmolalityRatio: parent.OSMO_RATIO,
      editMode: parent.EDITMODE,
      precision: parent.PRECISION,
      special: parent.SPECIAL,
      excludes: parent.EXCLUDES?.map(e => e.keyname),
      labs: parent.LABS?.map(lab => ({
        displayName: lab.DISPLAY,
        eventSetName: lab.EVENT_SET_NAME,
        shouldGraph: lab.GRAPH === 1
      })),
      notes: parent.NOTE?.map(n => n.TEXT),
      createdAt: now,
      updatedAt: now,
      version: '1.0.0'
    }

    // Convert concentration if present
    if (parent.CONCENTRATION) {
      ingredient.concentration = {
        strength: parent.CONCENTRATION.STRENGTH,
        strengthUnit: parent.CONCENTRATION.STRENGTH_UOM,
        volume: parent.CONCENTRATION.VOLUME,
        volumeUnit: parent.CONCENTRATION.VOLUME_UOM
      }
    }

    // Parse reference ranges if present
    if (parent.REFERENCE_RANGE && parent.REFERENCE_RANGE.length > 0) {
      // Convert from parent format (uppercase) to our format (lowercase)
      const convertedThresholds = parent.REFERENCE_RANGE.map(t => ({
        threshold: t.THRESHOLD,
        value: t.VALUE
      }))
      // Group thresholds by population type (assuming ADULT for parent format)
      const range = referenceRangeService.parseThresholdRanges(
        convertedThresholds,
        parent.UOM_DISP,
        'ADULT' // Default to adult for parent format
      )
      ingredient.referenceRanges.push(range)
    }

    return ingredient
  }

  // Convert to parent project format
  private toParentFormat(ingredient: Ingredient): ParentIngredient {
    const parent: ParentIngredient = {
      KEYNAME: ingredient.keyname,
      DISPLAY: ingredient.displayName,
      MNEMONIC: ingredient.mnemonic || '',
      UOM_DISP: ingredient.unit,
      TYPE: (ingredient.type || 'Other') as any,
      OSMO_RATIO: ingredient.osmolalityRatio || 0,
      EDITMODE: ingredient.editMode || 'None',
      PRECISION: ingredient.precision || 2,
      SPECIAL: ingredient.special
    }

    // Convert notes
    if (ingredient.notes && ingredient.notes.length > 0) {
      parent.NOTE = ingredient.notes.map(note => ({ TEXT: note }))
    }

    // Convert alternate units
    if (ingredient.alternateUnits && ingredient.alternateUnits.length > 0) {
      parent.ALTUOM = ingredient.alternateUnits.map(alt => ({
        NAME: alt.name,
        UOM_DISP: alt.unit
      }))
    }

    // Convert reference ranges (take first one for parent format)
    if (ingredient.referenceRanges.length > 0) {
      const thresholds = referenceRangeService.rangeToThresholds(
        ingredient.referenceRanges[0]
      )
      if (thresholds.length > 0) {
        // Convert from our format (lowercase) to parent format (uppercase)
        parent.REFERENCE_RANGE = thresholds.map(t => ({
          THRESHOLD: t.threshold,
          VALUE: t.value
        }))
      }
    }

    // Convert labs
    if (ingredient.labs && ingredient.labs.length > 0) {
      parent.LABS = ingredient.labs.map(lab => ({
        DISPLAY: lab.displayName,
        EVENT_SET_NAME: lab.eventSetName,
        GRAPH: lab.shouldGraph ? 1 : 0
      }))
    }

    // Convert concentration
    if (ingredient.concentration) {
      parent.CONCENTRATION = {
        STRENGTH: ingredient.concentration.strength,
        STRENGTH_UOM: ingredient.concentration.strengthUnit,
        VOLUME: ingredient.concentration.volume,
        VOLUME_UOM: ingredient.concentration.volumeUnit
      }
    }

    // Convert excludes
    if (ingredient.excludes && ingredient.excludes.length > 0) {
      parent.EXCLUDES = ingredient.excludes.map(keyname => ({ keyname }))
    }

    return parent
  }

  // Map parent project type to our category
  private mapTypeToCategory(type: string): IngredientCategory {
    const mapping: Record<string, IngredientCategory> = {
      'Macronutrient': 'macro',
      'Micronutrient': 'micro',
      'Additive': 'other',
      'Salt': 'electrolyte',
      'Diluent': 'other',
      'Other': 'other'
    }
    return mapping[type] || 'other'
  }

  // Generate metadata for export
  private generateMetadata(ingredients: Ingredient[]): IngredientExport['metadata'] {
    const populations = new Set<PopulationType>()
    const types = new Set<IngredientType>()
    const categories = new Set<IngredientCategory>()

    ingredients.forEach(i => {
      if (i.type) types.add(i.type)
      categories.add(i.category)
      i.referenceRanges.forEach(r => populations.add(r.populationType))
    })

    return {
      count: ingredients.length,
      populations: Array.from(populations),
      types: Array.from(types),
      categories: Array.from(categories)
    }
  }

  // Generate unique keyname for duplicates
  private async generateUniqueKeyname(
    baseKeyname: string,
    healthSystem?: string
  ): Promise<string> {
    let counter = 1
    let keyname = `${baseKeyname}_${counter}`

    while (await ingredientService.keynameExists(keyname, healthSystem)) {
      counter++
      keyname = `${baseKeyname}_${counter}`
    }

    return keyname
  }

  // Validate import data structure
  validateImportStructure(data: any): boolean {
    if (!data) return false

    // Check if it's an IngredientExport
    if (data.ingredients && Array.isArray(data.ingredients)) {
      return true
    }

    // Check if it's an array of parent format ingredients
    if (Array.isArray(data)) {
      return data.every(item => 
        item.KEYNAME && 
        item.DISPLAY && 
        item.UOM_DISP
      )
    }

    return false
  }

  // Export to CSV format
  exportToCSV(ingredients: Ingredient[]): string {
    const headers = [
      'Keyname',
      'Display Name',
      'Type',
      'Category',
      'Unit',
      'Shared',
      'Health System',
      'Osmolality Ratio',
      'Precision',
      'Has Reference Ranges',
      'Has Concentration'
    ]

    const rows = ingredients.map(i => [
      i.keyname,
      i.displayName,
      i.type || '',
      i.category,
      i.unit,
      i.isShared ? 'Yes' : 'No',
      i.healthSystem || '',
      i.osmolalityRatio?.toString() || '',
      i.precision?.toString() || '',
      i.referenceRanges.length > 0 ? 'Yes' : 'No',
      i.concentration ? 'Yes' : 'No'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }
}

// Export singleton instance
export const importExportService = new ImportExportService()