import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/app/store'
import type { Ingredient as EntityIngredient, IngredientType } from '@/entities/ingredient/types'

// Re-export the IngredientType from entities for backward compatibility
export { IngredientType }
export type Population = 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT'
export type ValidationStatus = 'valid' | 'warning' | 'error' | 'pending'
export type SyncStatus = 'synced' | 'conflict' | 'outdated' | 'unknown'

export interface Section {
  id: string
  title: string
  content: string
  type: 'static' | 'dynamic'
}

export interface DynamicSection extends Section {
  variables?: Record<string, any>
  template?: string
}

export interface TestCase {
  id: string
  name: string
  variables: Record<string, any>
  expected?: string
  description?: string
  enabled?: boolean
  tags?: string[]
}

export interface IngredientVariant {
  id: string
  ingredientId: string
  ingredientType: IngredientType
  population: Population
  healthSystem: string
  domain: string
  subdomain: string
  sections: {
    static: Section[]
    dynamic: DynamicSection[]
  }
  tests: TestCase[]
  lastUpdated: Date
  validationStatus: ValidationStatus
  syncStatus: SyncStatus
  version: string
  domainVersions?: {
    [domain: string]: {
      version: string
      lastUpdated: Date
    }
  }
}

export interface ConcentrationData {
  strength: number
  strengthUom: string
  volume: number
  volumeUom: string
}

export interface ReferenceRange {
  threshold: 'Feasible Low' | 'Critical Low' | 'Normal Low' | 'Normal High' | 'Critical High' | 'Feasible High'
  value: number
}

export interface AltUom {
  name: string
  uomDisp: string
}

export interface Lab {
  display: string
  eventSetName: string
  graph: number
}

// Extend the entity Ingredient with variant-specific properties
export interface Ingredient extends Partial<EntityIngredient> {
  id: string
  name?: string
  keyname: string
  display?: string
  displayName?: string
  mnemonic?: string
  uomDisp?: string  // Unit of measure display
  type?: IngredientType
  osmoRatio?: number
  editMode?: 'None' | 'Custom'
  precision?: number
  special?: string
  notes?: string[]
  altUom?: AltUom[]
  referenceRanges?: ReferenceRange[]
  labs?: Lab[]
  concentration?: ConcentrationData
  excludes?: string[]  // Array of excluded ingredient keynames
  variants: IngredientVariant[]
  tests?: TestCase[]
  hasSyncConflicts?: boolean
}

export interface VariantState {
  ingredientsByType: {
    Macronutrient: Ingredient[]
    Micronutrient: Ingredient[]
    Additive: Ingredient[]
    Salt: Ingredient[]
    Diluent: Ingredient[]
    Other: Ingredient[]
  }
  selectedVariantId: string | null
  selectedIngredientId: string | null
  expandedIngredients: string[]
  expandedTypes: string[]
  syncStatus: {
    [ingredientId: string]: SyncStatus
  }
  loading: boolean
  error: string | null
  filters: {
    population: Population | null
    healthSystem: string | null
    validationStatus: ValidationStatus | null
    syncStatus: SyncStatus | null
  }
}

const initialState: VariantState = {
  ingredientsByType: {
    Macronutrient: [],
    Micronutrient: [],
    Additive: [],
    Salt: [],
    Diluent: [],
    Other: [],
  },
  selectedVariantId: null,
  selectedIngredientId: null,
  expandedIngredients: [],
  expandedTypes: [],
  syncStatus: {},
  loading: false,
  error: null,
  filters: {
    population: null,
    healthSystem: null,
    validationStatus: null,
    syncStatus: null,
  },
}

const variantSlice = createSlice({
  name: 'variants',
  initialState,
  reducers: {
    setIngredientsByType: (state, action: PayloadAction<Partial<VariantState['ingredientsByType']>>) => {
      state.ingredientsByType = { ...state.ingredientsByType, ...action.payload }
    },
    
    addIngredient: (state, action: PayloadAction<Ingredient>) => {
      const type = action.payload.type
      if (!state.ingredientsByType[type].find(ing => ing.id === action.payload.id)) {
        state.ingredientsByType[type].push(action.payload)
      }
    },
    
    updateIngredient: (state, action: PayloadAction<{ id: string; changes: Partial<Ingredient> }>) => {
      const { id, changes } = action.payload
      for (const type of Object.keys(state.ingredientsByType) as IngredientType[]) {
        const index = state.ingredientsByType[type].findIndex(ing => ing.id === id)
        if (index !== -1) {
          state.ingredientsByType[type][index] = {
            ...state.ingredientsByType[type][index],
            ...changes,
          }
          break
        }
      }
    },
    
    addVariant: (state, action: PayloadAction<{ ingredientId: string; variant: IngredientVariant }>) => {
      const { ingredientId, variant } = action.payload
      for (const type of Object.keys(state.ingredientsByType) as IngredientType[]) {
        const ingredient = state.ingredientsByType[type].find(ing => ing.id === ingredientId)
        if (ingredient) {
          if (!ingredient.variants) {
            ingredient.variants = []
          }
          ingredient.variants.push(variant)
          break
        }
      }
    },
    
    updateVariant: (state, action: PayloadAction<{ variantId: string; changes: Partial<IngredientVariant> }>) => {
      const { variantId, changes } = action.payload
      for (const type of Object.keys(state.ingredientsByType) as IngredientType[]) {
        for (const ingredient of state.ingredientsByType[type]) {
          const variantIndex = ingredient.variants?.findIndex(v => v.id === variantId)
          if (variantIndex !== undefined && variantIndex !== -1) {
            ingredient.variants[variantIndex] = {
              ...ingredient.variants[variantIndex],
              ...changes,
            }
            return
          }
        }
      }
    },
    
    selectIngredientVariant: (state, action: PayloadAction<string>) => {
      state.selectedVariantId = action.payload
    },
    
    selectIngredient: (state, action: PayloadAction<string>) => {
      state.selectedIngredientId = action.payload
    },
    
    toggleIngredientExpansion: (state, action: PayloadAction<string>) => {
      const ingredientId = action.payload
      const index = state.expandedIngredients.indexOf(ingredientId)
      if (index === -1) {
        state.expandedIngredients.push(ingredientId)
      } else {
        state.expandedIngredients.splice(index, 1)
      }
    },
    
    toggleTypeExpansion: (state, action: PayloadAction<string>) => {
      const type = action.payload
      const index = state.expandedTypes.indexOf(type)
      if (index === -1) {
        state.expandedTypes.push(type)
      } else {
        state.expandedTypes.splice(index, 1)
      }
    },
    
    setSyncStatus: (state, action: PayloadAction<{ ingredientId: string; status: SyncStatus }>) => {
      state.syncStatus[action.payload.ingredientId] = action.payload.status
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    setFilters: (state, action: PayloadAction<Partial<VariantState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters
    },
    
    resetState: () => initialState,
  },
})

export const {
  setIngredientsByType,
  addIngredient,
  updateIngredient,
  addVariant,
  updateVariant,
  selectIngredientVariant,
  selectIngredient,
  toggleIngredientExpansion,
  toggleTypeExpansion,
  setSyncStatus,
  setLoading,
  setError,
  setFilters,
  clearFilters,
  resetState,
} = variantSlice.actions

// Selectors
export const selectIngredientsByType = (state: RootState) => state.variants.ingredientsByType
export const selectSelectedVariantId = (state: RootState) => state.variants.selectedVariantId
export const selectSelectedIngredientId = (state: RootState) => state.variants.selectedIngredientId
export const selectExpandedIngredients = (state: RootState) => state.variants.expandedIngredients
export const selectExpandedTypes = (state: RootState) => state.variants.expandedTypes
export const selectSyncStatus = (state: RootState) => state.variants.syncStatus
export const selectLoading = (state: RootState) => state.variants.loading
export const selectError = (state: RootState) => state.variants.error
export const selectFilters = (state: RootState) => state.variants.filters

// Complex selectors
export const selectIngredientById = (ingredientId: string) => (state: RootState) => {
  for (const type of Object.keys(state.variants.ingredientsByType) as IngredientType[]) {
    const ingredient = state.variants.ingredientsByType[type].find((ing: Ingredient) => ing.id === ingredientId)
    if (ingredient) return ingredient
  }
  return null
}

export const selectVariantById = (variantId: string) => (state: RootState) => {
  for (const type of Object.keys(state.variants.ingredientsByType) as IngredientType[]) {
    for (const ingredient of state.variants.ingredientsByType[type]) {
      const variant = ingredient.variants?.find((v: IngredientVariant) => v.id === variantId)
      if (variant) return variant
    }
  }
  return null
}

export const selectFilteredIngredients = (state: RootState) => {
  const { filters, ingredientsByType } = state.variants
  const allIngredients: Ingredient[] = []
  
  for (const type of Object.keys(ingredientsByType) as IngredientType[]) {
    allIngredients.push(...ingredientsByType[type])
  }
  
  if (!filters.population && !filters.healthSystem && !filters.validationStatus && !filters.syncStatus) {
    return allIngredients
  }
  
  return allIngredients.filter(ingredient => {
    const hasMatchingVariant = ingredient.variants?.some(variant => {
      if (filters.population && variant.population !== filters.population) return false
      if (filters.healthSystem && variant.healthSystem !== filters.healthSystem) return false
      if (filters.validationStatus && variant.validationStatus !== filters.validationStatus) return false
      if (filters.syncStatus && variant.syncStatus !== filters.syncStatus) return false
      return true
    })
    return hasMatchingVariant
  })
}

export const selectIngredientStats = (state: RootState) => {
  const { ingredientsByType } = state.variants
  let totalIngredients = 0
  let totalVariants = 0
  let syncConflicts = 0
  let validationErrors = 0
  
  for (const type of Object.keys(ingredientsByType) as IngredientType[]) {
    const ingredients = ingredientsByType[type]
    totalIngredients += ingredients.length
    
    for (const ingredient of ingredients) {
      if (ingredient.hasSyncConflicts) syncConflicts++
      if (ingredient.variants) {
        totalVariants += ingredient.variants.length
        validationErrors += ingredient.variants.filter((v: IngredientVariant) => v.validationStatus === 'error').length
      }
    }
  }
  
  return {
    totalIngredients,
    totalVariants,
    syncConflicts,
    validationErrors,
  }
}

export default variantSlice.reducer