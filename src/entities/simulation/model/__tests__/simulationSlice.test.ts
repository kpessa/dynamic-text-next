import { describe, it, expect } from 'vitest'
import simulationReducer, {
  setSimulations,
  addSimulation,
  updateSimulation,
  deleteSimulation,
  setCurrentSimulation,
  setSections,
  setLoading,
  setError,
  clearSimulations,
  SimulationState
} from '../simulationSlice'
import type { TPNSimulation, SimulationSection } from '../../types'

describe('Simulation Slice', () => {
  const initialState: SimulationState = {
    simulations: [],
    currentSimulation: null,
    sections: {},
    loading: false,
    error: null,
    lastFetch: null
  }

  const mockSimulation: TPNSimulation = {
    id: 'sim-1',
    name: 'Test Simulation',
    advisorType: 'NEO',
    patientProfile: {
      age: 1,
      weight: 3.5
    },
    sections: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }

  const mockSection: SimulationSection = {
    id: 'sec-1',
    simulationId: 'sim-1',
    name: 'Test Section',
    content: 'Test content',
    order: 1,
    testCases: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }

  it('should return initial state', () => {
    expect(simulationReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setSimulations', () => {
    const actual = simulationReducer(initialState, setSimulations([mockSimulation]))
    expect(actual.simulations).toEqual([mockSimulation])
    expect(actual.lastFetch).toBeTruthy()
    expect(actual.error).toBe(null)
  })

  it('should handle addSimulation', () => {
    const actual = simulationReducer(initialState, addSimulation(mockSimulation))
    expect(actual.simulations).toContain(mockSimulation)
  })

  it('should handle updateSimulation', () => {
    const stateWithSim = { ...initialState, simulations: [mockSimulation] }
    const updated = { ...mockSimulation, name: 'Updated Simulation' }
    const actual = simulationReducer(stateWithSim, updateSimulation(updated))
    expect(actual.simulations[0].name).toBe('Updated Simulation')
  })

  it('should handle deleteSimulation', () => {
    const stateWithSim = { 
      ...initialState, 
      simulations: [mockSimulation],
      sections: { 'sim-1': [mockSection] }
    }
    const actual = simulationReducer(stateWithSim, deleteSimulation('sim-1'))
    expect(actual.simulations).toHaveLength(0)
    expect(actual.sections['sim-1']).toBeUndefined()
  })

  it('should handle setCurrentSimulation', () => {
    const actual = simulationReducer(initialState, setCurrentSimulation(mockSimulation))
    expect(actual.currentSimulation).toEqual(mockSimulation)
  })

  it('should handle setSections', () => {
    const actual = simulationReducer(initialState, setSections({
      simulationId: 'sim-1',
      sections: [mockSection]
    }))
    expect(actual.sections['sim-1']).toEqual([mockSection])
  })

  it('should handle setLoading', () => {
    const actual = simulationReducer(initialState, setLoading(true))
    expect(actual.loading).toBe(true)
  })

  it('should handle setError', () => {
    const actual = simulationReducer(initialState, setError('Test error'))
    expect(actual.error).toBe('Test error')
    expect(actual.loading).toBe(false)
  })

  it('should handle clearSimulations', () => {
    const stateWithData = {
      simulations: [mockSimulation],
      currentSimulation: mockSimulation,
      sections: { 'sim-1': [mockSection] },
      loading: true,
      error: 'Some error',
      lastFetch: '2025-01-01'
    }
    const actual = simulationReducer(stateWithData, clearSimulations())
    expect(actual).toEqual(initialState)
  })
})