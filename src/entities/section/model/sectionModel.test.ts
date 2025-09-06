import { describe, it, expect, beforeEach } from 'vitest';
import reducer, {
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
  selectAllSections,
  selectSectionById,
  selectActiveSectionId,
  selectActiveSection,
  selectTestResults,
} from './sectionModel';
import { Section, TestResult } from '../types';

describe('sectionModel', () => {
  const mockStaticSection: Section = {
    id: '1',
    type: 'static',
    name: 'Introduction',
    content: '<p>Hello World</p>',
    order: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const mockDynamicSection: Section = {
    id: '2',
    type: 'dynamic',
    name: 'Calculation',
    content: 'return 2 + 2;',
    order: 1,
    testCases: [
      {
        name: 'Basic Addition',
        variables: {},
        expected: '4',
        matchType: 'exact',
      },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const initialState = {
    sections: [],
    testResults: {},
    activeSectionId: null,
    loading: false,
    error: null,
  };

  describe('reducers', () => {
    it('should handle setSections', () => {
      const sections = [mockStaticSection, mockDynamicSection];
      const state = reducer(initialState, setSections(sections));
      expect(state.sections).toEqual(sections);
    });

    it('should handle addSection', () => {
      const state = reducer(initialState, addSection(mockStaticSection));
      expect(state.sections).toHaveLength(1);
      expect(state.sections[0]).toEqual(mockStaticSection);
    });

    it('should handle updateSection', () => {
      const initialWithSection = reducer(initialState, addSection(mockStaticSection));
      const updatedSection = { ...mockStaticSection, name: 'Updated Name' };
      const state = reducer(initialWithSection, updateSection(updatedSection));
      expect(state.sections[0].name).toBe('Updated Name');
    });

    it('should handle deleteSection', () => {
      const initialWithSections = reducer(
        initialState,
        setSections([mockStaticSection, mockDynamicSection])
      );
      const state = reducer(initialWithSections, deleteSection('1'));
      expect(state.sections).toHaveLength(1);
      expect(state.sections[0].id).toBe('2');
    });

    it('should handle reorderSections', () => {
      const initialWithSections = reducer(
        initialState,
        setSections([mockStaticSection, mockDynamicSection])
      );
      const newOrder = [
        { sectionId: '2', order: 0 },
        { sectionId: '1', order: 1 },
      ];
      const state = reducer(initialWithSections, reorderSections(newOrder));
      expect(state.sections[0].id).toBe('2');
      expect(state.sections[1].id).toBe('1');
      expect(state.sections[0].order).toBe(0);
      expect(state.sections[1].order).toBe(1);
    });

    it('should handle setActiveSectionId', () => {
      const state = reducer(initialState, setActiveSectionId('1'));
      expect(state.activeSectionId).toBe('1');
    });

    it('should handle setTestResults', () => {
      const testResults: TestResult[] = [
        {
          passed: true,
          actual: '4',
          expected: '4',
          executionTime: 10,
        },
      ];
      const state = reducer(
        initialState,
        setTestResults({ sectionId: '2', results: testResults })
      );
      expect(state.testResults['2']).toEqual(testResults);
    });

    it('should handle clearTestResults', () => {
      const initialWithResults = reducer(
        initialState,
        setTestResults({
          sectionId: '2',
          results: [{ passed: true, actual: '4', expected: '4' }],
        })
      );
      const state = reducer(initialWithResults, clearTestResults('2'));
      expect(state.testResults['2']).toBeUndefined();
    });

    it('should handle setLoading', () => {
      const state = reducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);
    });

    it('should handle setError', () => {
      const state = reducer(initialState, setError('Test error'));
      expect(state.error).toBe('Test error');
    });

    it('should clean up test results when deleting section', () => {
      const initialWithSectionAndResults = reducer(
        initialState,
        setSections([mockDynamicSection])
      );
      const stateWithResults = reducer(
        initialWithSectionAndResults,
        setTestResults({
          sectionId: '2',
          results: [{ passed: true, actual: '4', expected: '4' }],
        })
      );
      const finalState = reducer(stateWithResults, deleteSection('2'));
      expect(finalState.sections).toHaveLength(0);
      expect(finalState.testResults['2']).toBeUndefined();
    });
  });

  describe('selectors', () => {
    const stateWithSections = {
      sections: {
        sections: [mockStaticSection, mockDynamicSection],
        testResults: {
          '2': [{ passed: true, actual: '4', expected: '4' }],
        },
        activeSectionId: '1',
        loading: false,
        error: null,
      },
    };

    it('should select all sections', () => {
      const sections = selectAllSections(stateWithSections);
      expect(sections).toHaveLength(2);
    });

    it('should select section by id', () => {
      const section = selectSectionById('1')(stateWithSections);
      expect(section?.id).toBe('1');
    });

    it('should select active section id', () => {
      const activeSectionId = selectActiveSectionId(stateWithSections);
      expect(activeSectionId).toBe('1');
    });

    it('should select active section', () => {
      const activeSection = selectActiveSection(stateWithSections);
      expect(activeSection?.id).toBe('1');
    });

    it('should select test results', () => {
      const results = selectTestResults('2')(stateWithSections);
      expect(results).toHaveLength(1);
      expect(results[0].passed).toBe(true);
    });

    it('should return empty array for non-existent test results', () => {
      const results = selectTestResults('999')(stateWithSections);
      expect(results).toEqual([]);
    });
  });
});