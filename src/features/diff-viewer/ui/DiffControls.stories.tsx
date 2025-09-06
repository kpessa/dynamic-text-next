import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DiffControls } from './DiffControls';
import diffReducer from '../model/diffSlice';
import { fn } from '@storybook/test';

// Create a mock store for stories
const createMockStore = (initialState?: any) => {
  return configureStore({
    reducer: {
      diffViewer: diffReducer
    },
    preloadedState: initialState
  });
};

const defaultState = {
  diffViewer: {
    currentComparison: null,
    currentIngredient: { id: 'ing-123', name: 'Test Ingredient' },
    viewMode: 'side-by-side',
    showIdentical: true,
    granularity: 'line',
    selectedPopulations: [],
    selectedVersions: null,
    comparisonMode: 'populations',
    comparisonHistory: [],
    loading: false,
    error: null,
    exportInProgress: false,
    lastExportedAt: null
  }
};

const meta: Meta<typeof DiffControls> = {
  title: 'Features/DiffViewer/DiffControls',
  component: DiffControls,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Control panel for the diff viewer that allows users to select comparison options and configure the view.'
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
          <Story />
        </Provider>
      );
    }
  ],
  argTypes: {
    onCompare: {
      action: 'compare',
      description: 'Callback when compare button is clicked'
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS class name'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - Population comparison mode
export const PopulationMode: Story = {
  args: {
    onCompare: fn()
  },
  parameters: {
    docs: {
      description: {
        story: 'Default state showing population comparison mode with no selections.'
      }
    }
  }
};

// Population mode with selections
export const PopulationModeWithSelections: Story = {
  args: {
    onCompare: fn(),
    storeOverrides: {
      selectedPopulations: ['neonatal', 'child']
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Population comparison mode with two populations selected.'
      }
    }
  }
};

// Version comparison mode
export const VersionMode: Story = {
  args: {
    onCompare: fn(),
    storeOverrides: {
      comparisonMode: 'versions',
      selectedVersions: { v1: 1, v2: 2 },
      selectedPopulations: ['neonatal']
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Version comparison mode with version numbers selected.'
      }
    }
  }
};

// Unified view mode
export const UnifiedViewMode: Story = {
  args: {
    onCompare: fn(),
    storeOverrides: {
      viewMode: 'unified'
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Controls with unified view mode selected.'
      }
    }
  }
};

// Word-level granularity
export const WordGranularity: Story = {
  args: {
    onCompare: fn(),
    storeOverrides: {
      granularity: 'word'
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Controls with word-level diff granularity selected.'
      }
    }
  }
};

// Character-level granularity
export const CharacterGranularity: Story = {
  args: {
    onCompare: fn(),
    storeOverrides: {
      granularity: 'char'
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Controls with character-level diff granularity selected.'
      }
    }
  }
};

// Show identical disabled
export const HideIdentical: Story = {
  args: {
    onCompare: fn(),
    storeOverrides: {
      showIdentical: false
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Controls with "Show Identical" toggle turned off.'
      }
    }
  }
};

// All populations selected
export const AllPopulationsSelected: Story = {
  args: {
    onCompare: fn(),
    storeOverrides: {
      selectedPopulations: ['neonatal', 'child', 'adolescent', 'adult']
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Population mode with all four populations selected for comparison.'
      }
    }
  }
};

// Advanced options expanded
export const AdvancedOptionsExpanded: Story = {
  args: {
    onCompare: fn()
  },
  play: async ({ canvasElement }) => {
    // Simulate clicking the advanced options accordion
    const accordion = canvasElement.querySelector('[aria-expanded="false"]');
    if (accordion) {
      (accordion as HTMLElement).click();
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Controls with advanced options panel expanded (currently showing disabled options for future implementation).'
      }
    }
  }
};

// No ingredient selected
export const NoIngredientSelected: Story = {
  args: {
    onCompare: fn(),
    storeOverrides: {
      currentIngredient: null
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Controls when no ingredient is selected - compare button should be disabled.'
      }
    }
  }
};

// Minimal populations selected
export const MinimalPopulationsSelected: Story = {
  args: {
    onCompare: fn(),
    storeOverrides: {
      selectedPopulations: ['neonatal']
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Population mode with only one population selected - compare button should be disabled.'
      }
    }
  }
};

// Version mode without versions
export const VersionModeNoVersions: Story = {
  args: {
    onCompare: fn(),
    storeOverrides: {
      comparisonMode: 'versions',
      selectedVersions: null
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Version mode without version numbers selected - compare button should be disabled.'
      }
    }
  }
};

// Mobile responsive view
export const MobileView: Story = {
  args: {
    onCompare: fn(),
    storeOverrides: {
      selectedPopulations: ['neonatal', 'child']
    }
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Controls rendered in mobile viewport showing responsive layout.'
      }
    }
  }
};