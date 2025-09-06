import { describe, it, expect } from 'vitest'
import firebaseReducer, {
  setInitialized,
  setConnected,
  setError,
  resetFirebaseState,
  FirebaseState
} from '../firebaseSlice'

describe('Firebase Slice', () => {
  const initialState: FirebaseState = {
    isInitialized: false,
    isConnected: false,
    error: null
  }

  it('should return the initial state', () => {
    expect(firebaseReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setInitialized', () => {
    const actual = firebaseReducer(initialState, setInitialized(true))
    expect(actual.isInitialized).toBe(true)
    expect(actual.error).toBe(null)
  })

  it('should handle setConnected', () => {
    const actual = firebaseReducer(initialState, setConnected(true))
    expect(actual.isConnected).toBe(true)
    expect(actual.error).toBe(null)
  })

  it('should handle setError', () => {
    const stateWithConnection = { ...initialState, isConnected: true }
    const actual = firebaseReducer(stateWithConnection, setError('Test error'))
    expect(actual.error).toBe('Test error')
    expect(actual.isConnected).toBe(false)
  })

  it('should clear error when connected', () => {
    const stateWithError = { ...initialState, error: 'Some error' }
    const actual = firebaseReducer(stateWithError, setConnected(true))
    expect(actual.error).toBe(null)
    expect(actual.isConnected).toBe(true)
  })

  it('should clear error when initialized', () => {
    const stateWithError = { ...initialState, error: 'Some error' }
    const actual = firebaseReducer(stateWithError, setInitialized(true))
    expect(actual.error).toBe(null)
    expect(actual.isInitialized).toBe(true)
  })

  it('should handle resetFirebaseState', () => {
    const modifiedState: FirebaseState = {
      isInitialized: true,
      isConnected: true,
      error: 'Some error'
    }
    const actual = firebaseReducer(modifiedState, resetFirebaseState())
    expect(actual).toEqual(initialState)
  })

  it('should not affect connection when clearing error', () => {
    const stateWithConnection = { 
      isInitialized: true, 
      isConnected: true, 
      error: 'Some error' 
    }
    const actual = firebaseReducer(stateWithConnection, setError(null))
    expect(actual.error).toBe(null)
    expect(actual.isConnected).toBe(true)
  })
})