import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { IngredientVariantManager } from './IngredientVariantManager'
import variantReducer, { VariantState, Ingredient, IngredientVariant } from '../store/variantSlice'

// Create mock data
const createMockVariant = (
  id: string,
  population: 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT',
  healthSystem: string,
  syncStatus: 'synced' | 'conflict' | 'outdated' | 'unknown' = 'synced',
  validationStatus: 'valid' | 'warning' | 'error' | 'pending' = 'valid',
  testsEnabled = 2,
  testsTotal = 3
): IngredientVariant => ({
  id,
  ingredientId: id.split('-')[0],
  ingredientType: 'Macronutrient',
  population,
  healthSystem,
  domain: 'build-main',
  subdomain: 'production',
  sections: {
    static: [
      { id: 's1', title: 'Description', content: '<p>Sample content</p>', type: 'static' },
      { id: 's2', title: 'Usage', content: '<p>Usage instructions</p>', type: 'static' },
    ],
    dynamic: [
      { 
        id: 'd1', 
        title: 'Calculations', 
        content: '', 
        type: 'dynamic',
        template: '{{value}} * {{multiplier}}',
        variables: { value: 10, multiplier: 2 }
      },
    ],
  },
  tests: Array.from({ length: testsTotal }, (_, i) => ({
    id: `test-${i}`,
    name: `Test ${i + 1}`,
    variables: { input: i * 10 },
    expected: `result-${i}`,
    enabled: i < testsEnabled,
  })),
  lastUpdated: new Date('2024-01-09'),
  validationStatus,
  syncStatus,
  version: '1.0.0',
})

const createMockIngredient = (
  id: string,
  name: string,
  type: 'Macronutrient' | 'Micronutrient' | 'Additive' | 'Salt' | 'Diluent' | 'Other',
  hasSyncConflicts = false
): Ingredient => ({
  id,
  name,
  keyname: name.toLowerCase().replace(/\s+/g, '_'),
  display: name,
  type,
  variants: [],
  tests: [],
  hasSyncConflicts,
})

// Create mock store
const createMockStore = (initialState: Partial<VariantState> = {}) => {
  return configureStore({
    reducer: {
      variants: variantReducer,
    },
    preloadedState: {
      variants: {
        ingredientsByType: {
          Macronutrient: [],
          Micronutrient: [],
          Additive: [],
          Salt: [],
          Diluent: [],
          Other: [],
        },
        selectedVariantId: null,
        selectedIngredientId: null,
        expandedIngredients: [],
        expandedTypes: [],
        syncStatus: {},
        loading: false,
        error: null,
        filters: {
          population: null,
          healthSystem: null,
          validationStatus: null,
          syncStatus: null,
        },
        ...initialState,
      },
    },
  })
}

const meta: Meta<typeof IngredientVariantManager> = {
  title: 'Features/IngredientManagement/IngredientVariantManager',
  component: IngredientVariantManager,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story, context) => {
      const storeState = (context.args as any).storeState
      const store = createMockStore(storeState)
      return (
        <Provider store={store}>
          <div style={{ height: '600px', width: '400px', border: '1px solid #ddd' }}>
            <Story />
          </div>
        </Provider>
      )
    },
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// Stories
export const EmptyState: Story = {
  args: {
    storeState: {
      ingredientsByType: {
        Macronutrient: [],
        Micronutrient: [],
        Additive: [],
        Salt: [],
        Diluent: [],
        Other: [],
      },
    },
  },
}

export const WithIngredients: Story = {
  args: {
    storeState: {
      ingredientsByType: {
        Macronutrient: [
          createMockIngredient('protein', 'Protein', 'Macronutrient'),
          createMockIngredient('dextrose', 'Dextrose', 'Macronutrient'),
          createMockIngredient('lipids', 'Lipids', 'Macronutrient'),
        ],
        Micronutrient: [
          createMockIngredient('vitamin-d', 'Vitamin D', 'Micronutrient'),
          createMockIngredient('calcium', 'Calcium', 'Micronutrient'),
        ],
        Additive: [
          createMockIngredient('heparin', 'Heparin', 'Additive'),
        ],
        Salt: [
          createMockIngredient('sodium-chloride', 'Sodium Chloride', 'Salt'),
        ],
        Diluent: [
          createMockIngredient('tpn-volume', 'TPN Volume', 'Diluent'),
        ],
        Other: [],
      },
    },
  },
}

export const WithVariants: Story = {
  args: {
    storeState: {
      ingredientsByType: {
        Macronutrient: [
          {
            ...createMockIngredient('protein', 'Protein', 'Macronutrient'),
            variants: [
              createMockVariant('protein-neo-choc', 'NEO', 'CHOC'),
              createMockVariant('protein-neo-uhs', 'NEO', 'UHS'),
              createMockVariant('protein-child-choc', 'CHILD', 'CHOC'),
              createMockVariant('protein-child-uhs', 'CHILD', 'UHS'),
            ],
            tests: Array.from({ length: 5 }, (_, i) => ({
              id: `test-${i}`,
              name: `Integration Test ${i + 1}`,
              variables: {},
              enabled: true,
            })),
          },
          {
            ...createMockIngredient('dextrose', 'Dextrose', 'Macronutrient'),
            variants: [
              createMockVariant('dextrose-adult-choc', 'ADULT', 'CHOC'),
            ],
          },
        ],
        Micronutrient: [],
        Additive: [],
        Salt: [],
        Diluent: [],
        Other: [],
      },
      expandedTypes: ['Macronutrient'],
      expandedIngredients: ['protein'],
    },
  },
}

export const WithSyncConflicts: Story = {
  args: {
    storeState: {
      ingredientsByType: {
        Macronutrient: [
          {
            ...createMockIngredient('protein', 'Protein', 'Macronutrient', true),
            variants: [
              createMockVariant('protein-neo-choc', 'NEO', 'CHOC', 'conflict'),
              createMockVariant('protein-neo-uhs', 'NEO', 'UHS', 'synced'),
            ],
          },
          {
            ...createMockIngredient('dextrose', 'Dextrose', 'Macronutrient', true),
            variants: [
              createMockVariant('dextrose-child-choc', 'CHILD', 'CHOC', 'outdated'),
            ],
          },
        ],
        Micronutrient: [],
        Additive: [],
        Salt: [],
        Diluent: [],
        Other: [],
      },
      expandedTypes: ['Macronutrient'],
    },
  },
}

export const WithValidationIssues: Story = {
  args: {
    storeState: {
      ingredientsByType: {
        Macronutrient: [
          {
            ...createMockIngredient('protein', 'Protein', 'Macronutrient'),
            variants: [
              createMockVariant('protein-neo-choc', 'NEO', 'CHOC', 'synced', 'valid'),
              createMockVariant('protein-neo-uhs', 'NEO', 'UHS', 'synced', 'warning'),
              createMockVariant('protein-child-choc', 'CHILD', 'CHOC', 'synced', 'error'),
              createMockVariant('protein-child-uhs', 'CHILD', 'UHS', 'synced', 'pending'),
            ],
          },
        ],
        Micronutrient: [],
        Additive: [],
        Salt: [],
        Diluent: [],
        Other: [],
      },
      expandedTypes: ['Macronutrient'],
      expandedIngredients: ['protein'],
    },
  },
}

export const WithTestFailures: Story = {
  args: {
    storeState: {
      ingredientsByType: {
        Macronutrient: [
          {
            ...createMockIngredient('protein', 'Protein', 'Macronutrient'),
            variants: [
              createMockVariant('protein-neo-choc', 'NEO', 'CHOC', 'synced', 'valid', 3, 3), // All pass
              createMockVariant('protein-neo-uhs', 'NEO', 'UHS', 'synced', 'valid', 1, 3), // Partial
              createMockVariant('protein-child-choc', 'CHILD', 'CHOC', 'synced', 'valid', 0, 3), // All fail
              createMockVariant('protein-child-uhs', 'CHILD', 'UHS', 'synced', 'valid', 0, 0), // No tests
            ],
          },
        ],
        Micronutrient: [],
        Additive: [],
        Salt: [],
        Diluent: [],
        Other: [],
      },
      expandedTypes: ['Macronutrient'],
      expandedIngredients: ['protein'],
    },
  },
}

export const AllPopulations: Story = {
  args: {
    storeState: {
      ingredientsByType: {
        Macronutrient: [
          {
            ...createMockIngredient('vitamin-d', 'Vitamin D', 'Macronutrient'),
            variants: [
              createMockVariant('vit-d-neo', 'NEO', 'CHOC'),
              createMockVariant('vit-d-child', 'CHILD', 'CHOC'),
              createMockVariant('vit-d-adolescent', 'ADOLESCENT', 'CHOC'),
              createMockVariant('vit-d-adult', 'ADULT', 'CHOC'),
            ],
          },
        ],
        Micronutrient: [],
        Additive: [],
        Salt: [],
        Diluent: [],
        Other: [],
      },
      expandedTypes: ['Macronutrient'],
      expandedIngredients: ['vitamin-d'],
    },
  },
}

export const LoadingState: Story = {
  args: {
    storeState: {
      loading: true,
    },
  },
}

export const ErrorState: Story = {
  args: {
    storeState: {
      error: 'Failed to load ingredient variants. Please check your connection and try again.',
    },
  },
}

export const ComplexScenario: Story = {
  args: {
    storeState: {
      ingredientsByType: {
        Macronutrient: [
          {
            ...createMockIngredient('protein', 'Protein', 'Macronutrient', true),
            variants: [
              createMockVariant('protein-neo-choc', 'NEO', 'CHOC', 'conflict', 'error', 0, 5),
              createMockVariant('protein-neo-uhs', 'NEO', 'UHS', 'synced', 'valid', 5, 5),
              createMockVariant('protein-child-choc', 'CHILD', 'CHOC', 'outdated', 'warning', 3, 5),
            ],
            tests: Array.from({ length: 10 }, (_, i) => ({
              id: `test-${i}`,
              name: `Test ${i + 1}`,
              variables: {},
              enabled: i < 7,
            })),
          },
          {
            ...createMockIngredient('dextrose', 'Dextrose', 'Macronutrient'),
            variants: [
              createMockVariant('dextrose-adult-choc', 'ADULT', 'CHOC', 'synced', 'valid', 2, 2),
            ],
          },
        ],
        Micronutrient: [
          {
            ...createMockIngredient('calcium', 'Calcium', 'Micronutrient'),
            variants: [
              createMockVariant('calcium-neo-choc', 'NEO', 'CHOC', 'synced', 'valid', 1, 1),
            ],
          },
        ],
        Additive: [
          {
            ...createMockIngredient('heparin', 'Heparin', 'Additive'),
            variants: [],
          },
        ],
        Salt: [],
        Diluent: [],
        Other: [],
      },
      expandedTypes: ['Macronutrient', 'Micronutrient'],
      expandedIngredients: ['protein'],
      selectedVariantId: 'protein-neo-uhs',
    },
  },
}