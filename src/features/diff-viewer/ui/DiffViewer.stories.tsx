import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DiffViewer } from './DiffViewer';
import diffReducer from '../model/diffSlice';
import { ComparisonResult } from '../lib/comparisonService';

// Create a mock store for stories
const createMockStore = (initialState?: any) => {
  return configureStore({
    reducer: {
      diffViewer: diffReducer
    },
    preloadedState: initialState
  });
};

// Mock comparison data
const mockComparison: ComparisonResult = {
  id: 'comp-123',
  ingredientId: 'ing-456',
  mode: 'populations',
  timestamp: new Date(),
  comparisons: [
    {
      left: {
        label: 'Neonatal',
        population: 'neonatal',
        content: {
          name: 'Calcium Gluconate',
          concentration: '10%',
          volume: '10 mL',
          referenceRange: {
            min: 8.5,
            max: 10.5,
            unit: 'mg/dL'
          }
        }
      },
      right: {
        label: 'Child',
        population: 'child',
        content: {
          name: 'Calcium Gluconate',
          concentration: '10%',
          volume: '20 mL',
          referenceRange: {
            min: 9.0,
            max: 11.0,
            unit: 'mg/dL'
          }
        }
      },
      diff: [
        { type: 'unchanged', lineNumber: 1, content: '  name: "Calcium Gluconate"' },
        { type: 'unchanged', lineNumber: 2, content: '  concentration: "10%"' },
        { type: 'deleted', lineNumber: 3, content: '  volume: "10 mL"', oldContent: '  volume: "10 mL"' },
        { type: 'added', lineNumber: 4, content: '  volume: "20 mL"', newContent: '  volume: "20 mL"' },
        { type: 'modified', lineNumber: 5, content: '  referenceRange:', oldContent: '    min: 8.5', newContent: '    min: 9.0' }
      ],
      statistics: {
        additions: 2,
        deletions: 1,
        modifications: 1
      }
    }
  ],
  summary: {
    totalComparisons: 1,
    totalChanges: 4,
    changedFields: ['volume', 'referenceRange.min', 'referenceRange.max'],
    identicalPairs: 0
  }
};

const meta: Meta<typeof DiffViewer> = {
  title: 'Features/DiffViewer/DiffViewer',
  component: DiffViewer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Main diff viewer component that displays comparison results with syntax highlighting and statistics.'
      }
    }
  },
  decorators: [
    (Story, context) => {
      const store = createMockStore({
        diffViewer: {
          currentComparison: context.args.comparison || mockComparison,
          currentIngredient: null,
          viewMode: context.args.viewMode || 'side-by-side',
          showIdentical: context.args.showIdentical !== false,
          granularity: context.args.granularity || 'line',
          selectedPopulations: [],
          selectedVersions: null,
          comparisonMode: 'populations',
          comparisonHistory: [],
          loading: context.args.loading || false,
          error: context.args.error || null,
          exportInProgress: false,
          lastExportedAt: null
        }
      });

      return (
        <Provider store={store}>
          <Story />
        </Provider>
      );
    }
  ],
  argTypes: {
    height: {
      control: { type: 'text' },
      description: 'Height of the diff viewer',
      defaultValue: '600px'
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS class name'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story with population comparison
export const PopulationComparison: Story = {
  args: {
    height: 600
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a comparison between two populations (Neonatal and Child) with differences highlighted.'
      }
    }
  }
};

// Version comparison story
export const VersionComparison: Story = {
  args: {
    height: 600,
    comparison: {
      ...mockComparison,
      mode: 'versions',
      comparisons: [{
        ...mockComparison.comparisons[0],
        left: {
          ...mockComparison.comparisons[0].left,
          label: 'Version 1',
          version: 1
        },
        right: {
          ...mockComparison.comparisons[0].right,
          label: 'Version 2',
          version: 2
        }
      }]
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a comparison between two versions of the same population.'
      }
    }
  }
};

// Loading state
export const Loading: Story = {
  args: {
    height: 600,
    loading: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state while comparison data is being fetched.'
      }
    }
  }
};

// Error state
export const Error: Story = {
  args: {
    height: 600,
    error: 'Failed to load comparison data. Please try again.'
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the error state when comparison fails.'
      }
    }
  }
};

// No data state
export const NoData: Story = {
  args: {
    height: 600,
    comparison: null
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the empty state when no comparison data is available.'
      }
    }
  }
};

// Multiple comparisons
export const MultipleComparisons: Story = {
  args: {
    height: 800,
    comparison: {
      ...mockComparison,
      comparisons: [
        mockComparison.comparisons[0],
        {
          ...mockComparison.comparisons[0],
          left: {
            ...mockComparison.comparisons[0].left,
            label: 'Adolescent',
            population: 'adolescent'
          },
          right: {
            ...mockComparison.comparisons[0].right,
            label: 'Adult',
            population: 'adult'
          }
        }
      ],
      summary: {
        ...mockComparison.summary,
        totalComparisons: 2,
        totalChanges: 8
      }
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows multiple population comparisons in a single view.'
      }
    }
  }
};

// Identical content
export const IdenticalContent: Story = {
  args: {
    height: 600,
    comparison: {
      ...mockComparison,
      comparisons: [{
        ...mockComparison.comparisons[0],
        diff: [
          { type: 'unchanged', lineNumber: 1, content: '  name: "Calcium Gluconate"' },
          { type: 'unchanged', lineNumber: 2, content: '  concentration: "10%"' },
          { type: 'unchanged', lineNumber: 3, content: '  volume: "10 mL"' }
        ],
        statistics: {
          additions: 0,
          deletions: 0,
          modifications: 0
        }
      }],
      summary: {
        ...mockComparison.summary,
        totalChanges: 0,
        changedFields: [],
        identicalPairs: 1
      }
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows when compared content is identical with no differences.'
      }
    }
  }
};

// Unified view mode
export const UnifiedView: Story = {
  args: {
    height: 600,
    viewMode: 'unified'
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the diff in unified view mode instead of side-by-side.'
      }
    }
  }
};

// With hidden identical lines
export const HiddenIdentical: Story = {
  args: {
    height: 600,
    showIdentical: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the diff with identical lines hidden to focus on changes.'
      }
    }
  }
};