/**
 * Editor Redux Slice
 * State management for the dynamic text editor
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/app/store'
import { Section, TestSummary, LoadedIngredient } from '@/shared/types/section'

interface EditorState {
  sections: Section[]
  activeSectionId: number | null
  testResults: TestSummary | null
  isDirty: boolean
  ingredients: LoadedIngredient[]
  previewContent: string
}

// Mock initial ingredients for demo
const mockIngredients: LoadedIngredient[] = [
  // Macronutrients
  { id: '1', name: 'Dextrose', keyname: 'dextrose', type: 'Macronutrient' },
  { id: '2', name: 'Amino Acids', keyname: 'amino_acids', type: 'Macronutrient' },
  { id: '3', name: 'Lipids', keyname: 'lipids', type: 'Macronutrient' },
  { id: '4', name: 'Protein', keyname: 'protein', type: 'Macronutrient' },
  
  // Micronutrients
  { id: '5', name: 'Calcium', keyname: 'calcium', type: 'Micronutrient' },
  { id: '6', name: 'Magnesium', keyname: 'magnesium', type: 'Micronutrient' },
  { id: '7', name: 'Phosphorus', keyname: 'phosphorus', type: 'Micronutrient' },
  { id: '8', name: 'Zinc', keyname: 'zinc', type: 'Micronutrient' },
  { id: '9', name: 'Vitamin C', keyname: 'vitamin_c', type: 'Micronutrient' },
  { id: '10', name: 'Vitamin D', keyname: 'vitamin_d', type: 'Micronutrient' },
  
  // Additives
  { id: '11', name: 'Heparin', keyname: 'heparin', type: 'Additive' },
  { id: '12', name: 'Insulin', keyname: 'insulin', type: 'Additive' },
  { id: '13', name: 'Multivitamin', keyname: 'multivitamin', type: 'Additive' },
  
  // Salts
  { id: '14', name: 'Sodium Chloride', keyname: 'sodium_chloride', type: 'Salt' },
  { id: '15', name: 'Potassium Chloride', keyname: 'potassium_chloride', type: 'Salt' },
  { id: '16', name: 'Sodium Acetate', keyname: 'sodium_acetate', type: 'Salt' },
  
  // Diluents
  { id: '17', name: 'Sterile Water', keyname: 'sterile_water', type: 'Diluent' },
  { id: '18', name: 'Normal Saline', keyname: 'normal_saline', type: 'Diluent' }
]

const initialState: EditorState = {
  sections: [],
  activeSectionId: null,
  testResults: null,
  isDirty: false,
  ingredients: mockIngredients,
  previewContent: ''
}

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    // Section management
    addSection: (state, action: PayloadAction<Section>) => {
      state.sections.push(action.payload)
      state.isDirty = true
    },
    updateSection: (state, action: PayloadAction<Section>) => {
      const index = state.sections.findIndex(s => s.id === action.payload.id)
      if (index !== -1) {
        state.sections[index] = action.payload
        state.isDirty = true
      }
    },
    deleteSection: (state, action: PayloadAction<number>) => {
      state.sections = state.sections.filter(s => s.id !== action.payload)
      if (state.activeSectionId === action.payload) {
        state.activeSectionId = null
      }
      state.isDirty = true
    },
    reorderSections: (state, action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>) => {
      const { sourceIndex, destinationIndex } = action.payload
      const [removed] = state.sections.splice(sourceIndex, 1)
      state.sections.splice(destinationIndex, 0, removed)
      state.isDirty = true
    },
    setActiveSection: (state, action: PayloadAction<number | null>) => {
      state.activeSectionId = action.payload
    },
    
    // Ingredient management
    addIngredient: (state, action: PayloadAction<LoadedIngredient>) => {
      if (!state.ingredients.find(i => i.id === action.payload.id)) {
        state.ingredients.push(action.payload)
      }
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(i => i.id !== action.payload)
    },
    setIngredients: (state, action: PayloadAction<LoadedIngredient[]>) => {
      state.ingredients = action.payload
    },
    addIngredientToEditor: (state, action: PayloadAction<LoadedIngredient>) => {
      // This action is handled by the editor component to insert into active section
      // Keeping for future enhancement
    },
    
    // Test results
    setTestResults: (state, action: PayloadAction<TestSummary | null>) => {
      state.testResults = action.payload
    },
    
    // Preview
    setPreviewContent: (state, action: PayloadAction<string>) => {
      state.previewContent = action.payload
    },
    
    // Document state
    setDirty: (state, action: PayloadAction<boolean>) => {
      state.isDirty = action.payload
    },
    resetEditor: (state) => {
      state.sections = []
      state.activeSectionId = null
      state.testResults = null
      state.isDirty = false
      state.previewContent = ''
    },
    loadDocument: (state, action: PayloadAction<{ sections: Section[] }>) => {
      state.sections = action.payload.sections
      state.activeSectionId = null
      state.testResults = null
      state.isDirty = false
      state.previewContent = ''
    }
  }
})

// Actions
export const {
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  setActiveSection,
  addIngredient,
  removeIngredient,
  setIngredients,
  addIngredientToEditor,
  setTestResults,
  setPreviewContent,
  setDirty,
  resetEditor,
  loadDocument
} = editorSlice.actions

// Selectors
export const selectSections = (state: RootState) => state.editor.sections
export const selectActiveSectionId = (state: RootState) => state.editor.activeSectionId
export const selectActiveSection = (state: RootState) => {
  const id = state.editor.activeSectionId
  return id ? state.editor.sections.find(s => s.id === id) : null
}
export const selectIngredients = (state: RootState) => state.editor.ingredients
export const selectTestResults = (state: RootState) => state.editor.testResults
export const selectIsDirty = (state: RootState) => state.editor.isDirty
export const selectPreviewContent = (state: RootState) => state.editor.previewContent

export default editorSlice.reducer