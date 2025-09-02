import { describe, it, expect } from 'vitest'
import uiReducer, {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  setLoading,
  showNotification,
  hideNotification
} from '../uiSlice'

describe('ui slice', () => {
  const initialState = {
    sidebarOpen: true,
    theme: 'light' as const,
    loading: false,
    notification: null,
  }

  it('should handle initial state', () => {
    expect(uiReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle toggleSidebar', () => {
    const state = uiReducer(initialState, toggleSidebar())
    expect(state.sidebarOpen).toBe(false)
    
    const state2 = uiReducer(state, toggleSidebar())
    expect(state2.sidebarOpen).toBe(true)
  })

  it('should handle setSidebarOpen', () => {
    const state = uiReducer(initialState, setSidebarOpen(false))
    expect(state.sidebarOpen).toBe(false)
  })

  it('should handle setTheme', () => {
    const state = uiReducer(initialState, setTheme('dark'))
    expect(state.theme).toBe('dark')
  })

  it('should handle toggleTheme', () => {
    const state = uiReducer(initialState, toggleTheme())
    expect(state.theme).toBe('dark')
    
    const state2 = uiReducer(state, toggleTheme())
    expect(state2.theme).toBe('light')
  })

  it('should handle setLoading', () => {
    const state = uiReducer(initialState, setLoading(true))
    expect(state.loading).toBe(true)
  })

  it('should handle showNotification', () => {
    const notification = {
      message: 'Test notification',
      type: 'success' as const
    }
    const state = uiReducer(initialState, showNotification(notification))
    expect(state.notification).toEqual({
      show: true,
      message: 'Test notification',
      type: 'success'
    })
  })

  it('should handle hideNotification', () => {
    const stateWithNotification = {
      ...initialState,
      notification: {
        show: true,
        message: 'Test',
        type: 'info' as const
      }
    }
    const state = uiReducer(stateWithNotification, hideNotification())
    expect(state.notification).toBe(null)
  })
})