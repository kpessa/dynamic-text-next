import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Preview from './Preview';
import { Section } from '@/entities/section/types';
import * as evaluator from '../lib/evaluator';

// Mock the evaluator
vi.mock('../lib/evaluator', () => ({
  evaluateDynamicSection: vi.fn(),
  interpolateVariables: vi.fn((text) => text),
}));

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html) => html),
  },
}));

// Mock marked
vi.mock('marked', () => ({
  marked: vi.fn((text) => `<p>${text}</p>`),
}));

describe('Preview', () => {
  const mockStaticSection: Section = {
    id: '1',
    type: 'static',
    name: 'Static Section',
    content: 'Hello **World**',
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockDynamicSection: Section = {
    id: '2',
    type: 'dynamic',
    name: 'Dynamic Section',
    content: 'return 2 + 2;',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    mockOnRefresh.mockClear();
    vi.clearAllMocks();
    
    // Setup default mock returns
    (evaluator.evaluateDynamicSection as any).mockReturnValue({
      success: true,
      output: '4',
      executionTime: 10,
    });
  });

  it('should render empty state when no sections provided', () => {
    render(<Preview sections={[]} />);
    
    expect(
      screen.getByText('No content to preview. Add sections to see them rendered here.')
    ).toBeInTheDocument();
  });

  it('should render static sections', async () => {
    render(<Preview sections={[mockStaticSection]} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Hello/)).toBeInTheDocument();
    });
  });

  it('should render dynamic sections', async () => {
    render(<Preview sections={[mockDynamicSection]} />);
    
    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  it('should show execution time for dynamic sections', async () => {
    render(<Preview sections={[mockDynamicSection]} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Execution time: 10ms/)).toBeInTheDocument();
    });
  });

  it('should display errors when dynamic section fails', async () => {
    (evaluator.evaluateDynamicSection as any).mockReturnValue({
      success: false,
      output: '',
      error: 'Syntax error',
      executionTime: 5,
    });

    render(<Preview sections={[mockDynamicSection]} showErrors={true} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error in section 1: Syntax error/)).toBeInTheDocument();
    });
  });

  it('should hide errors when showErrors is false', async () => {
    (evaluator.evaluateDynamicSection as any).mockReturnValue({
      success: false,
      output: '',
      error: 'Syntax error',
      executionTime: 5,
    });

    render(<Preview sections={[mockDynamicSection]} showErrors={false} />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Error in section/)).not.toBeInTheDocument();
    });
  });

  it('should call onRefresh when refresh button is clicked', async () => {
    render(<Preview sections={[mockStaticSection]} onRefresh={mockOnRefresh} />);
    
    const refreshButton = screen.getByLabelText('Refresh Preview');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  it('should handle zoom controls', () => {
    render(<Preview sections={[mockStaticSection]} />);
    
    const zoomInButton = screen.getByLabelText('Zoom In');
    const zoomOutButton = screen.getByLabelText('Zoom Out');
    const resetZoomButton = screen.getByLabelText('Reset Zoom');
    
    // Initial zoom should be 100%
    expect(screen.getByText('Zoom: 100%')).toBeInTheDocument();
    
    // Zoom in
    fireEvent.click(zoomInButton);
    expect(screen.getByText('Zoom: 110%')).toBeInTheDocument();
    
    // Zoom out
    fireEvent.click(zoomOutButton);
    fireEvent.click(zoomOutButton);
    expect(screen.getByText('Zoom: 90%')).toBeInTheDocument();
    
    // Reset zoom
    fireEvent.click(resetZoomButton);
    expect(screen.getByText('Zoom: 100%')).toBeInTheDocument();
  });

  it('should interpolate variables in static sections', async () => {
    (evaluator.interpolateVariables as any).mockImplementation(
      (text: string, vars: Record<string, unknown>) => {
        return text.replace('${name}', String(vars.name));
      }
    );

    const sectionWithVariable: Section = {
      ...mockStaticSection,
      content: 'Hello ${name}',
    };

    render(
      <Preview
        sections={[sectionWithVariable]}
        variables={{ name: 'John' }}
      />
    );
    
    await waitFor(() => {
      expect(evaluator.interpolateVariables).toHaveBeenCalledWith(
        expect.stringContaining('Hello ${name}'),
        { name: 'John' }
      );
    });
  });

  it('should pass variables to dynamic sections', async () => {
    render(
      <Preview
        sections={[mockDynamicSection]}
        variables={{ x: 10, y: 20 }}
      />
    );
    
    await waitFor(() => {
      expect(evaluator.evaluateDynamicSection).toHaveBeenCalledWith(
        'return 2 + 2;',
        { x: 10, y: 20 },
        undefined
      );
    });
  });

  it('should render multiple sections with dividers', async () => {
    render(<Preview sections={[mockStaticSection, mockDynamicSection]} />);
    
    await waitFor(() => {
      const dividers = document.querySelectorAll('hr');
      expect(dividers.length).toBeGreaterThan(0);
    });
  });

  it('should format JSON output in pre tags', async () => {
    (evaluator.evaluateDynamicSection as any).mockReturnValue({
      success: true,
      output: '{"key": "value"}',
      executionTime: 10,
    });

    render(<Preview sections={[mockDynamicSection]} />);
    
    await waitFor(() => {
      const preElement = document.querySelector('pre.code-output');
      expect(preElement).toBeInTheDocument();
      expect(preElement?.textContent).toBe('{"key": "value"}');
    });
  });

  it('should display auto-refresh indicator when enabled', () => {
    render(
      <Preview
        sections={[mockStaticSection]}
        autoRefresh={true}
        refreshInterval={3000}
      />
    );
    
    expect(screen.getByText('(Auto-refresh: 3s)')).toBeInTheDocument();
  });

  it('should not display auto-refresh indicator when disabled', () => {
    render(
      <Preview
        sections={[mockStaticSection]}
        autoRefresh={false}
      />
    );
    
    expect(screen.queryByText(/Auto-refresh/)).not.toBeInTheDocument();
  });
});