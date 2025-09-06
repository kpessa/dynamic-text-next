import { describe, it, expect } from 'vitest'
import ingredientReducer, {
  setIngredients,
  addIngredient,
  updateIngredient,
  deleteIngredient,
  loadIngredient,
  unloadIngredient,
  setGroups,
  selectIngredient,
  deselectIngredient,
  clearSelection,
  setLoading,
  setError,
  clearIngredients,
  IngredientState
} from '../ingredientSlice'
import type { Ingredient, LoadedIngredient, IngredientGroup } from '../../types'

describe('Ingredient Slice', () => {
  const initialState: IngredientState = {
    ingredients: [],
    loadedIngredients: [],
    groups: [],
    selectedIngredients: [],
    loading: false,
    error: null,
    lastFetch: null
  }

  const mockIngredient: Ingredient = {
    id: 'ing-1',
    keyname: 'TEST_ING',
    displayName: 'Test Ingredient',
    category: 'macro',
    unit: 'g/kg/day',
    referenceRanges: [],
    isShared: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }

  const mockLoadedIngredient: LoadedIngredient = {
    ...mockIngredient,
    value: 10,
    isLoaded: true,
    loadedAt: '2025-01-01T00:00:00Z'
  }

  const mockGroup: IngredientGroup = {
    id: 'grp-1',
    name: 'Test Group',
    ingredientIds: ['ing-1'],
    order: 1
  }

  it('should return initial state', () => {
    expect(ingredientReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setIngredients', () => {
    const actual = ingredientReducer(initialState, setIngredients([mockIngredient]))
    expect(actual.ingredients).toEqual([mockIngredient])
    expect(actual.lastFetch).toBeTruthy()
    expect(actual.error).toBe(null)
  })

  it('should handle addIngredient', () => {
    const actual = ingredientReducer(initialState, addIngredient(mockIngredient))
    expect(actual.ingredients).toContain(mockIngredient)
  })

  it('should handle updateIngredient', () => {
    const stateWithIng = { ...initialState, ingredients: [mockIngredient] }
    const updated = { ...mockIngredient, displayName: 'Updated Ingredient' }
    const actual = ingredientReducer(stateWithIng, updateIngredient(updated))
    expect(actual.ingredients[0].displayName).toBe('Updated Ingredient')
  })

  it('should handle deleteIngredient', () => {
    const stateWithData = { 
      ...initialState, 
      ingredients: [mockIngredient],
      loadedIngredients: [mockLoadedIngredient],
      selectedIngredients: ['ing-1']
    }
    const actual = ingredientReducer(stateWithData, deleteIngredient('ing-1'))
    expect(actual.ingredients).toHaveLength(0)
    expect(actual.loadedIngredients).toHaveLength(0)
    expect(actual.selectedIngredients).toHaveLength(0)
  })

  it('should handle loadIngredient', () => {
    const actual = ingredientReducer(initialState, loadIngredient(mockLoadedIngredient))
    expect(actual.loadedIngredients).toContain(mockLoadedIngredient)
  })

  it('should update existing loaded ingredient', () => {
    const stateWithLoaded = { 
      ...initialState, 
      loadedIngredients: [mockLoadedIngredient] 
    }
    const updatedLoaded = { ...mockLoadedIngredient, value: 20 }
    const actual = ingredientReducer(stateWithLoaded, loadIngredient(updatedLoaded))
    expect(actual.loadedIngredients).toHaveLength(1)
    expect(actual.loadedIngredients[0].value).toBe(20)
  })

  it('should handle unloadIngredient', () => {
    const stateWithLoaded = { 
      ...initialState, 
      loadedIngredients: [mockLoadedIngredient] 
    }
    const actual = ingredientReducer(stateWithLoaded, unloadIngredient('ing-1'))
    expect(actual.loadedIngredients).toHaveLength(0)
  })

  it('should handle setGroups', () => {
    const actual = ingredientReducer(initialState, setGroups([mockGroup]))
    expect(actual.groups).toEqual([mockGroup])
  })

  it('should handle selectIngredient', () => {
    const actual = ingredientReducer(initialState, selectIngredient('ing-1'))
    expect(actual.selectedIngredients).toContain('ing-1')
  })

  it('should not duplicate selected ingredients', () => {
    const stateWithSelected = { ...initialState, selectedIngredients: ['ing-1'] }
    const actual = ingredientReducer(stateWithSelected, selectIngredient('ing-1'))
    expect(actual.selectedIngredients).toHaveLength(1)
  })

  it('should handle deselectIngredient', () => {
    const stateWithSelected = { ...initialState, selectedIngredients: ['ing-1', 'ing-2'] }
    const actual = ingredientReducer(stateWithSelected, deselectIngredient('ing-1'))
    expect(actual.selectedIngredients).toEqual(['ing-2'])
  })

  it('should handle clearSelection', () => {
    const stateWithSelected = { ...initialState, selectedIngredients: ['ing-1', 'ing-2'] }
    const actual = ingredientReducer(stateWithSelected, clearSelection())
    expect(actual.selectedIngredients).toHaveLength(0)
  })

  it('should handle setLoading', () => {
    const actual = ingredientReducer(initialState, setLoading(true))
    expect(actual.loading).toBe(true)
  })

  it('should handle setError', () => {
    const actual = ingredientReducer(initialState, setError('Test error'))
    expect(actual.error).toBe('Test error')
    expect(actual.loading).toBe(false)
  })

  it('should handle clearIngredients', () => {
    const stateWithData = {
      ingredients: [mockIngredient],
      loadedIngredients: [mockLoadedIngredient],
      groups: [mockGroup],
      selectedIngredients: ['ing-1'],
      loading: true,
      error: 'Some error',
      lastFetch: '2025-01-01'
    }
    const actual = ingredientReducer(stateWithData, clearIngredients())
    expect(actual).toEqual(initialState)
  })
})