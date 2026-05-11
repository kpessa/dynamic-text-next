/**
 * Shared Model for Selected Ingredient State
 * This is in the shared layer so it can be used by any layer above it
 * Following FSD principles - shared layer is accessible to all layers
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Ingredient } from '@/entities/ingredient/types'

interface SelectedIngredientState {
  selectedIngredient: Ingredient | null
  isEditingSection: boolean
  hasUnsavedChanges: boolean
}

const initialState: SelectedIngredientState = {
  selectedIngredient: null,
  isEditingSection: false,
  hasUnsavedChanges: false,
}

const selectedIngredientSlice = createSlice({
  name: 'selectedIngredient',
  initialState,
  reducers: {
    setSelectedIngredient: (state, action: PayloadAction<Ingredient | null>) => {
      state.selectedIngredient = action.payload
      state.isEditingSection = !!action.payload
      state.hasUnsavedChanges = false
    },
    updateSelectedIngredient: (state, action: PayloadAction<Ingredient>) => {
      // Update the selected ingredient with new data (e.g., after loading from Firebase)
      if (state.selectedIngredient?.id === action.payload.id) {
        state.selectedIngredient = action.payload
      }
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
  setSelectedIngredient,
  updateSelectedIngredient,
  clearSelectedIngredient, 
  setHasUnsavedChanges,
  setIsEditingSection 
} = selectedIngredientSlice.actions

export default selectedIngredientSlice.reducer

// Selectors
export const selectSelectedIngredient = (state: any) => state.selectedIngredient?.selectedIngredient
export const selectIsEditingSection = (state: any) => state.selectedIngredient?.isEditingSection
export const selectHasUnsavedChanges = (state: any) => state.selectedIngredient?.hasUnsavedChanges