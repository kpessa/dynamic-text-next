import { describe, it, expect } from 'vitest'
import referenceReducer, {
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
  clearReferences,
  ReferenceState
} from '../referenceSlice'
import type { Reference, LoadedReference } from '../../types'

describe('Reference Slice', () => {
  const initialState: ReferenceState = {
    references: [],
    currentReference: null,
    documents: {},
    loadedReferences: [],
    loading: false,
    error: null,
    lastFetch: null
  }

  const mockReference: Reference = {
    id: 'ref-1',
    name: 'Test Reference',
    healthSystem: 'test-system',
    populationType: 'NEO',
    validationStatus: 'draft',
    sections: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }

  const mockLoadedReference: LoadedReference = {
    id: 'ref-1',
    name: 'Test Reference',
    healthSystem: 'test-system',
    populationType: 'NEO',
    sections: [],
    isLoaded: true,
    loadedAt: '2025-01-01T00:00:00Z'
  }

  it('should return initial state', () => {
    expect(referenceReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should handle setReferences', () => {
    const actual = referenceReducer(initialState, setReferences([mockReference]))
    expect(actual.references).toEqual([mockReference])
    expect(actual.lastFetch).toBeTruthy()
    expect(actual.error).toBe(null)
  })

  it('should handle addReference', () => {
    const actual = referenceReducer(initialState, addReference(mockReference))
    expect(actual.references).toContain(mockReference)
  })

  it('should handle updateReference', () => {
    const stateWithRef = { ...initialState, references: [mockReference] }
    const updated = { ...mockReference, name: 'Updated Reference' }
    const actual = referenceReducer(stateWithRef, updateReference(updated))
    expect(actual.references[0].name).toBe('Updated Reference')
  })

  it('should handle deleteReference', () => {
    const stateWithRef = { 
      ...initialState, 
      references: [mockReference],
      currentReference: mockReference
    }
    const actual = referenceReducer(stateWithRef, deleteReference('ref-1'))
    expect(actual.references).toHaveLength(0)
    expect(actual.currentReference).toBe(null)
  })

  it('should handle loadReference', () => {
    const actual = referenceReducer(initialState, loadReference(mockLoadedReference))
    expect(actual.loadedReferences).toContain(mockLoadedReference)
  })

  it('should update existing loaded reference', () => {
    const stateWithLoaded = { 
      ...initialState, 
      loadedReferences: [mockLoadedReference] 
    }
    const updatedLoaded = { ...mockLoadedReference, name: 'Updated Loaded' }
    const actual = referenceReducer(stateWithLoaded, loadReference(updatedLoaded))
    expect(actual.loadedReferences).toHaveLength(1)
    expect(actual.loadedReferences[0].name).toBe('Updated Loaded')
  })

  it('should handle unloadReference', () => {
    const stateWithLoaded = { 
      ...initialState, 
      loadedReferences: [mockLoadedReference] 
    }
    const actual = referenceReducer(stateWithLoaded, unloadReference('ref-1'))
    expect(actual.loadedReferences).toHaveLength(0)
  })

  it('should handle setLoading', () => {
    const actual = referenceReducer(initialState, setLoading(true))
    expect(actual.loading).toBe(true)
  })

  it('should handle setError', () => {
    const actual = referenceReducer(initialState, setError('Test error'))
    expect(actual.error).toBe('Test error')
    expect(actual.loading).toBe(false)
  })

  it('should handle clearReferences', () => {
    const stateWithData = {
      references: [mockReference],
      currentReference: mockReference,
      documents: { 'ref-1': [] },
      loadedReferences: [mockLoadedReference],
      loading: true,
      error: 'Some error',
      lastFetch: '2025-01-01'
    }
    const actual = referenceReducer(stateWithData, clearReferences())
    expect(actual).toEqual(initialState)
  })
})