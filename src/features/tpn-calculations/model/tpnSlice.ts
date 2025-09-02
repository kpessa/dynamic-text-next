import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'

export interface TPNValues {
  [key: string]: number | string | undefined
}

interface TPNState {
  values: TPNValues
  populationType: 'Neonatal' | 'Pediatric' | 'Adolescent' | 'Adult'
  isDirty: boolean
  lastCalculated: string | null
}

const initialState: TPNState = {
  values: {},
  populationType: 'Adult',
  isDirty: false,
  lastCalculated: null,
}

const tpnSlice = createSlice({
  name: 'tpn',
  initialState,
  reducers: {
    setTPNValue: (state, action: PayloadAction<{ key: string; value: number | string }>) => {
      state.values[action.payload.key] = action.payload.value
      state.isDirty = true
    },
    setTPNValues: (state, action: PayloadAction<TPNValues>) => {
      state.values = action.payload
      state.isDirty = true
    },
    setPopulationType: (state, action: PayloadAction<TPNState['populationType']>) => {
      state.populationType = action.payload
    },
    calculateTPN: (state) => {
      state.isDirty = false
      state.lastCalculated = new Date().toISOString()
    },
    resetTPN: () => initialState,
  },
})

export const { setTPNValue, setTPNValues, setPopulationType, calculateTPN, resetTPN } = tpnSlice.actions

// Selectors
export const selectTPNValues = (state: RootState) => state.tpn.values
export const selectTPNValue = (key: string) => (state: RootState) => state.tpn.values[key]
export const selectPopulationType = (state: RootState) => state.tpn.populationType
export const selectTPNIsDirty = (state: RootState) => state.tpn.isDirty

export default tpnSlice.reducer