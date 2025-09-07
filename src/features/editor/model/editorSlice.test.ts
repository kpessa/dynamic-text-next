/**
 * Editor Slice Tests
 */

import { describe, it, expect } from 'vitest'
import reducer, {
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  setActiveSection,
  addIngredient,
  removeIngredient,
  setIngredients,
  setTestResults,
  setPreviewContent,
  setDirty,
  resetEditor,
  loadDocument
} from './editorSlice'
import { Section, LoadedIngredient } from '@/shared/types/section'

describe('editorSlice', () => {
  const initialState = {
    sections: [],
    activeSectionId: null,
    testResults: null,
    isDirty: false,
    ingredients: expect.any(Array),
    previewContent: ''
  }

  it('should return the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' })
    expect(state).toMatchObject(initialState)
  })

  describe('Section management', () => {
    it('should handle addSection', () => {
      const section: Section = {
        id: 1,
        type: 'static',
        name: 'Test Section',
        content: 'Test content',
        testCases: []
      }
      const state = reducer(initialState, addSection(section))
      expect(state.sections).toHaveLength(1)
      expect(state.sections[0]).toEqual(section)
      expect(state.isDirty).toBe(true)
    })

    it('should handle updateSection', () => {
      const section: Section = {
        id: 1,
        type: 'static',
        name: 'Test Section',
        content: 'Test content',
        testCases: []
      }
      const stateWithSection = reducer(initialState, addSection(section))
      
      const updatedSection = { ...section, name: 'Updated Section' }
      const state = reducer(stateWithSection, updateSection(updatedSection))
      
      expect(state.sections[0].name).toBe('Updated Section')
      expect(state.isDirty).toBe(true)
    })

    it('should handle deleteSection', () => {
      const section: Section = {
        id: 1,
        type: 'static',
        name: 'Test Section',
        content: 'Test content',
        testCases: []
      }
      const stateWithSection = reducer(initialState, addSection(section))
      const stateWithActive = reducer(stateWithSection, setActiveSection(1))
      
      const state = reducer(stateWithActive, deleteSection(1))
      
      expect(state.sections).toHaveLength(0)
      expect(state.activeSectionId).toBeNull()
      expect(state.isDirty).toBe(true)
    })

    it('should handle reorderSections', () => {
      const section1: Section = {
        id: 1,
        type: 'static',
        name: 'Section 1',
        content: 'Content 1',
        testCases: []
      }
      const section2: Section = {
        id: 2,
        type: 'dynamic',
        name: 'Section 2',
        content: 'Content 2',
        testCases: []
      }
      
      let state = reducer(initialState, addSection(section1))
      state = reducer(state, addSection(section2))
      
      state = reducer(state, reorderSections({ sourceIndex: 0, destinationIndex: 1 }))
      
      expect(state.sections[0].id).toBe(2)
      expect(state.sections[1].id).toBe(1)
      expect(state.isDirty).toBe(true)
    })
  })

  describe('State management', () => {
    it('should handle setActiveSection', () => {
      const state = reducer(initialState, setActiveSection(123))
      expect(state.activeSectionId).toBe(123)
    })

    it('should handle setDirty', () => {
      const state = reducer(initialState, setDirty(true))
      expect(state.isDirty).toBe(true)
    })

    it('should handle resetEditor', () => {
      const section: Section = {
        id: 1,
        type: 'static',
        name: 'Test',
        content: 'Test',
        testCases: []
      }
      
      let state = reducer(initialState, addSection(section))
      state = reducer(state, setActiveSection(1))
      state = reducer(state, setPreviewContent('Preview'))
      
      state = reducer(state, resetEditor())
      
      expect(state.sections).toHaveLength(0)
      expect(state.activeSectionId).toBeNull()
      expect(state.previewContent).toBe('')
      expect(state.isDirty).toBe(false)
    })

    it('should handle loadDocument', () => {
      const sections: Section[] = [
        {
          id: 1,
          type: 'static',
          name: 'Section 1',
          content: 'Content 1',
          testCases: []
        },
        {
          id: 2,
          type: 'dynamic',
          name: 'Section 2',
          content: 'Content 2',
          testCases: []
        }
      ]
      
      const state = reducer(initialState, loadDocument({ sections }))
      
      expect(state.sections).toEqual(sections)
      expect(state.isDirty).toBe(false)
      expect(state.activeSectionId).toBeNull()
    })
  })
})