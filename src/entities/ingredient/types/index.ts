// Application domain types for ingredients
// These are used for the actual application functionality

// Ingredient types matching parent project structure
export type IngredientType = 'Macronutrient' | 'Micronutrient' | 'Additive' | 'Salt' | 'Diluent' | 'Other'
export type IngredientCategory = 'macro' | 'micro' | 'electrolyte' | 'vitamin' | 'trace' | 'other'
export type PopulationType = 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT'
export type ThresholdType = 'Feasible Low' | 'Critical Low' | 'Normal Low' | 'Normal High' | 'Critical High' | 'Feasible High'
export type EditMode = 'None' | 'Custom'

export interface Concentration {
  strength: number
  strengthUnit: string
  volume: number
  volumeUnit: string
}

export interface ReferenceRange {
  populationType: PopulationType
  threshold?: ThresholdType
  value?: number
  min?: number
  max?: number
  normal?: { low: number; high: number }
  critical?: { low: number; high: number }
  feasible?: { low: number; high: number }
  unit: string
}

export interface ReferenceRangeValidation {
  status: 'critical-low' | 'low' | 'normal' | 'high' | 'critical-high' | 'out-of-range'
  message: string
  value: number
  ranges: ReferenceRange
}

// Domain model for ingredients used in the application
export interface Ingredient {
  id: string
  keyname: string
  displayName: string
  mnemonic?: string
  type?: IngredientType
  category: IngredientCategory
  unit: string
  alternateUnits?: Array<{
    name: string
    unit: string
    conversionFactor?: number
  }>
  referenceRanges: ReferenceRange[]
  concentration?: Concentration
  isShared: boolean
  healthSystem?: string
  populationType?: PopulationType
  osmolalityRatio?: number
  editMode?: EditMode
  precision?: number
  special?: string
  formula?: string
  dependencies?: string[]
  excludes?: string[]
  labs?: Array<{
    displayName: string
    eventSetName: string
    shouldGraph: boolean
  }>
  notes?: string[]
  createdAt: string
  updatedAt: string
  version?: string
  metadata?: Record<string, any>
}

export interface LoadedIngredient extends Ingredient {
  value?: number
  isLoaded: boolean
  loadedAt?: string
  source?: string
}

export interface IngredientGroup {
  id: string
  name: string
  ingredientIds: string[]
  order: number
  isCollapsed?: boolean
}

export interface IngredientSection {
  id: string
  name: string
  content: string
  ingredients: Ingredient[]
  order: number
}

// Validation rules for ingredients
export interface IngredientValidationRules {
  keynameRequired: boolean
  displayNameRequired: boolean
  unitRequired: boolean
  keynameUnique: boolean
  referenceRangesRequired: boolean
  concentrationRequired: boolean
}

// Import/Export format
export interface IngredientExport {
  version: string
  exportDate: string
  ingredients: Ingredient[]
  metadata: {
    count: number
    populations: PopulationType[]
    types: IngredientType[]
    categories: IngredientCategory[]
  }
}

// Filter options for searching
export interface IngredientFilter {
  searchTerm?: string
  types?: IngredientType[]
  categories?: IngredientCategory[]
  populations?: PopulationType[]
  hasReferenceRanges?: boolean
  isShared?: boolean
  healthSystem?: string
  modifiedAfter?: Date
}

// Bulk operation interfaces
export interface BulkOperation {
  type: 'update' | 'delete' | 'validate' | 'export'
  ingredientIds: string[]
  changes?: Partial<Ingredient>
  options?: {
    skipValidation?: boolean
    transaction?: boolean
    dryRun?: boolean
  }
}

export interface BulkOperationResult {
  success: boolean
  processed: number
  failed: number
  errors?: Array<{ id: string; error: string }>
}