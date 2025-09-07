/**
 * Ingredient Converter
 * Converts TPN config ingredients to application Ingredient type
 * Handles NOTE array parsing and de-duplication
 */

import type { Ingredient, IngredientCategory, IngredientType } from '@/entities/ingredient/types'
import type { TPNConfiguration } from '../types/schemas'
import { parseNoteArrayToSections, hasDynamicSections, getNotePreview } from './noteParser'
import type { Section } from '@/entities/section/types'

export interface ImportedIngredient extends Ingredient {
  sections?: Section[]
  hasDynamicContent?: boolean
  notePreview?: string
  originalNote?: Array<{ TEXT: string }>
}

/**
 * Map TPN TYPE to application IngredientType
 */
function mapIngredientType(type: string): IngredientType {
  const typeMap: Record<string, IngredientType> = {
    'Macronutrient': 'Macronutrient',
    'Micronutrient': 'Micronutrient',
    'Electrolyte': 'Micronutrient',
    'Mineral': 'Micronutrient',
    'Vitamin': 'Micronutrient',
    'Trace Element': 'Micronutrient',
    'Additive': 'Additive',
    'Salt': 'Salt',
    'Diluent': 'Diluent',
    'Other': 'Other'
  }
  return typeMap[type] || 'Other'
}

/**
 * Map TPN TYPE to application IngredientCategory
 */
function mapIngredientCategory(type: string): IngredientCategory {
  const categoryMap: Record<string, IngredientCategory> = {
    'Macronutrient': 'macro',
    'Micronutrient': 'micro',
    'Electrolyte': 'electrolyte',
    'Mineral': 'micro',
    'Vitamin': 'vitamin',
    'Trace Element': 'trace',
    'Additive': 'other',
    'Salt': 'electrolyte',
    'Diluent': 'other',
    'Other': 'other'
  }
  return categoryMap[type] || 'other'
}

/**
 * Convert TPN config ingredient to application Ingredient
 */
export function convertTPNIngredient(
  tpnIngredient: any,
  healthSystem?: string,
  populationType?: string
): ImportedIngredient {
  const now = new Date().toISOString()
  
  // Parse NOTE array into sections if present
  let sections: Section[] = []
  let hasDynamicContent = false
  let notePreview = ''
  
  if (tpnIngredient.NOTE && Array.isArray(tpnIngredient.NOTE)) {
    sections = parseNoteArrayToSections(tpnIngredient.NOTE)
    hasDynamicContent = hasDynamicSections(tpnIngredient.NOTE)
    notePreview = getNotePreview(tpnIngredient.NOTE, 200)
  }
  
  // Create base ingredient
  const ingredient: ImportedIngredient = {
    id: `${tpnIngredient.KEYNAME}_${Date.now()}`,
    keyname: tpnIngredient.KEYNAME || '',
    displayName: tpnIngredient.DISPLAY || tpnIngredient.KEYNAME || '',
    mnemonic: tpnIngredient.MNEMONIC,
    type: mapIngredientType(tpnIngredient.TYPE || 'Other'),
    category: mapIngredientCategory(tpnIngredient.TYPE || 'Other'),
    unit: tpnIngredient.UOM_DISP || '',
    isShared: false,
    healthSystem,
    populationType: populationType as any,
    osmolalityRatio: tpnIngredient.OSMO_RATIO,
    editMode: tpnIngredient.EDITMODE,
    precision: tpnIngredient.PRECISION,
    special: tpnIngredient.SPECIAL,
    createdAt: now,
    updatedAt: now,
    referenceRanges: [],
    sections,
    hasDynamicContent,
    notePreview,
    originalNote: tpnIngredient.NOTE
  }
  
  // Convert alternative units
  if (tpnIngredient.ALTUOM && Array.isArray(tpnIngredient.ALTUOM)) {
    ingredient.alternateUnits = tpnIngredient.ALTUOM.map((alt: any) => ({
      name: alt.NAME || '',
      unit: alt.UOM_DISP || '',
      conversionFactor: alt.CONVERSION
    }))
  }
  
  // Convert reference ranges
  if (tpnIngredient.REFERENCE_RANGE && Array.isArray(tpnIngredient.REFERENCE_RANGE)) {
    ingredient.referenceRanges = tpnIngredient.REFERENCE_RANGE.map((range: any) => ({
      populationType: populationType || 'ADULT',
      threshold: range.THRESHOLD,
      value: range.VALUE,
      unit: tpnIngredient.UOM_DISP || ''
    }))
  }
  
  // Convert concentration
  if (tpnIngredient.CONCENTRATION) {
    const conc = tpnIngredient.CONCENTRATION
    ingredient.concentration = {
      strength: conc.STRENGTH || 0,
      strengthUnit: conc.STRENGTH_UOM || '',
      volume: conc.VOLUME || 0,
      volumeUnit: conc.VOLUME_UOM || ''
    }
  }
  
  // Convert labs
  if (tpnIngredient.LABS && Array.isArray(tpnIngredient.LABS)) {
    ingredient.labs = tpnIngredient.LABS.map((lab: any) => ({
      displayName: lab.DISPLAY || '',
      eventSetName: lab.EVENT_SET_NAME || '',
      shouldGraph: lab.GRAPH === 1
    }))
  }
  
  // Handle excludes
  if (tpnIngredient.EXCLUDES && Array.isArray(tpnIngredient.EXCLUDES)) {
    ingredient.excludes = tpnIngredient.EXCLUDES.map((ex: any) => ex.keyname || ex)
  }
  
  // Store any additional metadata
  ingredient.metadata = {
    originalType: tpnIngredient.TYPE,
    hasNotes: !!tpnIngredient.NOTE && tpnIngredient.NOTE.length > 0,
    sectionCount: sections.length,
    dynamicSectionCount: sections.filter(s => s.type === 'dynamic').length,
    staticSectionCount: sections.filter(s => s.type === 'static').length
  }
  
  return ingredient
}

/**
 * Convert full TPN configuration to ingredients
 */
export function convertTPNConfig(
  config: TPNConfiguration
): ImportedIngredient[] {
  const healthSystem = config.healthSystem || ''
  const populationType = config.populationType || 'ADULT'
  
  if (!config.INGREDIENT || !Array.isArray(config.INGREDIENT)) {
    return []
  }
  
  return config.INGREDIENT.map(ing => 
    convertTPNIngredient(ing, healthSystem, populationType)
  )
}

/**
 * De-duplicate ingredients by keyname
 * Keeps the most recent or most complete version
 */
export function deduplicateIngredients(
  existing: Ingredient[],
  imported: ImportedIngredient[]
): {
  unique: ImportedIngredient[]
  duplicates: Array<{ existing: Ingredient; imported: ImportedIngredient }>
  merged: ImportedIngredient[]
} {
  const unique: ImportedIngredient[] = []
  const duplicates: Array<{ existing: Ingredient; imported: ImportedIngredient }> = []
  const merged: ImportedIngredient[] = []
  
  // Create a map of existing ingredients by keyname
  const existingMap = new Map<string, Ingredient>()
  existing.forEach(ing => {
    existingMap.set(ing.keyname.toLowerCase(), ing)
  })
  
  // Check each imported ingredient
  imported.forEach(importedIng => {
    const keynameKey = importedIng.keyname.toLowerCase()
    const existing = existingMap.get(keynameKey)
    
    if (existing) {
      // Found duplicate
      duplicates.push({ existing, imported: importedIng })
      
      // Merge: prefer imported but keep existing ID and timestamps
      const mergedIng: ImportedIngredient = {
        ...importedIng,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
        metadata: {
          ...existing.metadata,
          ...importedIng.metadata,
          mergedFrom: 'import',
          originalId: importedIng.id
        }
      }
      merged.push(mergedIng)
    } else {
      // Unique ingredient
      unique.push(importedIng)
    }
  })
  
  return { unique, duplicates, merged }
}

/**
 * Group ingredients by type for display
 */
export function groupIngredientsByType(
  ingredients: ImportedIngredient[]
): Record<IngredientType, ImportedIngredient[]> {
  const groups: Record<IngredientType, ImportedIngredient[]> = {
    'Macronutrient': [],
    'Micronutrient': [],
    'Additive': [],
    'Salt': [],
    'Diluent': [],
    'Other': []
  }
  
  ingredients.forEach(ing => {
    const type = ing.type || 'Other'
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(ing)
  })
  
  return groups
}

/**
 * Get ingredient summary for display
 */
export function getIngredientSummary(ingredient: ImportedIngredient): string {
  const parts: string[] = []
  
  if (ingredient.displayName && ingredient.displayName !== ingredient.keyname) {
    parts.push(ingredient.displayName)
  }
  
  if (ingredient.unit) {
    parts.push(`(${ingredient.unit})`)
  }
  
  if (ingredient.hasDynamicContent) {
    parts.push('📝 Dynamic')
  }
  
  if (ingredient.sections && ingredient.sections.length > 0) {
    parts.push(`${ingredient.sections.length} sections`)
  }
  
  return parts.join(' ') || ingredient.keyname
}