import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { TPNConfiguration, Ingredient, FlexConfig, PopulationType } from '../types/schemas'

interface ImportHistoryItem {
  timestamp: number
  filename: string
  populationType: PopulationType
  ingredientCount: number
}

interface ConfigurationState {
  current: TPNConfiguration | null
  populationType: PopulationType | null
  healthSystem: string | null
  ingredients: Ingredient[]
  flexOverrides: FlexConfig[]
  importHistory: ImportHistoryItem[]
  isLoading: boolean
  error: string | null
}

const initialState: ConfigurationState = {
  current: null,
  populationType: null,
  healthSystem: null,
  ingredients: [],
  flexOverrides: [],
  importHistory: [],
  isLoading: false,
  error: null
}

export const configurationSlice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {
    setConfiguration: (state, action: PayloadAction<{
      config: TPNConfiguration,
      populationType: PopulationType,
      filename?: string
    }>) => {
      const { config, populationType, filename } = action.payload
      state.current = config
      state.populationType = populationType
      state.healthSystem = config.healthSystem || null
      state.ingredients = config.INGREDIENT
      state.flexOverrides = config.FLEX
      state.error = null
      
      // Add to import history
      if (filename) {
        state.importHistory.unshift({
          timestamp: Date.now(),
          filename,
          populationType,
          ingredientCount: config.INGREDIENT.length
        })
        // Keep only last 10 imports in history
        state.importHistory = state.importHistory.slice(0, 10)
      }
    },
    
    clearConfiguration: (state) => {
      state.current = null
      state.populationType = null
      state.healthSystem = null
      state.ingredients = []
      state.flexOverrides = []
      state.error = null
    },
    
    updateIngredients: (state, action: PayloadAction<Ingredient[]>) => {
      state.ingredients = action.payload
      if (state.current) {
        state.current.INGREDIENT = action.payload
      }
    },
    
    updateFlexOverrides: (state, action: PayloadAction<FlexConfig[]>) => {
      state.flexOverrides = action.payload
      if (state.current) {
        state.current.FLEX = action.payload
      }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    loadFromHistory: (state, action: PayloadAction<number>) => {
      const historyItem = state.importHistory[action.payload]
      if (historyItem) {
        // This would typically trigger a thunk to reload the configuration
        // For now, just set loading state
        state.isLoading = true
      }
    }
  }
})

export const {
  setConfiguration,
  clearConfiguration,
  updateIngredients,
  updateFlexOverrides,
  setLoading,
  setError,
  loadFromHistory
} = configurationSlice.actions

export default configurationSlice.reducer

// Selectors
export const selectConfiguration = (state: { configuration: ConfigurationState }) => state.configuration.current
export const selectIngredients = (state: { configuration: ConfigurationState }) => state.configuration.ingredients
export const selectPopulationType = (state: { configuration: ConfigurationState }) => state.configuration.populationType
export const selectFlexOverrides = (state: { configuration: ConfigurationState }) => state.configuration.flexOverrides
export const selectImportHistory = (state: { configuration: ConfigurationState }) => state.configuration.importHistory
export const selectConfigurationError = (state: { configuration: ConfigurationState }) => state.configuration.error
export const selectIsLoadingConfiguration = (state: { configuration: ConfigurationState }) => state.configuration.isLoading