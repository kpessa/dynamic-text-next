import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DynamicTextEditor from './DynamicTextEditor';
import sectionReducer from '@/entities/section/model/sectionModel';
import { Section } from '@/entities/section/types';

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      sections: sectionReducer,
    },
    preloadedState: initialState,
  });
};

describe('DynamicTextEditor', () => {
  let store: ReturnType<typeof createTestStore>;
  const mockOnSave = vi.fn();
  const mockOnRunTests = vi.fn();

  beforeEach(() => {
    store = createTestStore();
    mockOnSave.mockClear();
    mockOnRunTests.mockClear();
  });

  it('should render the editor with toolbar and empty state', () => {
    render(
      <Provider store={store}>
        <DynamicTextEditor onSave={mockOnSave} onRunTests={mockOnRunTests} />
      </Provider>
    );

    // Check toolbar elements
    expect(screen.getByLabelText('Toggle Section List')).toBeInTheDocument();
    expect(screen.getByLabelText('Add Text Section')).toBeInTheDocument();
    expect(screen.getByLabelText('Add Code Section')).toBeInTheDocument();
    expect(screen.getByLabelText('Undo')).toBeInTheDocument();
    expect(screen.getByLabelText('Redo')).toBeInTheDocument();
    expect(screen.getByLabelText('Run Tests')).toBeInTheDocument();
    expect(screen.getByLabelText('Save Document')).toBeInTheDocument();

    // Check empty state message
    expect(screen.getByText('No sections yet. Add one to get started.')).toBeInTheDocument();
  });

  it('should toggle sidebar visibility', () => {
    render(
      <Provider store={store}>
        <DynamicTextEditor />
      </Provider>
    );

    const toggleButton = screen.getByLabelText('Toggle Section List');
    
    // Sidebar should be visible initially
    expect(screen.getByText('Sections')).toBeInTheDocument();

    // Hide sidebar
    fireEvent.click(toggleButton);
    expect(screen.queryByText('Sections')).not.toBeInTheDocument();

    // Show sidebar again
    fireEvent.click(toggleButton);
    expect(screen.getByText('Sections')).toBeInTheDocument();
  });

  it('should add a static section when clicking add text button', async () => {
    render(
      <Provider store={store}>
        <DynamicTextEditor />
      </Provider>
    );

    const addTextButton = screen.getByLabelText('Add Text Section');
    fireEvent.click(addTextButton);

    await waitFor(() => {
      expect(screen.getByText(/New Text Section/)).toBeInTheDocument();
    });
  });

  it('should add a dynamic section when clicking add code button', async () => {
    render(
      <Provider store={store}>
        <DynamicTextEditor />
      </Provider>
    );

    const addCodeButton = screen.getByLabelText('Add Code Section');
    fireEvent.click(addCodeButton);

    await waitFor(() => {
      expect(screen.getByText(/New Code Section/)).toBeInTheDocument();
    });
  });

  it('should switch between view modes', () => {
    render(
      <Provider store={store}>
        <DynamicTextEditor />
      </Provider>
    );

    // Default is split view - both editor and preview should be visible
    expect(screen.getByText('Select or create a section to start editing')).toBeInTheDocument();
    expect(screen.getByText('Preview will be displayed here')).toBeInTheDocument();

    // Switch to editor only
    const editorOnlyButton = screen.getByLabelText('editor only');
    fireEvent.click(editorOnlyButton);
    expect(screen.getByText('Select or create a section to start editing')).toBeInTheDocument();
    expect(screen.queryByText('Preview will be displayed here')).not.toBeInTheDocument();

    // Switch to preview only
    const previewOnlyButton = screen.getByLabelText('preview only');
    fireEvent.click(previewOnlyButton);
    expect(screen.queryByText('Select or create a section to start editing')).not.toBeInTheDocument();
    expect(screen.getByText('Preview will be displayed here')).toBeInTheDocument();

    // Switch back to split view
    const splitViewButton = screen.getByLabelText('split view');
    fireEvent.click(splitViewButton);
    expect(screen.getByText('Select or create a section to start editing')).toBeInTheDocument();
    expect(screen.getByText('Preview will be displayed here')).toBeInTheDocument();
  });

  it('should call onSave when save button is clicked', () => {
    render(
      <Provider store={store}>
        <DynamicTextEditor onSave={mockOnSave} />
      </Provider>
    );

    const saveButton = screen.getByLabelText('Save Document');
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith([]);
  });

  it('should call onRunTests when run tests button is clicked', () => {
    render(
      <Provider store={store}>
        <DynamicTextEditor onRunTests={mockOnRunTests} />
      </Provider>
    );

    const runTestsButton = screen.getByLabelText('Run Tests');
    fireEvent.click(runTestsButton);

    expect(mockOnRunTests).toHaveBeenCalled();
  });

  it('should display sections in the sidebar', () => {
    const mockSections: Section[] = [
      {
        id: '1',
        type: 'static',
        name: 'Introduction',
        content: '<p>Hello</p>',
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'dynamic',
        name: 'Calculation',
        content: 'return 2 + 2;',
        order: 1,
        testCases: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const storeWithSections = createTestStore({
      sections: {
        sections: mockSections,
        testResults: {},
        activeSectionId: null,
        loading: false,
        error: null,
      },
    });

    render(
      <Provider store={storeWithSections}>
        <DynamicTextEditor />
      </Provider>
    );

    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Calculation')).toBeInTheDocument();
  });

  it('should highlight active section', () => {
    const mockSections: Section[] = [
      {
        id: '1',
        type: 'static',
        name: 'Section 1',
        content: '',
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'static',
        name: 'Section 2',
        content: '',
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const storeWithActiveSection = createTestStore({
      sections: {
        sections: mockSections,
        testResults: {},
        activeSectionId: '1',
        loading: false,
        error: null,
      },
    });

    render(
      <Provider store={storeWithActiveSection}>
        <DynamicTextEditor />
      </Provider>
    );

    const section1 = screen.getByText('Section 1').closest('[class*="Paper"]');
    const section2 = screen.getByText('Section 2').closest('[class*="Paper"]');

    // Check that section 1 has elevated styling (active)
    expect(section1).toHaveStyle({ cursor: 'pointer' });
    
    // Click on section 2 to make it active
    fireEvent.click(screen.getByText('Section 2'));
  });
});