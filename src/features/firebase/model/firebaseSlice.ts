import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface FirebaseState {
  isInitialized: boolean
  isConnected: boolean
  error: string | null
}

const initialState: FirebaseState = {
  isInitialized: false,
  isConnected: false,
  error: null
}

const firebaseSlice = createSlice({
  name: 'firebase',
  initialState,
  reducers: {
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload
      if (action.payload) {
        state.error = null
      }
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
      if (action.payload) {
        state.error = null
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      if (action.payload) {
        state.isConnected = false
      }
    },
    resetFirebaseState: () => initialState
  }
})

export const { 
  setInitialized, 
  setConnected, 
  setError, 
  resetFirebaseState 
} = firebaseSlice.actions

export default firebaseSlice.reducer