import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Ingredient, LoadedIngredient, IngredientGroup, IngredientCategory } from '../types'

export interface IngredientState {
  ingredients: Ingredient[]
  loadedIngredients: LoadedIngredient[]
  groups: IngredientGroup[]
  selectedIngredients: string[]
  loading: boolean
  error: string | null
  lastFetch: string | null
}

const initialState: IngredientState = {
  ingredients: [],
  loadedIngredients: [],
  groups: [],
  selectedIngredients: [],
  loading: false,
  error: null,
  lastFetch: null
}

const ingredientSlice = createSlice({
  name: 'ingredient',
  initialState,
  reducers: {
    setIngredients: (state, action: PayloadAction<Ingredient[]>) => {
      state.ingredients = action.payload
      state.lastFetch = new Date().toISOString()
      state.error = null
    },
    addIngredient: (state, action: PayloadAction<Ingredient>) => {
      state.ingredients.push(action.payload)
    },
    updateIngredient: (state, action: PayloadAction<Ingredient>) => {
      const index = state.ingredients.findIndex(i => i.id === action.payload.id)
      if (index !== -1) {
        state.ingredients[index] = action.payload
      }
    },
    deleteIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(i => i.id !== action.payload)
      state.loadedIngredients = state.loadedIngredients.filter(i => i.id !== action.payload)
      state.selectedIngredients = state.selectedIngredients.filter(id => id !== action.payload)
    },
    loadIngredient: (state, action: PayloadAction<LoadedIngredient>) => {
      const existing = state.loadedIngredients.findIndex(i => i.id === action.payload.id)
      if (existing !== -1) {
        state.loadedIngredients[existing] = action.payload
      } else {
        state.loadedIngredients.push(action.payload)
      }
    },
    unloadIngredient: (state, action: PayloadAction<string>) => {
      state.loadedIngredients = state.loadedIngredients.filter(i => i.id !== action.payload)
    },
    setGroups: (state, action: PayloadAction<IngredientGroup[]>) => {
      state.groups = action.payload
    },
    addGroup: (state, action: PayloadAction<IngredientGroup>) => {
      state.groups.push(action.payload)
    },
    updateGroup: (state, action: PayloadAction<IngredientGroup>) => {
      const index = state.groups.findIndex(g => g.id === action.payload.id)
      if (index !== -1) {
        state.groups[index] = action.payload
      }
    },
    deleteGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter(g => g.id !== action.payload)
    },
    selectIngredient: (state, action: PayloadAction<string>) => {
      if (!state.selectedIngredients.includes(action.payload)) {
        state.selectedIngredients.push(action.payload)
      }
    },
    deselectIngredient: (state, action: PayloadAction<string>) => {
      state.selectedIngredients = state.selectedIngredients.filter(id => id !== action.payload)
    },
    clearSelection: (state) => {
      state.selectedIngredients = []
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    clearIngredients: () => initialState
  }
})

export const {
  setIngredients,
  addIngredient,
  updateIngredient,
  deleteIngredient,
  loadIngredient,
  unloadIngredient,
  setGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  selectIngredient,
  deselectIngredient,
  clearSelection,
  setLoading,
  setError,
  clearIngredients
} = ingredientSlice.actions

export default ingredientSlice.reducer

export const selectAllIngredients = (state: { ingredient: IngredientState }) => state.ingredient.ingredients
export const selectIngredientById = (id: string) => (state: { ingredient: IngredientState }) => 
  state.ingredient.ingredients.find(i => i.id === id)
export const selectLoadedIngredients = (state: { ingredient: IngredientState }) => state.ingredient.loadedIngredients
export const selectIngredientGroups = (state: { ingredient: IngredientState }) => state.ingredient.groups
export const selectSelectedIngredients = (state: { ingredient: IngredientState }) => state.ingredient.selectedIngredients
export const selectSharedIngredients = (state: { ingredient: IngredientState }) => 
  state.ingredient.ingredients.filter(i => i.isShared)
export const selectIngredientsByCategory = (category: IngredientCategory) => (state: { ingredient: IngredientState }) =>
  state.ingredient.ingredients.filter(i => i.category === category)
export const selectIngredientLoading = (state: { ingredient: IngredientState }) => state.ingredient.loading
export const selectIngredientError = (state: { ingredient: IngredientState }) => state.ingredient.error