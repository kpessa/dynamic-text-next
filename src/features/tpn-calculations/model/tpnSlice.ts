import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import type { 
  TPNInstance, 
  TPNValues, 
  TPNAdvisorType, 
  CalculationHistory 
} from '@/entities/tpn'

interface TPNState {
  instances: TPNInstance[]
  activeInstanceId: string | null
  advisorType: TPNAdvisorType
  calculations: {
    loading: boolean
    results: TPNValues | null
    errors: string[]
    warnings: string[]
  }
  history: CalculationHistory[]
}

const initialState: TPNState = {
  instances: [],
  activeInstanceId: null,
  advisorType: 'ADULT',
  calculations: {
    loading: false,
    results: null,
    errors: [],
    warnings: []
  },
  history: []
}

export const calculateValues = createAsyncThunk(
  'tpn/calculateValues',
  async (values: TPNValues) => {
    return values
  }
)

const tpnSlice = createSlice({
  name: 'tpn',
  initialState,
  reducers: {
    createInstance: (state, action: PayloadAction<TPNInstance>) => {
      state.instances.push(action.payload)
    },
    updateInstance: (state, action: PayloadAction<{ id: string; changes: Partial<TPNInstance> }>) => {
      const index = state.instances.findIndex(i => i.id === action.payload.id)
      if (index !== -1) {
        state.instances[index] = {
          ...state.instances[index],
          ...action.payload.changes,
          updatedAt: new Date().toISOString()
        }
      }
    },
    deleteInstance: (state, action: PayloadAction<string>) => {
      state.instances = state.instances.filter(i => i.id !== action.payload)
      if (state.activeInstanceId === action.payload) {
        state.activeInstanceId = null
      }
    },
    setActiveInstance: (state, action: PayloadAction<string>) => {
      state.activeInstanceId = action.payload
    },
    setAdvisorType: (state, action: PayloadAction<TPNAdvisorType>) => {
      state.advisorType = action.payload
    },
    clearCalculation: (state) => {
      state.calculations.results = null
      state.calculations.errors = []
      state.calculations.warnings = []
    },
    addToHistory: (state, action: PayloadAction<CalculationHistory>) => {
      state.history.push(action.payload)
    },
    clearHistory: (state) => {
      state.history = []
    },
    setCalculationError: (state, action: PayloadAction<string>) => {
      state.calculations.errors.push(action.payload)
    },
    addWarning: (state, action: PayloadAction<string>) => {
      state.calculations.warnings.push(action.payload)
    },
    clearWarnings: (state) => {
      state.calculations.warnings = []
    },
    saveCalculation: (state, action: PayloadAction<{ name: string; patientData: any }>) => {
      if (state.calculations.results) {
        const savedCalc: CalculationHistory = {
          id: Date.now().toString(),
          instanceId: state.activeInstanceId || 'default',
          timestamp: new Date().toISOString(),
          inputValues: action.payload.patientData,
          calculatedValues: state.calculations.results,
          advisorType: state.advisorType,
          userId: 'current-user' // Would come from auth in real app
        }
        state.history.push(savedCalc)
      }
    },
    loadCalculation: (state, action: PayloadAction<string>) => {
      const calc = state.history.find(h => h.id === action.payload)
      if (calc) {
        state.advisorType = calc.advisorType
        state.calculations.results = calc.calculatedValues
        state.calculations.warnings = []
      }
    },
    deleteCalculation: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter(h => h.id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(calculateValues.pending, (state) => {
        state.calculations.loading = true
        state.calculations.errors = []
      })
      .addCase(calculateValues.fulfilled, (state, action) => {
        state.calculations.loading = false
        state.calculations.results = action.payload
        state.calculations.errors = []
      })
      .addCase(calculateValues.rejected, (state, action) => {
        state.calculations.loading = false
        state.calculations.errors.push(action.error.message || 'Calculation failed')
      })
  }
})

export const {
  createInstance,
  updateInstance,
  deleteInstance,
  setActiveInstance,
  setAdvisorType,
  clearCalculation,
  addToHistory,
  clearHistory,
  setCalculationError,
  addWarning,
  clearWarnings,
  saveCalculation,
  loadCalculation,
  deleteCalculation
} = tpnSlice.actions

export const selectActiveInstance = (state: RootState): TPNInstance | null => {
  const id = state.tpn.activeInstanceId
  return id ? state.tpn.instances.find(i => i.id === id) || null : null
}

export const selectAllInstances = (state: RootState): TPNInstance[] => 
  state.tpn.instances

export const selectAdvisorType = (state: RootState): TPNAdvisorType => 
  state.tpn.advisorType

export const selectCalculationResults = (state: RootState): TPNValues | null => 
  state.tpn.calculations.results

export const selectCalculationHistory = (state: RootState): CalculationHistory[] => 
  state.tpn.history

export const selectCalculationErrors = (state: RootState): string[] => 
  state.tpn.calculations.errors

export const selectCalculationWarnings = (state: RootState): string[] => 
  state.tpn.calculations.warnings

export const selectCalculationLoading = (state: RootState): boolean => 
  state.tpn.calculations.loading

export default tpnSlice.reducer