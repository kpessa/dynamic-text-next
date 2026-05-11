import { describe, it, expect } from 'vitest'
import variantReducer, {
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
  selectIngredientById,
  selectVariantById,
  selectFilteredIngredients,
  selectIngredientStats,
  VariantState,
  Ingredient,
  IngredientVariant,
} from '../store/variantSlice'
import { configureStore } from '@reduxjs/toolkit'

const mockVariant: IngredientVariant = {
  id: 'variant-1',
  ingredientId: 'ing-1',
  ingredientType: 'Macronutrient',
  population: 'NEO',
  healthSystem: 'CHOC',
  domain: 'build-main',
  subdomain: 'production',
  sections: {
    static: [],
    dynamic: [],
  },
  tests: [],
  lastUpdated: new Date('2024-01-09'),
  validationStatus: 'valid',
  syncStatus: 'synced',
  version: '1.0.0',
}

const mockIngredient: Ingredient = {
  id: 'ing-1',
  name: 'Protein',
  keyname: 'protein',
  display: 'Protein',
  type: 'Macronutrient',
  variants: [mockVariant],
  tests: [],
  hasSyncConflicts: false,
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

describe('variantSlice', () => {
  describe('reducers', () => {
    it('should handle setIngredientsByType', () => {
      const newIngredients = {
        Macronutrient: [mockIngredient],
      }
      const state = variantReducer(initialState, setIngredientsByType(newIngredients))
      expect(state.ingredientsByType.Macronutrient).toEqual([mockIngredient])
    })

    it('should handle addIngredient', () => {
      const state = variantReducer(initialState, addIngredient(mockIngredient))
      expect(state.ingredientsByType.Macronutrient).toContainEqual(mockIngredient)
    })

    it('should not add duplicate ingredients', () => {
      const stateWithIngredient = {
        ...initialState,
        ingredientsByType: {
          ...initialState.ingredientsByType,
          Macronutrient: [mockIngredient],
        },
      }
      const state = variantReducer(stateWithIngredient, addIngredient(mockIngredient))
      expect(state.ingredientsByType.Macronutrient).toHaveLength(1)
    })

    it('should handle updateIngredient', () => {
      const stateWithIngredient = {
        ...initialState,
        ingredientsByType: {
          ...initialState.ingredientsByType,
          Macronutrient: [mockIngredient],
        },
      }
      const updates = { id: 'ing-1', changes: { display: 'Updated Protein' } }
      const state = variantReducer(stateWithIngredient, updateIngredient(updates))
      expect(state.ingredientsByType.Macronutrient[0].display).toBe('Updated Protein')
    })

    it('should handle addVariant', () => {
      const stateWithIngredient = {
        ...initialState,
        ingredientsByType: {
          ...initialState.ingredientsByType,
          Macronutrient: [{ ...mockIngredient, variants: [] }],
        },
      }
      const newVariant = { ...mockVariant, id: 'variant-2' }
      const state = variantReducer(
        stateWithIngredient,
        addVariant({ ingredientId: 'ing-1', variant: newVariant })
      )
      expect(state.ingredientsByType.Macronutrient[0].variants).toContainEqual(newVariant)
    })

    it('should handle updateVariant', () => {
      const stateWithVariant = {
        ...initialState,
        ingredientsByType: {
          ...initialState.ingredientsByType,
          Macronutrient: [mockIngredient],
        },
      }
      const updates = { variantId: 'variant-1', changes: { syncStatus: 'conflict' as const } }
      const state = variantReducer(stateWithVariant, updateVariant(updates))
      expect(state.ingredientsByType.Macronutrient[0].variants[0].syncStatus).toBe('conflict')
    })

    it('should handle selectIngredientVariant', () => {
      const state = variantReducer(initialState, selectIngredientVariant('variant-123'))
      expect(state.selectedVariantId).toBe('variant-123')
    })

    it('should handle selectIngredient', () => {
      const state = variantReducer(initialState, selectIngredient('ing-123'))
      expect(state.selectedIngredientId).toBe('ing-123')
    })

    it('should handle toggleIngredientExpansion', () => {
      // First toggle - should add
      let state = variantReducer(initialState, toggleIngredientExpansion('ing-1'))
      expect(state.expandedIngredients).toContain('ing-1')
      
      // Second toggle - should remove
      state = variantReducer(state, toggleIngredientExpansion('ing-1'))
      expect(state.expandedIngredients).not.toContain('ing-1')
    })

    it('should handle toggleTypeExpansion', () => {
      // First toggle - should add
      let state = variantReducer(initialState, toggleTypeExpansion('Macronutrient'))
      expect(state.expandedTypes).toContain('Macronutrient')
      
      // Second toggle - should remove
      state = variantReducer(state, toggleTypeExpansion('Macronutrient'))
      expect(state.expandedTypes).not.toContain('Macronutrient')
    })

    it('should handle setSyncStatus', () => {
      const state = variantReducer(
        initialState,
        setSyncStatus({ ingredientId: 'ing-1', status: 'conflict' })
      )
      expect(state.syncStatus['ing-1']).toBe('conflict')
    })

    it('should handle setLoading', () => {
      const state = variantReducer(initialState, setLoading(true))
      expect(state.loading).toBe(true)
    })

    it('should handle setError', () => {
      const state = variantReducer(initialState, setError('Test error'))
      expect(state.error).toBe('Test error')
    })

    it('should handle setFilters', () => {
      const filters = { population: 'NEO' as const, syncStatus: 'synced' as const }
      const state = variantReducer(initialState, setFilters(filters))
      expect(state.filters.population).toBe('NEO')
      expect(state.filters.syncStatus).toBe('synced')
    })

    it('should handle clearFilters', () => {
      const stateWithFilters = {
        ...initialState,
        filters: {
          population: 'NEO' as const,
          healthSystem: 'CHOC',
          validationStatus: 'valid' as const,
          syncStatus: 'synced' as const,
        },
      }
      const state = variantReducer(stateWithFilters, clearFilters())
      expect(state.filters).toEqual(initialState.filters)
    })

    it('should handle resetState', () => {
      const modifiedState = {
        ...initialState,
        selectedVariantId: 'some-id',
        loading: true,
        error: 'some error',
      }
      const state = variantReducer(modifiedState, resetState())
      expect(state).toEqual(initialState)
    })
  })

  describe('selectors', () => {
    const createTestStore = (state: VariantState) => {
      return configureStore({
        reducer: {
          variants: () => state,
        },
      })
    }

    it('selectIngredientById should find ingredient by ID', () => {
      const state = {
        ...initialState,
        ingredientsByType: {
          ...initialState.ingredientsByType,
          Macronutrient: [mockIngredient],
        },
      }
      const store = createTestStore(state)
      const ingredient = selectIngredientById('ing-1')(store.getState())
      expect(ingredient).toEqual(mockIngredient)
    })

    it('selectIngredientById should return null for non-existent ID', () => {
      const store = createTestStore(initialState)
      const ingredient = selectIngredientById('non-existent')(store.getState())
      expect(ingredient).toBeNull()
    })

    it('selectVariantById should find variant by ID', () => {
      const state = {
        ...initialState,
        ingredientsByType: {
          ...initialState.ingredientsByType,
          Macronutrient: [mockIngredient],
        },
      }
      const store = createTestStore(state)
      const variant = selectVariantById('variant-1')(store.getState())
      expect(variant).toEqual(mockVariant)
    })

    it('selectFilteredIngredients should filter by population', () => {
      const neoVariant = { ...mockVariant, population: 'NEO' as const }
      const adultVariant = { ...mockVariant, id: 'variant-2', population: 'ADULT' as const }
      
      const ingredient1 = { ...mockIngredient, variants: [neoVariant] }
      const ingredient2 = { ...mockIngredient, id: 'ing-2', variants: [adultVariant] }
      
      const state = {
        ...initialState,
        ingredientsByType: {
          ...initialState.ingredientsByType,
          Macronutrient: [ingredient1, ingredient2],
        },
        filters: {
          ...initialState.filters,
          population: 'NEO' as const,
        },
      }
      
      const store = createTestStore(state)
      const filtered = selectFilteredIngredients(store.getState())
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('ing-1')
    })

    it('selectIngredientStats should calculate correct statistics', () => {
      const errorVariant = { ...mockVariant, id: 'v2', validationStatus: 'error' as const }
      const conflictIngredient = {
        ...mockIngredient,
        id: 'ing-2',
        hasSyncConflicts: true,
        variants: [errorVariant],
      }
      
      const state = {
        ...initialState,
        ingredientsByType: {
          ...initialState.ingredientsByType,
          Macronutrient: [mockIngredient, conflictIngredient],
        },
      }
      
      const store = createTestStore(state)
      const stats = selectIngredientStats(store.getState())
      
      expect(stats.totalIngredients).toBe(2)
      expect(stats.totalVariants).toBe(2)
      expect(stats.syncConflicts).toBe(1)
      expect(stats.validationErrors).toBe(1)
    })
  })
})