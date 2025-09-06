import { describe, it, expect, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import tpnReducer, {
  setActiveInstance,
  createInstance,
  updateInstance,
  deleteInstance,
  setAdvisorType,
  calculateValues,
  clearCalculation,
  addToHistory,
  clearHistory,
  setCalculationError,
  addWarning,
  clearWarnings,
  selectActiveInstance,
  selectAllInstances,
  selectAdvisorType,
  selectCalculationResults,
  selectCalculationHistory,
  selectCalculationErrors,
  selectCalculationWarnings
} from './tpnSlice'
import type { TPNInstance, TPNValues, CalculationHistory } from '@/entities/tpn'

describe('TPN Redux Slice', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        tpn: tpnReducer
      }
    })
  })

  describe('Instance Management', () => {
    it('should create a new TPN instance', () => {
      const instance: TPNInstance = {
        id: 'test-1',
        advisorType: 'ADULT',
        patientId: 'patient-1',
        values: { weight: 70 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      store.dispatch(createInstance(instance))
      const state = store.getState()
      
      expect(selectAllInstances(state)).toHaveLength(1)
      expect(selectAllInstances(state)[0]).toEqual(instance)
    })

    it('should set active instance', () => {
      const instance: TPNInstance = {
        id: 'test-1',
        advisorType: 'ADULT',
        patientId: 'patient-1',
        values: { weight: 70 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      store.dispatch(createInstance(instance))
      store.dispatch(setActiveInstance('test-1'))
      
      const state = store.getState()
      expect(selectActiveInstance(state)).toEqual(instance)
    })

    it('should update an existing instance', () => {
      const instance: TPNInstance = {
        id: 'test-1',
        advisorType: 'ADULT',
        patientId: 'patient-1',
        values: { weight: 70 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      store.dispatch(createInstance(instance))
      store.dispatch(updateInstance({
        id: 'test-1',
        changes: { values: { weight: 75, height: 180 } }
      }))

      const state = store.getState()
      const updated = selectAllInstances(state)[0]
      
      expect(updated.values).toEqual({ weight: 75, height: 180 })
    })

    it('should delete an instance', () => {
      const instance: TPNInstance = {
        id: 'test-1',
        advisorType: 'ADULT',
        patientId: 'patient-1',
        values: { weight: 70 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      store.dispatch(createInstance(instance))
      store.dispatch(deleteInstance('test-1'))
      
      const state = store.getState()
      expect(selectAllInstances(state)).toHaveLength(0)
    })
  })

  describe('Advisor Type', () => {
    it('should set advisor type', () => {
      store.dispatch(setAdvisorType('NEO'))
      const state = store.getState()
      expect(selectAdvisorType(state)).toBe('NEO')
    })

    it('should default to ADULT advisor type', () => {
      const state = store.getState()
      expect(selectAdvisorType(state)).toBe('ADULT')
    })
  })

  describe('Calculations', () => {
    it('should store calculation results', async () => {
      const results: TPNValues = {
        calories: 2100,
        protein: 84,
        carbohydrates: 300,
        lipids: 70,
        sodium: 140,
        potassium: 80,
        calcium: 10,
        magnesium: 8,
        phosphorus: 30
      }

      await store.dispatch(calculateValues(results))
      const state = store.getState()
      
      expect(selectCalculationResults(state)).toEqual(results)
    })

    it('should clear calculation results', async () => {
      const results: TPNValues = {
        calories: 2100,
        protein: 84,
        carbohydrates: 300,
        lipids: 70,
        sodium: 140,
        potassium: 80,
        calcium: 10,
        magnesium: 8,
        phosphorus: 30
      }

      await store.dispatch(calculateValues(results))
      store.dispatch(clearCalculation())
      
      const state = store.getState()
      expect(selectCalculationResults(state)).toBeNull()
    })

    it('should set calculation loading state', () => {
      store.dispatch(calculateValues.pending('', undefined))
      const state = store.getState()
      expect(state.tpn.calculations.loading).toBe(true)
    })
  })

  describe('Calculation History', () => {
    it('should add to calculation history', () => {
      const historyEntry: CalculationHistory = {
        id: 'calc-1',
        instanceId: 'instance-1',
        timestamp: new Date().toISOString(),
        inputValues: { weight: 70 },
        calculatedValues: {
          calories: 2100,
          protein: 84,
          carbohydrates: 300,
          lipids: 70,
          sodium: 140,
          potassium: 80,
          calcium: 10,
          magnesium: 8,
          phosphorus: 30
        },
        advisorType: 'ADULT',
        userId: 'user-1'
      }

      store.dispatch(addToHistory(historyEntry))
      const state = store.getState()
      
      expect(selectCalculationHistory(state)).toHaveLength(1)
      expect(selectCalculationHistory(state)[0]).toEqual(historyEntry)
    })

    it('should clear calculation history', () => {
      const historyEntry: CalculationHistory = {
        id: 'calc-1',
        instanceId: 'instance-1',
        timestamp: new Date().toISOString(),
        inputValues: { weight: 70 },
        calculatedValues: {
          calories: 2100,
          protein: 84,
          carbohydrates: 300,
          lipids: 70,
          sodium: 140,
          potassium: 80,
          calcium: 10,
          magnesium: 8,
          phosphorus: 30
        },
        advisorType: 'ADULT',
        userId: 'user-1'
      }

      store.dispatch(addToHistory(historyEntry))
      store.dispatch(clearHistory())
      
      const state = store.getState()
      expect(selectCalculationHistory(state)).toHaveLength(0)
    })
  })

  describe('Error Handling', () => {
    it('should set calculation errors', () => {
      store.dispatch(setCalculationError('Invalid weight value'))
      const state = store.getState()
      
      expect(selectCalculationErrors(state)).toContain('Invalid weight value')
    })

    it('should clear errors on new calculation', async () => {
      store.dispatch(setCalculationError('Error 1'))
      await store.dispatch(calculateValues({
        calories: 2100,
        protein: 84,
        carbohydrates: 300,
        lipids: 70,
        sodium: 140,
        potassium: 80,
        calcium: 10,
        magnesium: 8,
        phosphorus: 30
      }))
      
      const state = store.getState()
      expect(selectCalculationErrors(state)).toHaveLength(0)
    })
  })

  describe('Warnings', () => {
    it('should add warnings', () => {
      store.dispatch(addWarning('Sodium level above recommended range'))
      const state = store.getState()
      
      expect(selectCalculationWarnings(state)).toContain('Sodium level above recommended range')
    })

    it('should clear warnings', () => {
      store.dispatch(addWarning('Warning 1'))
      store.dispatch(addWarning('Warning 2'))
      store.dispatch(clearWarnings())
      
      const state = store.getState()
      expect(selectCalculationWarnings(state)).toHaveLength(0)
    })
  })
})