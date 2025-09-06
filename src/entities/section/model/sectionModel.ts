import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Section, SectionOrder, TestResult, DynamicSection } from '../types';

interface SectionState {
  sections: Section[];
  testResults: Record<string, TestResult[]>;
  activeSectionId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: SectionState = {
  sections: [],
  testResults: {},
  activeSectionId: null,
  loading: false,
  error: null,
};

const sectionSlice = createSlice({
  name: 'sections',
  initialState,
  reducers: {
    setSections: (state, action: PayloadAction<Section[]>) => {
      state.sections = action.payload;
    },
    addSection: (state, action: PayloadAction<Section>) => {
      state.sections.push(action.payload);
    },
    updateSection: (state, action: PayloadAction<Section>) => {
      const index = state.sections.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sections[index] = action.payload;
      }
    },
    deleteSection: (state, action: PayloadAction<string>) => {
      state.sections = state.sections.filter(s => s.id !== action.payload);
      // Clean up test results for deleted section
      delete state.testResults[action.payload];
    },
    reorderSections: (state, action: PayloadAction<SectionOrder[]>) => {
      const orderMap = new Map(action.payload.map(o => [o.sectionId, o.order]));
      state.sections.sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? a.order;
        const orderB = orderMap.get(b.id) ?? b.order;
        return orderA - orderB;
      });
      // Update order in sections
      state.sections.forEach(section => {
        const newOrder = orderMap.get(section.id);
        if (newOrder !== undefined) {
          section.order = newOrder;
        }
      });
    },
    setActiveSectionId: (state, action: PayloadAction<string | null>) => {
      state.activeSectionId = action.payload;
    },
    setTestResults: (state, action: PayloadAction<{ sectionId: string; results: TestResult[] }>) => {
      state.testResults[action.payload.sectionId] = action.payload.results;
    },
    clearTestResults: (state, action: PayloadAction<string>) => {
      delete state.testResults[action.payload];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSections,
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  setActiveSectionId,
  setTestResults,
  clearTestResults,
  setLoading,
  setError,
} = sectionSlice.actions;

export default sectionSlice.reducer;

// Selectors
export const selectAllSections = (state: { sections: SectionState }) => state.sections.sections;
export const selectSectionById = (id: string) => (state: { sections: SectionState }) =>
  state.sections.sections.find(s => s.id === id);
export const selectActiveSectionId = (state: { sections: SectionState }) => state.sections.activeSectionId;
export const selectActiveSection = (state: { sections: SectionState }) => {
  const id = state.sections.activeSectionId;
  return id ? state.sections.sections.find(s => s.id === id) : null;
};
export const selectTestResults = (sectionId: string) => (state: { sections: SectionState }) =>
  state.sections.testResults[sectionId] || [];
export const selectSectionLoading = (state: { sections: SectionState }) => state.sections.loading;
export const selectSectionError = (state: { sections: SectionState }) => state.sections.error;