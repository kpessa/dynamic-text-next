import { describe, it, expect } from 'vitest'
import tpnReducer, {
  setTPNValue,
  setTPNValues,
  setPopulationType,
  calculateTPN,
  resetTPN
} from '../tpnSlice'

describe('tpn slice', () => {
  const initialState = {
    values: {},
    populationType: 'Adult' as const,
    isDirty: false,
    lastCalculated: null,
  }

  it('should handle initial state', () => {
    expect(tpnReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setTPNValue', () => {
    const action = setTPNValue({ key: 'glucose', value: 100 })
    const state = tpnReducer(initialState, action)
    expect(state.values.glucose).toBe(100)
    expect(state.isDirty).toBe(true)
  })

  it('should handle setTPNValues', () => {
    const values = {
      glucose: 100,
      sodium: 50,
      potassium: 30
    }
    const action = setTPNValues(values)
    const state = tpnReducer(initialState, action)
    expect(state.values).toEqual(values)
    expect(state.isDirty).toBe(true)
  })

  it('should handle setPopulationType', () => {
    const action = setPopulationType('Pediatric')
    const state = tpnReducer(initialState, action)
    expect(state.populationType).toBe('Pediatric')
  })

  it('should handle calculateTPN', () => {
    const dirtyState = { ...initialState, isDirty: true }
    const action = calculateTPN()
    const state = tpnReducer(dirtyState, action)
    expect(state.isDirty).toBe(false)
    expect(state.lastCalculated).toBeTruthy()
  })

  it('should handle resetTPN', () => {
    const modifiedState = {
      values: { glucose: 100 },
      populationType: 'Pediatric' as const,
      isDirty: true,
      lastCalculated: '2024-01-01T00:00:00.000Z'
    }
    const action = resetTPN()
    const state = tpnReducer(modifiedState, action)
    expect(state).toEqual(initialState)
  })
})