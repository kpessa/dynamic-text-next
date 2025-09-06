import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Section, TestResult } from '@/entities/section/types';

export type PreviewMode = 'side-by-side' | 'preview-only' | 'editor-only';

interface EditorState {
  sections: Section[];
  activeSection: string | null;
  isDirty: boolean;
  testResults: Record<string, TestResult[]>;
  previewMode: PreviewMode;
  undoStack: Section[][];
  redoStack: Section[][];
  cursorPosition: {
    sectionId: string;
    position: number;
  } | null;
  lastSaved: string | null;
  autoSaveEnabled: boolean;
}

const initialState: EditorState = {
  sections: [],
  activeSection: null,
  isDirty: false,
  testResults: {},
  previewMode: 'side-by-side',
  undoStack: [],
  redoStack: [],
  cursorPosition: null,
  lastSaved: null,
  autoSaveEnabled: true,
};

const MAX_UNDO_STACK = 50;

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setSections: (state, action: PayloadAction<Section[]>) => {
      // Save current state to undo stack before changing
      if (state.sections.length > 0) {
        state.undoStack.push([...state.sections]);
        if (state.undoStack.length > MAX_UNDO_STACK) {
          state.undoStack.shift();
        }
        state.redoStack = []; // Clear redo stack on new action
      }
      
      state.sections = action.payload;
      state.isDirty = true;
    },
    
    addSection: (state, action: PayloadAction<Section>) => {
      state.undoStack.push([...state.sections]);
      if (state.undoStack.length > MAX_UNDO_STACK) {
        state.undoStack.shift();
      }
      state.redoStack = [];
      
      state.sections.push(action.payload);
      state.activeSection = action.payload.id;
      state.isDirty = true;
    },
    
    updateSection: (state, action: PayloadAction<Section>) => {
      state.undoStack.push([...state.sections]);
      if (state.undoStack.length > MAX_UNDO_STACK) {
        state.undoStack.shift();
      }
      state.redoStack = [];
      
      const index = state.sections.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sections[index] = action.payload;
        state.isDirty = true;
      }
    },
    
    deleteSection: (state, action: PayloadAction<string>) => {
      state.undoStack.push([...state.sections]);
      if (state.undoStack.length > MAX_UNDO_STACK) {
        state.undoStack.shift();
      }
      state.redoStack = [];
      
      state.sections = state.sections.filter(s => s.id !== action.payload);
      delete state.testResults[action.payload];
      
      if (state.activeSection === action.payload) {
        state.activeSection = state.sections[0]?.id || null;
      }
      state.isDirty = true;
    },
    
    reorderSections: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      state.undoStack.push([...state.sections]);
      if (state.undoStack.length > MAX_UNDO_STACK) {
        state.undoStack.shift();
      }
      state.redoStack = [];
      
      const { fromIndex, toIndex } = action.payload;
      const sections = [...state.sections];
      const [removed] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, removed);
      
      // Update order values
      sections.forEach((section, index) => {
        section.order = index;
      });
      
      state.sections = sections;
      state.isDirty = true;
    },
    
    setActiveSection: (state, action: PayloadAction<string | null>) => {
      state.activeSection = action.payload;
    },
    
    setCursorPosition: (state, action: PayloadAction<{ sectionId: string; position: number } | null>) => {
      state.cursorPosition = action.payload;
    },
    
    setTestResults: (state, action: PayloadAction<{ sectionId: string; results: TestResult[] }>) => {
      state.testResults[action.payload.sectionId] = action.payload.results;
    },
    
    clearTestResults: (state, action: PayloadAction<string>) => {
      delete state.testResults[action.payload];
    },
    
    setPreviewMode: (state, action: PayloadAction<PreviewMode>) => {
      state.previewMode = action.payload;
    },
    
    undo: (state) => {
      if (state.undoStack.length > 0) {
        const previousState = state.undoStack.pop()!;
        state.redoStack.push([...state.sections]);
        state.sections = previousState;
        state.isDirty = true;
      }
    },
    
    redo: (state) => {
      if (state.redoStack.length > 0) {
        const nextState = state.redoStack.pop()!;
        state.undoStack.push([...state.sections]);
        state.sections = nextState;
        state.isDirty = true;
      }
    },
    
    markSaved: (state) => {
      state.isDirty = false;
      state.lastSaved = new Date().toISOString();
    },
    
    setAutoSave: (state, action: PayloadAction<boolean>) => {
      state.autoSaveEnabled = action.payload;
    },
    
    clearEditor: (state) => {
      state.sections = [];
      state.activeSection = null;
      state.isDirty = false;
      state.testResults = {};
      state.undoStack = [];
      state.redoStack = [];
      state.cursorPosition = null;
    },
  },
});

export const {
  setSections,
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  setActiveSection,
  setCursorPosition,
  setTestResults,
  clearTestResults,
  setPreviewMode,
  undo,
  redo,
  markSaved,
  setAutoSave,
  clearEditor,
} = editorSlice.actions;

export default editorSlice.reducer;

// Selectors
export const selectSections = (state: { editor: EditorState }) => state.editor.sections;
export const selectActiveSection = (state: { editor: EditorState }) => {
  const id = state.editor.activeSection;
  return id ? state.editor.sections.find(s => s.id === id) : null;
};
export const selectActiveSectionId = (state: { editor: EditorState }) => state.editor.activeSection;
export const selectIsDirty = (state: { editor: EditorState }) => state.editor.isDirty;
export const selectTestResults = (sectionId: string) => (state: { editor: EditorState }) => 
  state.editor.testResults[sectionId] || [];
export const selectPreviewMode = (state: { editor: EditorState }) => state.editor.previewMode;
export const selectCanUndo = (state: { editor: EditorState }) => state.editor.undoStack.length > 0;
export const selectCanRedo = (state: { editor: EditorState }) => state.editor.redoStack.length > 0;
export const selectLastSaved = (state: { editor: EditorState }) => state.editor.lastSaved;
export const selectAutoSaveEnabled = (state: { editor: EditorState }) => state.editor.autoSaveEnabled;