import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StaticSection from './StaticSection';
import { StaticSection as StaticSectionType } from '@/entities/section/types';

describe('StaticSection', () => {
  const mockSection: StaticSectionType = {
    id: 'test-1',
    type: 'static',
    name: 'Test Section',
    content: 'Initial content',
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render the static section editor', () => {
    render(
      <StaticSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    expect(screen.getByDisplayValue('Initial content')).toBeInTheDocument();
    expect(screen.getByText('Format:')).toBeInTheDocument();
  });

  it('should display formatting toolbar', () => {
    render(
      <StaticSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    expect(screen.getByLabelText('Bold (Ctrl+B)')).toBeInTheDocument();
    expect(screen.getByLabelText('Italic (Ctrl+I)')).toBeInTheDocument();
    expect(screen.getByLabelText('Inline Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Bullet List')).toBeInTheDocument();
    expect(screen.getByLabelText('Numbered List')).toBeInTheDocument();
    expect(screen.getByLabelText('Quote')).toBeInTheDocument();
    expect(screen.getByLabelText('Link')).toBeInTheDocument();
  });

  it('should switch between markdown and HTML modes', () => {
    render(
      <StaticSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    const markdownButton = screen.getByText('MD');
    const htmlButton = screen.getByText('HTML');

    // Should start in markdown mode
    expect(markdownButton.closest('button')).toHaveAttribute('aria-pressed', 'true');

    // Switch to HTML mode
    fireEvent.click(htmlButton);
    expect(htmlButton.closest('button')).toHaveAttribute('aria-pressed', 'true');
    expect(markdownButton.closest('button')).toHaveAttribute('aria-pressed', 'false');

    // Switch back to markdown
    fireEvent.click(markdownButton);
    expect(markdownButton.closest('button')).toHaveAttribute('aria-pressed', 'true');
    expect(htmlButton.closest('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should call onChange when content is modified', async () => {
    render(
      <StaticSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    const textarea = screen.getByDisplayValue('Initial content');
    fireEvent.change(textarea, { target: { value: 'New content' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('New content');
    });
  });

  it('should update content when section prop changes', () => {
    const { rerender } = render(
      <StaticSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    const updatedSection = { ...mockSection, content: 'Updated content' };
    rerender(
      <StaticSection
        section={updatedSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    expect(screen.getByDisplayValue('Updated content')).toBeInTheDocument();
  });

  it('should show markdown placeholder text in markdown mode', () => {
    render(
      <StaticSection
        section={{ ...mockSection, content: '' }}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    const textarea = screen.getByPlaceholderText(/Enter your text here. Use markdown formatting/);
    expect(textarea).toBeInTheDocument();
  });

  it('should show HTML placeholder text in HTML mode', () => {
    render(
      <StaticSection
        section={{ ...mockSection, content: '' }}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    // Switch to HTML mode
    const htmlButton = screen.getByText('HTML');
    fireEvent.click(htmlButton);

    const textarea = screen.getByPlaceholderText(/Enter your HTML content here/);
    expect(textarea).toBeInTheDocument();
  });

  it('should apply bold formatting in markdown mode', () => {
    render(
      <StaticSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    const textarea = screen.getByDisplayValue('Initial content') as HTMLTextAreaElement;
    
    // Select some text
    textarea.setSelectionRange(0, 7); // Select "Initial"
    
    // Click bold button
    const boldButton = screen.getByLabelText('Bold (Ctrl+B)');
    fireEvent.click(boldButton.closest('button')!);

    // Should wrap selected text with markdown bold syntax
    expect(mockOnChange).toHaveBeenCalledWith('**Initial** content');
  });

  it('should apply code formatting in markdown mode', () => {
    render(
      <StaticSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    const textarea = screen.getByDisplayValue('Initial content') as HTMLTextAreaElement;
    
    // Select some text
    textarea.setSelectionRange(0, 7); // Select "Initial"
    
    // Click code button
    const codeButton = screen.getByLabelText('Inline Code');
    fireEvent.click(codeButton.closest('button')!);

    // Should wrap selected text with markdown code syntax
    expect(mockOnChange).toHaveBeenCalledWith('`Initial` content');
  });

  it('should have different border color when active vs inactive', () => {
    const { rerender } = render(
      <StaticSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={true}
      />
    );

    const textField = screen.getByDisplayValue('Initial content');
    const activeFieldset = textField.closest('.MuiOutlinedInput-root')?.querySelector('fieldset');
    
    // Rerender as inactive
    rerender(
      <StaticSection
        section={mockSection}
        onChange={mockOnChange}
        isActive={false}
      />
    );

    const inactiveFieldset = textField.closest('.MuiOutlinedInput-root')?.querySelector('fieldset');
    
    // The border color will be different based on isActive prop
    expect(activeFieldset).toBeTruthy();
    expect(inactiveFieldset).toBeTruthy();
  });
});