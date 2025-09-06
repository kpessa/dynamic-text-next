import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Reference, ReferenceDocument, LoadedReference } from '../types'

export interface ReferenceState {
  references: Reference[]
  currentReference: Reference | null
  documents: Record<string, ReferenceDocument[]>
  loadedReferences: LoadedReference[]
  loading: boolean
  error: string | null
  lastFetch: string | null
}

const initialState: ReferenceState = {
  references: [],
  currentReference: null,
  documents: {},
  loadedReferences: [],
  loading: false,
  error: null,
  lastFetch: null
}

const referenceSlice = createSlice({
  name: 'reference',
  initialState,
  reducers: {
    setReferences: (state, action: PayloadAction<Reference[]>) => {
      state.references = action.payload
      state.lastFetch = new Date().toISOString()
      state.error = null
    },
    addReference: (state, action: PayloadAction<Reference>) => {
      state.references.push(action.payload)
    },
    updateReference: (state, action: PayloadAction<Reference>) => {
      const index = state.references.findIndex(r => r.id === action.payload.id)
      if (index !== -1) {
        state.references[index] = action.payload
      }
      if (state.currentReference?.id === action.payload.id) {
        state.currentReference = action.payload
      }
    },
    deleteReference: (state, action: PayloadAction<string>) => {
      state.references = state.references.filter(r => r.id !== action.payload)
      if (state.currentReference?.id === action.payload) {
        state.currentReference = null
      }
      delete state.documents[action.payload]
    },
    setCurrentReference: (state, action: PayloadAction<Reference | null>) => {
      state.currentReference = action.payload
    },
    setDocuments: (state, action: PayloadAction<{ referenceId: string; documents: ReferenceDocument[] }>) => {
      state.documents[action.payload.referenceId] = action.payload.documents
    },
    loadReference: (state, action: PayloadAction<LoadedReference>) => {
      const existing = state.loadedReferences.findIndex(r => r.id === action.payload.id)
      if (existing !== -1) {
        state.loadedReferences[existing] = action.payload
      } else {
        state.loadedReferences.push(action.payload)
      }
    },
    unloadReference: (state, action: PayloadAction<string>) => {
      state.loadedReferences = state.loadedReferences.filter(r => r.id !== action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    clearReferences: () => initialState
  }
})

export const {
  setReferences,
  addReference,
  updateReference,
  deleteReference,
  setCurrentReference,
  setDocuments,
  loadReference,
  unloadReference,
  setLoading,
  setError,
  clearReferences
} = referenceSlice.actions

export default referenceSlice.reducer

export const selectAllReferences = (state: { reference: ReferenceState }) => state.reference.references
export const selectCurrentReference = (state: { reference: ReferenceState }) => state.reference.currentReference
export const selectReferenceById = (id: string) => (state: { reference: ReferenceState }) => 
  state.reference.references.find(r => r.id === id)
export const selectDocumentsByReferenceId = (referenceId: string) => (state: { reference: ReferenceState }) =>
  state.reference.documents[referenceId] || []
export const selectLoadedReferences = (state: { reference: ReferenceState }) => state.reference.loadedReferences
export const selectReferenceLoading = (state: { reference: ReferenceState }) => state.reference.loading
export const selectReferenceError = (state: { reference: ReferenceState }) => state.reference.error