import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DiffViewerModal } from './DiffViewerModal';
import diffReducer from '../model/diffSlice';
import { fn } from '@storybook/test';
import { within, userEvent, expect } from '@storybook/test';

// Create a mock store for stories
const createMockStore = (initialState?: any) => {
  return configureStore({
    reducer: {
      diffViewer: diffReducer
    },
    preloadedState: initialState
  });
};

const mockIngredient = {
  id: 'ing-123',
  name: 'Calcium Gluconate',
  displayName: 'Calcium Gluconate 10%',
  concentration: '10%',
  referenceRanges: [
    { populationType: 'neonatal', min: 8.5, max: 10.5, unit: 'mg/dL' },
    { populationType: 'child', min: 9.0, max: 11.0, unit: 'mg/dL' }
  ]
};

const mockComparison = {
  id: 'comp-123',
  ingredientId: 'ing-123',
  mode: 'populations' as const,
  timestamp: new Date(),
  comparisons: [
    {
      left: {
        label: 'Neonatal',
        population: 'neonatal' as const,
        content: { name: 'Calcium Gluconate', volume: '10 mL' }
      },
      right: {
        label: 'Child',
        population: 'child' as const,
        content: { name: 'Calcium Gluconate', volume: '20 mL' }
      },
      diff: [],
      statistics: { additions: 1, deletions: 1, modifications: 0 }
    }
  ],
  summary: {
    totalComparisons: 1,
    totalChanges: 2,
    changedFields: ['volume'],
    identicalPairs: 0
  }
};

const defaultState = {
  diffViewer: {
    currentComparison: null,
    currentIngredient: null,
    viewMode: 'side-by-side' as const,
    showIdentical: true,
    granularity: 'line' as const,
    selectedPopulations: [],
    selectedVersions: null,
    comparisonMode: 'populations' as const,
    comparisonHistory: [],
    loading: false,
    error: null,
    exportInProgress: false,
    lastExportedAt: null
  }
};

const meta: Meta<typeof DiffViewerModal> = {
  title: 'Features/DiffViewer/DiffViewerModal',
  component: DiffViewerModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Full-featured modal dialog for diff viewing with controls, export options, and keyboard shortcuts.'
      }
    }
  },
  decorators: [
    (Story, context) => {
      const store = createMockStore({
        diffViewer: {
          ...defaultState.diffViewer,
          ...context.args.storeOverrides
        }
      });

      return (
        <Provider store={store}>
          <div style={{ height: '100vh' }}>
            <Story />
          </div>
        </Provider>
      );
    }
  ],
  argTypes: {
    open: {
      control: { type: 'boolean' },
      description: 'Whether the modal is open',
      defaultValue: true
    },
    onClose: {
      action: 'close',
      description: 'Callback when modal is closed'
    },
    ingredient: {
      control: { type: 'object' },
      description: 'The ingredient to compare'
    },
    initialMode: {
      control: { type: 'radio' },
      options: ['populations', 'versions'],
      description: 'Initial comparison mode',
      defaultValue: 'populations'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default open modal
export const Default: Story = {
  args: {
    open: true,
    onClose: fn(),
    ingredient: mockIngredient,
    initialMode: 'populations'
  },
  parameters: {
    docs: {
      description: {
        story: 'Default modal state with no comparison data loaded.'
      }
    }
  }
};

// Modal with comparison loaded
export const WithComparison: Story = {
  args: {
    open: true,
    onClose: fn(),
    ingredient: mockIngredient,
    storeOverrides: {
      currentComparison: mockComparison,
      currentIngredient: mockIngredient
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal with comparison data already loaded and displayed.'
      }
    }
  }
};

// Loading state
export const Loading: Story = {
  args: {
    open: true,
    onClose: fn(),
    ingredient: mockIngredient,
    storeOverrides: {
      loading: true
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal showing loading state while fetching comparison data.'
      }
    }
  }
};

// Error state
export const WithError: Story = {
  args: {
    open: true,
    onClose: fn(),
    ingredient: mockIngredient,
    storeOverrides: {
      error: 'Failed to load comparison data. Network error occurred.'
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal displaying an error message.'
      }
    }
  }
};

// With comparison history
export const WithHistory: Story = {
  args: {
    open: true,
    onClose: fn(),
    ingredient: mockIngredient,
    storeOverrides: {
      currentComparison: mockComparison,
      currentIngredient: mockIngredient,
      comparisonHistory: [
        mockComparison,
        { ...mockComparison, id: 'comp-124', timestamp: new Date(Date.now() - 300000) },
        { ...mockComparison, id: 'comp-125', timestamp: new Date(Date.now() - 600000) }
      ]
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal with comparison history for navigation between previous comparisons.'
      }
    }
  }
};

// Fullscreen mode
export const Fullscreen: Story = {
  args: {
    open: true,
    onClose: fn(),
    ingredient: mockIngredient,
    storeOverrides: {
      currentComparison: mockComparison,
      currentIngredient: mockIngredient
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fullscreenButton = await canvas.findByLabelText(/toggle fullscreen/i);
    await userEvent.click(fullscreenButton);
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal in fullscreen mode after clicking the fullscreen button.'
      }
    }
  }
};

// Help panel open
export const WithHelpPanel: Story = {
  args: {
    open: true,
    onClose: fn(),
    ingredient: mockIngredient,
    storeOverrides: {
      currentComparison: mockComparison,
      currentIngredient: mockIngredient
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const helpButton = await canvas.findByLabelText(/keyboard shortcuts/i);
    await userEvent.click(helpButton);
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal with help panel showing keyboard shortcuts.'
      }
    }
  }
};

// Mobile responsive view
export const MobileView: Story = {
  args: {
    open: true,
    onClose: fn(),
    ingredient: mockIngredient,
    storeOverrides: {
      currentComparison: mockComparison,
      currentIngredient: mockIngredient
    }
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Modal rendered in mobile viewport showing responsive layout.'
      }
    }
  }
};

// Tablet responsive view
export const TabletView: Story = {
  args: {
    open: true,
    onClose: fn(),
    ingredient: mockIngredient,
    storeOverrides: {
      currentComparison: mockComparison,
      currentIngredient: mockIngredient
    }
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet'
    },
    docs: {
      description: {
        story: 'Modal rendered in tablet viewport showing responsive layout.'
      }
    }
  }
};

// Version comparison mode
export const VersionMode: Story = {
  args: {
    open: true,
    onClose: fn(),
    ingredient: mockIngredient,
    initialMode: 'versions',
    storeOverrides: {
      comparisonMode: 'versions',
      selectedVersions: { v1: 1, v2: 2 },
      currentComparison: {
        ...mockComparison,
        mode: 'versions' as const,
        comparisons: [{
          ...mockComparison.comparisons[0],
          left: { ...mockComparison.comparisons[0].left, label: 'Version 1', version: 1 },
          right: { ...mockComparison.comparisons[0].right, label: 'Version 2', version: 2 }
        }]
      }
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal configured for version comparison mode.'
      }
    }
  }
};

// Export menu interaction
export const ExportInteraction: Story = {
  args: {
    open: true,
    onClose: fn(),
    ingredient: mockIngredient,
    storeOverrides: {
      currentComparison: mockComparison,
      currentIngredient: mockIngredient
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Test export buttons are present
    const exportHtmlButton = await canvas.findByText(/export html/i);
    expect(exportHtmlButton).toBeInTheDocument();
    
    const exportPdfButton = await canvas.findByText(/export pdf/i);
    expect(exportPdfButton).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal with export functionality highlighted.'
      }
    }
  }
};

// Closed modal
export const Closed: Story = {
  args: {
    open: false,
    onClose: fn(),
    ingredient: mockIngredient
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal in closed state (not visible).'
      }
    }
  }
};