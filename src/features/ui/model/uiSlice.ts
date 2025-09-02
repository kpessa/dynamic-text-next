import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  loading: boolean
  notification: {
    show: boolean
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  } | null
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  loading: false,
  notification: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    showNotification: (state, action: PayloadAction<{
      message: string
      type: 'success' | 'error' | 'info' | 'warning'
    }>) => {
      state.notification = {
        show: true,
        message: action.payload.message,
        type: action.payload.type,
      }
    },
    hideNotification: (state) => {
      state.notification = null
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  setLoading,
  showNotification,
  hideNotification,
} = uiSlice.actions

// Selectors
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen
export const selectTheme = (state: RootState) => state.ui.theme
export const selectLoading = (state: RootState) => state.ui.loading
export const selectNotification = (state: RootState) => state.ui.notification

export default uiSlice.reducer