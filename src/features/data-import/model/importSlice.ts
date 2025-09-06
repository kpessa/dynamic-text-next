import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ImportState {
  importing: boolean
  error: string | null
  lastImport: {
    timestamp: number
    type: string
    count: number
  } | null
  previewData: {
    data: unknown
    type: string
    itemCount: number
  } | null
}

const initialState: ImportState = {
  importing: false,
  error: null,
  lastImport: null,
  previewData: null
}

export const importSlice = createSlice({
  name: 'import',
  initialState,
  reducers: {
    importStart: (state) => {
      state.importing = true
      state.error = null
    },
    importSuccess: (state, action: PayloadAction<{ type: string; count: number }>) => {
      state.importing = false
      state.error = null
      state.lastImport = {
        timestamp: Date.now(),
        type: action.payload.type,
        count: action.payload.count
      }
    },
    importError: (state, action: PayloadAction<string>) => {
      state.importing = false
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setPreviewData: (state, action: PayloadAction<{ data: unknown; type: string; itemCount: number }>) => {
      state.importing = false
      state.previewData = action.payload
    },
    clearPreviewData: (state) => {
      state.previewData = null
    }
  }
})

export const {
  importStart,
  importSuccess,
  importError,
  clearError,
  setPreviewData,
  clearPreviewData
} = importSlice.actions

export default importSlice.reducer