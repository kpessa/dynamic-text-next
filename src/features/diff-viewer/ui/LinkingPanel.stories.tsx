import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LinkingPanel } from './LinkingPanel';
import { fn } from '@storybook/test';
import { within, userEvent, waitFor, expect } from '@storybook/test';
import { LinkingService } from '../lib/linkingService';
import type { SharedIngredient, PopulationType } from '../types';

// Mock the LinkingService for stories
const mockLinkingService = {
  getLinkingStatus: () => null,
  detectSharedIngredients: async () => new Map([
    ['ing-1', [
      {
        ingredient: {
          id: 'ing-2',
          name: 'Calcium Gluconate',
          displayName: 'Calcium Gluconate 10%',
          category: 'mineral',
          unit: 'mg',
          referenceRanges: []
        } as SharedIngredient,
        score: 0.98,
        matchType: 'exact' as const,
        matchedFields: ['name', 'displayName', 'category', 'unit']
      },
      {
        ingredient: {
          id: 'ing-3',
          name: 'Calcium Carbonate',
          displayName: 'Calcium Carbonate',
          category: 'mineral',
          unit: 'mg',
          referenceRanges: []
        } as SharedIngredient,
        score: 0.65,
        matchType: 'partial' as const,
        matchedFields: ['category', 'unit']
      }
    ]]
  ]),
  linkIngredients: async () => ({
    sourceIngredient: {} as SharedIngredient,
    linkedIngredients: new Map(),
    conflicts: [],
    confidence: 0.95
  }),
  unlinkIngredients: async () => {},
  bulkLinkIngredients: async () => new Map(),
  canUndo: () => false,
  canRedo: () => false,
  undo: () => false,
  redo: () => false,
  getInstance: () => mockLinkingService
};

// Override getInstance in stories
(LinkingService as any).getInstance = () => mockLinkingService;

const mockIngredient: SharedIngredient = {
  id: 'ing-1',
  name: 'Calcium Gluconate',
  displayName: 'Calcium Gluconate 10%',
  category: 'mineral',
  unit: 'mg',
  concentration: '10%',
  referenceRanges: [
    { populationType: 'neonatal', min: 8.5, max: 10.5, unit: 'mg/dL' }
  ]
};

const mockIngredients: SharedIngredient[] = [
  mockIngredient,
  {
    id: 'ing-2',
    name: 'Calcium Gluconate',
    displayName: 'Calcium Gluconate 10%',
    category: 'mineral',
    unit: 'mg',
    concentration: '10%',
    referenceRanges: [
      { populationType: 'child', min: 9.0, max: 11.0, unit: 'mg/dL' }
    ]
  },
  {
    id: 'ing-3',
    name: 'Calcium Carbonate',
    displayName: 'Calcium Carbonate',
    category: 'mineral',
    unit: 'mg',
    referenceRanges: [
      { populationType: 'neonatal', min: 8.5, max: 10.5, unit: 'mg/dL' }
    ]
  },
  {
    id: 'ing-4',
    name: 'Magnesium Sulfate',
    displayName: 'Magnesium Sulfate 50%',
    category: 'mineral',
    unit: 'mg',
    concentration: '50%',
    referenceRanges: [
      { populationType: 'neonatal', min: 1.5, max: 2.5, unit: 'mg/dL' }
    ]
  }
];

const mockPopulations: PopulationType[] = ['neonatal', 'child', 'adolescent', 'adult'];

const meta: Meta<typeof LinkingPanel> = {
  title: 'Features/DiffViewer/LinkingPanel',
  component: LinkingPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Panel for managing ingredient linking across populations with conflict resolution.'
      }
    }
  },
  argTypes: {
    ingredient: {
      control: { type: 'object' },
      description: 'The source ingredient to link'
    },
    ingredients: {
      control: { type: 'object' },
      description: 'Available ingredients for linking'
    },
    populations: {
      control: { type: 'object' },
      description: 'Population types to consider'
    },
    onLinkingChange: {
      action: 'linkingChange',
      description: 'Callback when linking status changes'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default state - no links
export const Default: Story = {
  args: {
    ingredient: mockIngredient,
    ingredients: mockIngredients,
    populations: mockPopulations,
    onLinkingChange: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state with no existing links.'
      }
    }
  }
};

// With existing links
export const WithExistingLinks: Story = {
  args: {
    ingredient: mockIngredient,
    ingredients: mockIngredients,
    populations: mockPopulations,
    onLinkingChange: fn()
  },
  decorators: [
    (Story) => {
      // Mock service to return linked status
      mockLinkingService.getLinkingStatus = () => ({
        linked: true,
        populations: ['child', 'adolescent'],
        confidence: 0.95,
        hasConflicts: false
      });
      return <Story />;
    }
  ],
  parameters: {
    docs: {
      description: {
        story: 'Panel showing existing linked populations.'
      }
    }
  }
};

// With candidates detected
export const WithCandidates: Story = {
  args: {
    ingredient: mockIngredient,
    ingredients: mockIngredients,
    populations: mockPopulations,
    onLinkingChange: fn()
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Reset mock
    mockLinkingService.getLinkingStatus = () => null;
    
    // Click find similar button
    const findButton = await canvas.findByText('Find Similar Ingredients');
    await userEvent.click(findButton);
    
    // Wait for candidates to appear
    await waitFor(async () => {
      expect(await canvas.findByText('Found Candidates')).toBeInTheDocument();
    });
  },
  parameters: {
    docs: {
      description: {
        story: 'Panel after detecting similar ingredients.'
      }
    }
  }
};

// With conflicts
export const WithConflicts: Story = {
  args: {
    ingredient: mockIngredient,
    ingredients: mockIngredients,
    populations: mockPopulations,
    onLinkingChange: fn()
  },
  decorators: [
    (Story) => {
      // Mock service to return conflicts
      mockLinkingService.linkIngredients = async () => ({
        sourceIngredient: mockIngredient,
        linkedIngredients: new Map([
          ['child', mockIngredients[1]]
        ]),
        conflicts: [
          {
            field: 'concentration',
            populations: ['child'],
            values: new Map([['child', '20%']])
          }
        ],
        confidence: 0.85
      });
      return <Story />;
    }
  ],
  parameters: {
    docs: {
      description: {
        story: 'Panel showing conflict resolution dialog when conflicts are detected.'
      }
    }
  }
};

// With undo/redo enabled
export const WithHistory: Story = {
  args: {
    ingredient: mockIngredient,
    ingredients: mockIngredients,
    populations: mockPopulations,
    onLinkingChange: fn()
  },
  decorators: [
    (Story) => {
      // Mock service with history
      mockLinkingService.canUndo = () => true;
      mockLinkingService.canRedo = () => true;
      mockLinkingService.undo = () => {
        console.log('undo');
        return true;
      };
      mockLinkingService.redo = () => {
        console.log('redo');
        return true;
      };
      return <Story />;
    }
  ],
  parameters: {
    docs: {
      description: {
        story: 'Panel with undo/redo functionality enabled.'
      }
    }
  }
};

// Loading state
export const Loading: Story = {
  args: {
    ingredient: mockIngredient,
    ingredients: mockIngredients,
    populations: mockPopulations,
    onLinkingChange: fn()
  },
  decorators: [
    (Story) => {
      // Mock slow detection
      mockLinkingService.detectSharedIngredients = async () => {
        await new Promise(resolve => setTimeout(resolve, 3000));
        return new Map();
      };
      return <Story />;
    }
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const findButton = await canvas.findByText('Find Similar Ingredients');
    await userEvent.click(findButton);
    
    // Check button is disabled during loading
    await waitFor(() => {
      expect(findButton).toBeDisabled();
    });
  },
  parameters: {
    docs: {
      description: {
        story: 'Panel showing loading state during operations.'
      }
    }
  }
};

// Empty candidates
export const NoCandidatesFound: Story = {
  args: {
    ingredient: mockIngredient,
    ingredients: [mockIngredient], // Only self, no candidates
    populations: mockPopulations,
    onLinkingChange: fn()
  },
  decorators: [
    (Story) => {
      // Mock empty results
      mockLinkingService.detectSharedIngredients = async () => new Map();
      return <Story />;
    }
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const findButton = await canvas.findByText('Find Similar Ingredients');
    await userEvent.click(findButton);
  },
  parameters: {
    docs: {
      description: {
        story: 'Panel when no similar ingredients are found.'
      }
    }
  }
};

// Bulk linking interaction
export const BulkLinking: Story = {
  args: {
    ingredient: mockIngredient,
    ingredients: mockIngredients,
    populations: mockPopulations,
    onLinkingChange: fn()
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Click auto-link button
    const autoLinkButton = await canvas.findByText('Auto-Link All');
    await userEvent.click(autoLinkButton);
    
    console.log('bulkLink: Initiated bulk linking');
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrating bulk linking functionality.'
      }
    }
  }
};

// Mobile responsive view
export const MobileView: Story = {
  args: {
    ingredient: mockIngredient,
    ingredients: mockIngredients,
    populations: mockPopulations,
    onLinkingChange: fn()
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Panel rendered in mobile viewport.'
      }
    }
  }
};