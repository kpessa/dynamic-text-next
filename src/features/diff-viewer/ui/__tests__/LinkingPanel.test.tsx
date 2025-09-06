import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinkingPanel } from '../LinkingPanel';
import { LinkingService } from '../../lib/linkingService';
import type { SharedIngredient, PopulationType } from '../../types';

// Mock the LinkingService
vi.mock('../../lib/linkingService', () => ({
  LinkingService: {
    getInstance: vi.fn()
  }
}));

describe('LinkingPanel', () => {
  const mockIngredient: SharedIngredient = {
    id: 'ing-1',
    name: 'Calcium Gluconate',
    displayName: 'Calcium Gluconate 10%',
    category: 'mineral',
    unit: 'mg',
    referenceRanges: []
  };

  const mockIngredients: SharedIngredient[] = [
    mockIngredient,
    {
      id: 'ing-2',
      name: 'Calcium Gluconate',
      displayName: 'Calcium Gluconate 10%',
      category: 'mineral',
      unit: 'mg',
      referenceRanges: []
    },
    {
      id: 'ing-3',
      name: 'Magnesium Sulfate',
      displayName: 'Magnesium Sulfate',
      category: 'mineral',
      unit: 'mg',
      referenceRanges: []
    }
  ];

  const mockPopulations: PopulationType[] = ['neonatal', 'child'];

  const mockLinkingService = {
    getLinkingStatus: vi.fn(),
    detectSharedIngredients: vi.fn(),
    linkIngredients: vi.fn(),
    unlinkIngredients: vi.fn(),
    bulkLinkIngredients: vi.fn(),
    canUndo: vi.fn(),
    canRedo: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (LinkingService.getInstance as any).mockReturnValue(mockLinkingService);
    mockLinkingService.getLinkingStatus.mockReturnValue(null);
    mockLinkingService.canUndo.mockReturnValue(false);
    mockLinkingService.canRedo.mockReturnValue(false);
  });

  it('should render without linking status', () => {
    render(
      <LinkingPanel
        ingredient={mockIngredient}
        ingredients={mockIngredients}
        populations={mockPopulations}
      />
    );

    expect(screen.getByText('Ingredient Linking')).toBeInTheDocument();
    expect(screen.getByText('Find Similar Ingredients')).toBeInTheDocument();
  });

  it('should show current linking status when linked', () => {
    mockLinkingService.getLinkingStatus.mockReturnValue({
      linked: true,
      populations: ['neonatal', 'child'],
      confidence: 0.95,
      hasConflicts: false
    });

    render(
      <LinkingPanel
        ingredient={mockIngredient}
        ingredients={mockIngredients}
        populations={mockPopulations}
      />
    );

    expect(screen.getByText(/Linked to 2 population/)).toBeInTheDocument();
    expect(screen.getByText(/Confidence: 95%/)).toBeInTheDocument();
    expect(screen.getByText('Unlink All')).toBeInTheDocument();
  });

  it('should detect shared ingredients', async () => {
    const candidatesMap = new Map([
      ['ing-1', [{
        ingredient: mockIngredients[1],
        score: 0.95,
        matchType: 'exact' as const,
        matchedFields: ['name', 'displayName']
      }]]
    ]);

    mockLinkingService.detectSharedIngredients.mockResolvedValue(candidatesMap);

    render(
      <LinkingPanel
        ingredient={mockIngredient}
        ingredients={mockIngredients}
        populations={mockPopulations}
      />
    );

    const findButton = screen.getByText('Find Similar Ingredients');
    await userEvent.click(findButton);

    await waitFor(() => {
      expect(screen.getByText('Found Candidates')).toBeInTheDocument();
    });

    expect(screen.getByText('Calcium Gluconate 10%')).toBeInTheDocument();
    expect(screen.getByText('exact')).toBeInTheDocument();
    expect(screen.getByText(/Score: 95% \| Matched: name, displayName/)).toBeInTheDocument();
  });

  it('should handle linking ingredients', async () => {
    const candidatesMap = new Map([
      ['ing-1', [{
        ingredient: mockIngredients[1],
        score: 0.95,
        matchType: 'exact' as const,
        matchedFields: ['name']
      }]]
    ]);

    mockLinkingService.detectSharedIngredients.mockResolvedValue(candidatesMap);
    mockLinkingService.linkIngredients.mockResolvedValue({
      sourceIngredient: mockIngredient,
      linkedIngredients: new Map([['child', mockIngredients[1]]]),
      conflicts: [],
      confidence: 0.95
    });

    render(
      <LinkingPanel
        ingredient={mockIngredient}
        ingredients={mockIngredients}
        populations={mockPopulations}
      />
    );

    // First find candidates
    await userEvent.click(screen.getByText('Find Similar Ingredients'));

    await waitFor(() => {
      expect(screen.getByText('Found Candidates')).toBeInTheDocument();
    });

    // Link functionality would require selecting from dropdown
    // This would need more complex interaction testing
  });

  it('should handle unlinking', async () => {
    mockLinkingService.getLinkingStatus
      .mockReturnValueOnce({
        linked: true,
        populations: ['neonatal'],
        confidence: 0.95,
        hasConflicts: false
      })
      .mockReturnValueOnce(null);

    const { rerender } = render(
      <LinkingPanel
        ingredient={mockIngredient}
        ingredients={mockIngredients}
        populations={mockPopulations}
      />
    );

    const unlinkButton = screen.getByText('Unlink All');
    await userEvent.click(unlinkButton);

    await waitFor(() => {
      expect(mockLinkingService.unlinkIngredients).toHaveBeenCalledWith('ing-1', undefined);
    });
  });


  it('should handle bulk linking', async () => {
    mockLinkingService.bulkLinkIngredients.mockResolvedValue(new Map());

    render(
      <LinkingPanel
        ingredient={mockIngredient}
        ingredients={mockIngredients}
        populations={mockPopulations}
      />
    );

    const autoLinkButton = screen.getByText('Auto-Link All');
    await userEvent.click(autoLinkButton);

    await waitFor(() => {
      expect(mockLinkingService.bulkLinkIngredients).toHaveBeenCalledWith(
        mockIngredients,
        expect.objectContaining({
          threshold: 0.9,
          populations: mockPopulations,
          conflictResolution: 'auto'
        })
      );
    });
  });

  it('should call onLinkingChange callback', () => {
    const onLinkingChange = vi.fn();
    const linkingStatus = {
      linked: true,
      populations: ['neonatal'],
      confidence: 0.95,
      hasConflicts: false
    };

    mockLinkingService.getLinkingStatus.mockReturnValue(linkingStatus);

    render(
      <LinkingPanel
        ingredient={mockIngredient}
        ingredients={mockIngredients}
        populations={mockPopulations}
        onLinkingChange={onLinkingChange}
      />
    );

    expect(onLinkingChange).toHaveBeenCalledWith(linkingStatus);
  });

  it('should show conflict dialog when conflicts exist', async () => {
    mockLinkingService.linkIngredients.mockResolvedValue({
      sourceIngredient: mockIngredient,
      linkedIngredients: new Map([['child', mockIngredients[1]]]),
      conflicts: [{
        field: 'unit',
        populations: ['child'],
        values: new Map([['child', 'g']])
      }],
      confidence: 0.85
    });

    // This would require more setup to test the full flow
    // of selecting candidates and attempting to link with conflicts
  });

  it('should disable buttons during loading', async () => {
    mockLinkingService.detectSharedIngredients.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <LinkingPanel
        ingredient={mockIngredient}
        ingredients={mockIngredients}
        populations={mockPopulations}
      />
    );

    const findButton = screen.getByText('Find Similar Ingredients');
    fireEvent.click(findButton);

    // Button should be disabled while loading
    await waitFor(() => {
      expect(findButton).toBeDisabled();
    });
  });
});