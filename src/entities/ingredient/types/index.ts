// Application domain types for ingredients
// These are used for the actual application functionality

export type IngredientCategory = 'macro' | 'micro' | 'electrolyte' | 'vitamin' | 'trace' | 'other'
export type PopulationType = 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT'

export interface ReferenceRange {
  populationType: PopulationType
  min?: number
  max?: number
  normal?: { low: number; high: number }
  critical?: { low: number; high: number }
  feasible?: { low: number; high: number }
  unit: string
}

// Domain model for ingredients used in the application
export interface Ingredient {
  id: string
  keyname: string
  displayName: string
  mnemonic?: string
  category: IngredientCategory
  unit: string
  alternateUnits?: Array<{
    name: string
    unit: string
    conversionFactor?: number
  }>
  referenceRanges: ReferenceRange[]
  isShared: boolean
  healthSystem?: string
  populationType?: PopulationType
  osmolalityRatio?: number
  precision?: number
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