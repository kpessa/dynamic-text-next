import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Ingredient {
  id: string
  displayName: string
  category: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  sodium?: number
  potassium?: number
  [key: string]: any
}

interface IngredientState {
  items: Ingredient[]
  loading: boolean
  error: string | null
  duplicates: string[]
  importDialogOpen: boolean
}

const initialState: IngredientState = {
  items: [],
  loading: false,
  error: null,
  duplicates: [],
  importDialogOpen: false,
}

const ingredientSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    setIngredients: (state, action: PayloadAction<Ingredient[]>) => {
      state.items = action.payload
    },
    addIngredient: (state, action: PayloadAction<Ingredient>) => {
      state.items.push(action.payload)
    },
    updateIngredient: (state, action: PayloadAction<{ id: string; changes: Partial<Ingredient> }>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.changes }
      }
    },
    deleteIngredient: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setDuplicates: (state, action: PayloadAction<string[]>) => {
      state.duplicates = action.payload
    },
    setImportDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.importDialogOpen = action.payload
    },
    clearIngredients: (state) => {
      state.items = []
      state.duplicates = []
    },
  },
})

export const {
  setIngredients,
  addIngredient,
  updateIngredient,
  deleteIngredient,
  setLoading,
  setError,
  setDuplicates,
  setImportDialogOpen,
  clearIngredients,
} = ingredientSlice.actions

export default ingredientSlice.reducer