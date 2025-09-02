import { describe, it, expect } from 'vitest'
import authReducer, { 
  setUser, 
  clearError, 
  loginUser,
  logoutUser 
} from '../authSlice'

describe('auth slice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setUser', () => {
    const user = { id: '1', email: 'test@example.com', name: 'Test User' }
    const actual = authReducer(initialState, setUser(user))
    expect(actual.user).toEqual(user)
    expect(actual.isAuthenticated).toBe(true)
  })

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Some error' }
    const actual = authReducer(stateWithError, clearError())
    expect(actual.error).toBe(null)
  })

  it('should handle loginUser.pending', () => {
    const action = { type: loginUser.pending.type }
    const state = authReducer(initialState, action)
    expect(state.isLoading).toBe(true)
    expect(state.error).toBe(null)
  })

  it('should handle loginUser.fulfilled', () => {
    const user = { id: '1', email: 'test@example.com', name: 'Test User' }
    const action = { 
      type: loginUser.fulfilled.type, 
      payload: user 
    }
    const state = authReducer(initialState, action)
    expect(state.user).toEqual(user)
    expect(state.isAuthenticated).toBe(true)
    expect(state.isLoading).toBe(false)
  })

  it('should handle loginUser.rejected', () => {
    const action = { 
      type: loginUser.rejected.type, 
      error: { message: 'Login failed' }
    }
    const state = authReducer(initialState, action)
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe('Login failed')
  })

  it('should handle logoutUser.fulfilled', () => {
    const stateWithUser = {
      ...initialState,
      user: { id: '1', email: 'test@example.com', name: 'Test User' },
      isAuthenticated: true
    }
    const action = { type: logoutUser.fulfilled.type }
    const state = authReducer(stateWithUser, action)
    expect(state.user).toBe(null)
    expect(state.isAuthenticated).toBe(false)
    expect(state.error).toBe(null)
  })
})