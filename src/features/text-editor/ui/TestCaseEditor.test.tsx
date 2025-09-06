import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import TestCaseEditor from './TestCaseEditor';
import { DynamicSection, TestCase } from '@/entities/section/types';
import * as evaluator from '../lib/evaluator';

// Mock the evaluator
vi.mock('../lib/evaluator', () => ({
  runTestCase: vi.fn(),
}));

describe('TestCaseEditor', () => {
  const mockSection: DynamicSection = {
    id: 'test-1',
    type: 'dynamic',
    name: 'Test Section',
    content: 'return x + y;',
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    testCases: [],
  };

  const mockSectionWithTests: DynamicSection = {
    ...mockSection,
    testCases: [
      {
        name: 'Test Addition',
        variables: { x: 2, y: 3 },
        expected: '5',
        matchType: 'exact',
      },
    ],
  };

  const mockOnUpdateTestCases = vi.fn();
  const mockOnRunTests = vi.fn();

  beforeEach(() => {
    mockOnUpdateTestCases.mockClear();
    mockOnRunTests.mockClear();
    vi.clearAllMocks();
    
    // Default mock for runTestCase
    (evaluator.runTestCase as any).mockReturnValue({
      passed: true,
      actual: '5',
      expected: '5',
      executionTime: 10,
    });
  });

  it('should render empty state when no test cases', () => {
    render(
      <TestCaseEditor
        section={mockSection}
        onUpdateTestCases={mockOnUpdateTestCases}
      />
    );

    expect(
      screen.getByText('No test cases defined. Click "Add Test Case" to create one.')
    ).toBeInTheDocument();
  });

  it('should render existing test cases', () => {
    render(
      <TestCaseEditor
        section={mockSectionWithTests}
        onUpdateTestCases={mockOnUpdateTestCases}
      />
    );

    expect(screen.getByText('Test Addition')).toBeInTheDocument();
  });

  it('should open dialog when Add Test Case is clicked', () => {
    render(
      <TestCaseEditor
        section={mockSection}
        onUpdateTestCases={mockOnUpdateTestCases}
      />
    );

    const addButton = screen.getByRole('button', { name: /Add Test Case/i });
    fireEvent.click(addButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Test Name')).toBeInTheDocument();
  });

  it('should add a new test case', async () => {
    render(
      <TestCaseEditor
        section={mockSection}
        onUpdateTestCases={mockOnUpdateTestCases}
      />
    );

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /Add Test Case/i }));

    // Fill form
    fireEvent.change(screen.getByLabelText('Test Name'), {
      target: { value: 'New Test' },
    });
    fireEvent.change(screen.getByLabelText('Variables (JSON)'), {
      target: { value: '{"a": 1}' },
    });
    fireEvent.change(screen.getByLabelText('Expected Output'), {
      target: { value: '1' },
    });

    // Save
    const dialog = screen.getByRole('dialog');
    const addButton = within(dialog).getByRole('button', { name: /Add/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockOnUpdateTestCases).toHaveBeenCalledWith([
        {
          name: 'New Test',
          variables: { a: 1 },
          expected: '1',
          matchType: 'exact',
        },
      ]);
    });
  });

  it('should validate required fields', async () => {
    render(
      <TestCaseEditor
        section={mockSection}
        onUpdateTestCases={mockOnUpdateTestCases}
      />
    );

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /Add Test Case/i }));

    // Try to save without filling required fields
    const dialog = screen.getByRole('dialog');
    const addButton = within(dialog).getByRole('button', { name: /Add/i });
    fireEvent.click(addButton);

    // Should show validation errors
    expect(screen.getByText('Test name is required')).toBeInTheDocument();
    expect(screen.getByText('Expected output is required')).toBeInTheDocument();
  });

  it('should validate JSON format', async () => {
    render(
      <TestCaseEditor
        section={mockSection}
        onUpdateTestCases={mockOnUpdateTestCases}
      />
    );

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: /Add Test Case/i }));

    // Enter invalid JSON
    fireEvent.change(screen.getByLabelText('Variables (JSON)'), {
      target: { value: 'not valid json' },
    });

    // Try to save
    const dialog = screen.getByRole('dialog');
    const addButton = within(dialog).getByRole('button', { name: /Add/i });
    fireEvent.click(addButton);

    // Should show validation error
    expect(screen.getByText('Invalid JSON format')).toBeInTheDocument();
  });

  it('should run a single test case', async () => {
    render(
      <TestCaseEditor
        section={mockSectionWithTests}
        onUpdateTestCases={mockOnUpdateTestCases}
        onRunTests={mockOnRunTests}
      />
    );

    // Expand the test case
    const expandButton = screen.getByLabelText(/expand/i);
    fireEvent.click(expandButton);

    // Click Run Test button
    const runButton = screen.getByRole('button', { name: /^Run Test$/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(evaluator.runTestCase).toHaveBeenCalledWith(
        'return x + y;',
        { x: 2, y: 3 },
        '5',
        'exact',
        undefined
      );
    });
  });

  it('should run all test cases', async () => {
    const sectionWithMultipleTests: DynamicSection = {
      ...mockSection,
      testCases: [
        {
          name: 'Test 1',
          variables: { x: 1 },
          expected: '1',
          matchType: 'exact',
        },
        {
          name: 'Test 2',
          variables: { x: 2 },
          expected: '2',
          matchType: 'exact',
        },
      ],
    };

    render(
      <TestCaseEditor
        section={sectionWithMultipleTests}
        onUpdateTestCases={mockOnUpdateTestCases}
        onRunTests={mockOnRunTests}
      />
    );

    const runAllButton = screen.getByRole('button', { name: /Run All Tests/i });
    fireEvent.click(runAllButton);

    await waitFor(() => {
      expect(evaluator.runTestCase).toHaveBeenCalledTimes(2);
      expect(mockOnRunTests).toHaveBeenCalled();
    });
  });

  it('should display test results', async () => {
    (evaluator.runTestCase as any).mockReturnValue({
      passed: false,
      actual: '4',
      expected: '5',
      executionTime: 10,
    });

    render(
      <TestCaseEditor
        section={mockSectionWithTests}
        onUpdateTestCases={mockOnUpdateTestCases}
      />
    );

    // Expand the test case
    fireEvent.click(screen.getByLabelText(/expand/i));

    // Run the test
    const runButton = screen.getByRole('button', { name: /^Run Test$/i });
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText('Test Failed')).toBeInTheDocument();
      expect(screen.getByText(/Actual: 4/)).toBeInTheDocument();
    });
  });

  it('should display error when test execution fails', async () => {
    (evaluator.runTestCase as any).mockReturnValue({
      passed: false,
      actual: '',
      expected: '5',
      error: 'Syntax error',
      executionTime: 5,
    });

    render(
      <TestCaseEditor
        section={mockSectionWithTests}
        onUpdateTestCases={mockOnUpdateTestCases}
      />
    );

    // Expand and run test
    fireEvent.click(screen.getByLabelText(/expand/i));
    fireEvent.click(screen.getByRole('button', { name: /^Run Test$/i }));

    await waitFor(() => {
      expect(screen.getByText('Syntax error')).toBeInTheDocument();
    });
  });

  it('should delete a test case', async () => {
    render(
      <TestCaseEditor
        section={mockSectionWithTests}
        onUpdateTestCases={mockOnUpdateTestCases}
      />
    );

    // Expand the test case
    fireEvent.click(screen.getByLabelText(/expand/i));

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnUpdateTestCases).toHaveBeenCalledWith([]);
    });
  });

  it('should duplicate a test case', async () => {
    render(
      <TestCaseEditor
        section={mockSectionWithTests}
        onUpdateTestCases={mockOnUpdateTestCases}
      />
    );

    // Expand the test case
    fireEvent.click(screen.getByLabelText(/expand/i));

    // Click duplicate button
    const duplicateButton = screen.getByRole('button', { name: /Duplicate/i });
    fireEvent.click(duplicateButton);

    await waitFor(() => {
      expect(mockOnUpdateTestCases).toHaveBeenCalledWith([
        mockSectionWithTests.testCases![0],
        {
          ...mockSectionWithTests.testCases![0],
          name: 'Test Addition (Copy)',
        },
      ]);
    });
  });

  it('should show passed/total count after running tests', async () => {
    render(
      <TestCaseEditor
        section={mockSectionWithTests}
        onUpdateTestCases={mockOnUpdateTestCases}
      />
    );

    // Run all tests
    fireEvent.click(screen.getByRole('button', { name: /Run All Tests/i }));

    await waitFor(() => {
      expect(screen.getByText('1/1 Passed')).toBeInTheDocument();
    });
  });
});