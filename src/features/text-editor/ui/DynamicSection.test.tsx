import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DynamicSection from './DynamicSection';
import { DynamicSection as DynamicSectionType } from '@/entities/section/types';

// Mock CodeMirror since it doesn't work well in tests
vi.mock('@uiw/react-codemirror', () => ({
  default: ({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) => (
    <textarea
      data-testid="code-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('@codemirror/lang-javascript', () => ({
  javascript: () => [],
}));

vi.mock('@codemirror/theme-one-dark', () => ({
  oneDark: {},
}));

describe('DynamicSection', () => {
  const mockSection: DynamicSectionType = {
    id: 'test-1',
    type: 'dynamic',
    name: 'Test Dynamic Section',
    content: 'return 2 + 2;',
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    testCases: [
      {
        name: 'Test 1',
        variables: {},
        expected: '4',
        matchType: 'exact',
      },
    ],
  };

  const mockOnChange = vi.fn();
  const mockOnRun = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnRun.mockClear();
  });

  it('should render the dynamic section editor', () => {
    render(
      <DynamicSection
        section={mockSection}
        onChange={mockOnChange}
        onRun={mockOnRun}
        isActive={true}
      />
    );

    expect(screen.getByText('JavaScript Code')).toBeInTheDocument();
    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('return 2 + 2;')).toBeInTheDocument();
  });

  it('should display test cases count', () => {
    render(
      <DynamicSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    expect(screen.getByText('1 test case defined')).toBeInTheDocument();
  });

  it('should display multiple test cases count correctly', () => {
    const sectionWithMultipleTests = {
      ...mockSection,
      testCases: [
        { name: 'Test 1', variables: {}, expected: '4', matchType: 'exact' as const },
        { name: 'Test 2', variables: {}, expected: '4', matchType: 'exact' as const },
      ],
    };

    render(
      <DynamicSection
        section={sectionWithMultipleTests}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    expect(screen.getByText('2 test cases defined')).toBeInTheDocument();
  });

  it('should call onChange when code is modified', async () => {
    render(
      <DynamicSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    const editor = screen.getByTestId('code-editor');
    fireEvent.change(editor, { target: { value: 'return 3 + 3;' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('return 3 + 3;');
    });
  });

  it('should call onRun when run button is clicked', () => {
    render(
      <DynamicSection
        section={mockSection}
        onChange={mockOnChange}
        onRun={mockOnRun}
        isActive={true}
      />
    );

    const runButton = screen.getByLabelText('Run Code');
    fireEvent.click(runButton);

    expect(mockOnRun).toHaveBeenCalled();
  });

  it('should display error when provided', () => {
    render(
      <DynamicSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
        error="Syntax error on line 1"
      />
    );

    expect(screen.getByText('Syntax error on line 1')).toBeInTheDocument();
  });

  it('should display available variables', () => {
    const variables = {
      patientWeight: 70,
      patientHeight: 180,
      age: 30,
    };

    render(
      <DynamicSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
        variables={variables}
      />
    );

    expect(screen.getByText('Available variables:')).toBeInTheDocument();
    expect(screen.getByText('patientWeight')).toBeInTheDocument();
    expect(screen.getByText('patientHeight')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();
  });

  it('should limit displayed variables and show count for extras', () => {
    const variables = {
      var1: 1,
      var2: 2,
      var3: 3,
      var4: 4,
      var5: 5,
      var6: 6,
      var7: 7,
    };

    render(
      <DynamicSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
        variables={variables}
      />
    );

    // Should show first 5 variables
    expect(screen.getByText('var1')).toBeInTheDocument();
    expect(screen.getByText('var2')).toBeInTheDocument();
    expect(screen.getByText('var3')).toBeInTheDocument();
    expect(screen.getByText('var4')).toBeInTheDocument();
    expect(screen.getByText('var5')).toBeInTheDocument();
    
    // Should not show var6 and var7 directly
    expect(screen.queryByText('var6')).not.toBeInTheDocument();
    expect(screen.queryByText('var7')).not.toBeInTheDocument();
    
    // Should show count of remaining
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('should toggle fullscreen mode', () => {
    render(
      <DynamicSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    const fullscreenButton = screen.getByLabelText('Fullscreen');
    fireEvent.click(fullscreenButton);

    // After clicking, button should change to exit fullscreen
    expect(screen.getByLabelText('Exit Fullscreen')).toBeInTheDocument();

    // Click again to exit fullscreen
    fireEvent.click(screen.getByLabelText('Exit Fullscreen'));
    expect(screen.getByLabelText('Fullscreen')).toBeInTheDocument();
  });

  it('should handle copy code functionality', async () => {
    // Mock clipboard API
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
    });

    render(
      <DynamicSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    const copyButton = screen.getByLabelText('Copy Code');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('return 2 + 2;');
    });
  });

  it('should update code when section prop changes', () => {
    const { rerender } = render(
      <DynamicSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    const updatedSection = { ...mockSection, content: 'return 5 * 5;' };
    rerender(
      <DynamicSection
        section={updatedSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    expect(screen.getByDisplayValue('return 5 * 5;')).toBeInTheDocument();
  });

  it('should format code when format button is clicked', () => {
    render(
      <DynamicSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    const formatButton = screen.getByLabelText('Format Code');
    fireEvent.click(formatButton);

    // Since our format function is basic, it should at least call onChange
    expect(mockOnChange).toHaveBeenCalled();
  });
});