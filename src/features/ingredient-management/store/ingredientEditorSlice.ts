import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Ingredient } from '@/entities/ingredient/types'

interface EditorState {
  selectedIngredient: Ingredient | null
  isEditingSection: boolean
  hasUnsavedChanges: boolean
}

const initialState: EditorState = {
  selectedIngredient: null,
  isEditingSection: false,
  hasUnsavedChanges: false,
}

const editorSlice = createSlice({
  name: 'ingredientEditor',
  initialState,
  reducers: {
    selectIngredient: (state, action: PayloadAction<Ingredient>) => {
      state.selectedIngredient = action.payload
      state.isEditingSection = true
      state.hasUnsavedChanges = false
    },
    clearSelectedIngredient: (state) => {
      state.selectedIngredient = null
      state.isEditingSection = false
      state.hasUnsavedChanges = false
    },
    setHasUnsavedChanges: (state, action: PayloadAction<boolean>) => {
      state.hasUnsavedChanges = action.payload
    },
    setIsEditingSection: (state, action: PayloadAction<boolean>) => {
      state.isEditingSection = action.payload
    },
  },
})

export const { 
  selectIngredient, 
  clearSelectedIngredient, 
  setHasUnsavedChanges,
  setIsEditingSection 
} = editorSlice.actions
export default editorSlice.reducer