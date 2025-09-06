import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { TPNSimulation, SimulationSection } from '../types'

export interface SimulationState {
  simulations: TPNSimulation[]
  currentSimulation: TPNSimulation | null
  sections: Record<string, SimulationSection[]>
  loading: boolean
  error: string | null
  lastFetch: string | null
}

const initialState: SimulationState = {
  simulations: [],
  currentSimulation: null,
  sections: {},
  loading: false,
  error: null,
  lastFetch: null
}

const simulationSlice = createSlice({
  name: 'simulation',
  initialState,
  reducers: {
    setSimulations: (state, action: PayloadAction<TPNSimulation[]>) => {
      state.simulations = action.payload
      state.lastFetch = new Date().toISOString()
      state.error = null
    },
    addSimulation: (state, action: PayloadAction<TPNSimulation>) => {
      state.simulations.push(action.payload)
    },
    updateSimulation: (state, action: PayloadAction<TPNSimulation>) => {
      const index = state.simulations.findIndex(s => s.id === action.payload.id)
      if (index !== -1) {
        state.simulations[index] = action.payload
      }
      if (state.currentSimulation?.id === action.payload.id) {
        state.currentSimulation = action.payload
      }
    },
    deleteSimulation: (state, action: PayloadAction<string>) => {
      state.simulations = state.simulations.filter(s => s.id !== action.payload)
      if (state.currentSimulation?.id === action.payload) {
        state.currentSimulation = null
      }
      delete state.sections[action.payload]
    },
    setCurrentSimulation: (state, action: PayloadAction<TPNSimulation | null>) => {
      state.currentSimulation = action.payload
    },
    setSections: (state, action: PayloadAction<{ simulationId: string; sections: SimulationSection[] }>) => {
      state.sections[action.payload.simulationId] = action.payload.sections
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    clearSimulations: () => initialState
  }
})

export const {
  setSimulations,
  addSimulation,
  updateSimulation,
  deleteSimulation,
  setCurrentSimulation,
  setSections,
  setLoading,
  setError,
  clearSimulations
} = simulationSlice.actions

export default simulationSlice.reducer

export const selectAllSimulations = (state: { simulation: SimulationState }) => state.simulation.simulations
export const selectCurrentSimulation = (state: { simulation: SimulationState }) => state.simulation.currentSimulation
export const selectSimulationById = (id: string) => (state: { simulation: SimulationState }) => 
  state.simulation.simulations.find(s => s.id === id)
export const selectSectionsBySimulationId = (simulationId: string) => (state: { simulation: SimulationState }) =>
  state.simulation.sections[simulationId] || []
export const selectSimulationLoading = (state: { simulation: SimulationState }) => state.simulation.loading
export const selectSimulationError = (state: { simulation: SimulationState }) => state.simulation.error