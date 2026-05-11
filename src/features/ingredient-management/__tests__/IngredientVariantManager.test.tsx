import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { IngredientVariantManager } from '../ui/IngredientVariantManager'
import variantReducer, { 
  Ingredient,
  IngredientVariant,
} from '../store/variantSlice'

// Mock data
const mockVariant: IngredientVariant = {
  id: 'variant-1',
  ingredientId: 'ing-1',
  ingredientType: 'Macronutrient',
  population: 'NEO',
  healthSystem: 'CHOC',
  domain: 'build-main',
  subdomain: 'production',
  sections: {
    static: [{ id: 's1', title: 'Test', content: '<p>Test content</p>', type: 'static' }],
    dynamic: [],
  },
  tests: [
    { id: 't1', name: 'Test 1', variables: {}, expected: 'result', enabled: true },
    { id: 't2', name: 'Test 2', variables: {}, expected: 'result', enabled: true },
  ],
  lastUpdated: new Date('2024-01-09'),
  validationStatus: 'valid',
  syncStatus: 'synced',
  version: '1.0.0',
}

const mockIngredient: Ingredient = {
  id: 'ing-1',
  name: 'Protein',
  keyname: 'protein',
  display: 'Protein',
  type: 'Macronutrient',
  variants: [mockVariant],
  tests: [
    { id: 't1', name: 'Test 1', variables: {}, expected: 'result', enabled: true },
    { id: 't2', name: 'Test 2', variables: {}, expected: 'result', enabled: true },
    { id: 't3', name: 'Test 3', variables: {}, expected: 'result', enabled: false },
  ],
  hasSyncConflicts: false,
}

const mockIngredientWithConflict: Ingredient = {
  ...mockIngredient,
  id: 'ing-2',
  name: 'Dextrose',
  keyname: 'dextrose',
  display: 'Dextrose',
  hasSyncConflicts: true,
  variants: [
    { ...mockVariant, id: 'variant-2', syncStatus: 'conflict' },
  ],
}

// Create a test store
const createTestStore = (initialState = {}) => {
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

describe('IngredientVariantManager', () => {
  let store: ReturnType<typeof createTestStore>
  const mockOnVariantSelect = vi.fn()

  beforeEach(() => {
    store = createTestStore()
    mockOnVariantSelect.mockClear()
  })

  it('renders with ingredient types', () => {
    render(
      <Provider store={store}>
        <IngredientVariantManager onVariantSelect={mockOnVariantSelect} />
      </Provider>
    )

    // Check that all ingredient types are rendered
    expect(screen.getByText('Macronutrient')).toBeInTheDocument()
    expect(screen.getByText('Micronutrient')).toBeInTheDocument()
    expect(screen.getByText('Additive')).toBeInTheDocument()
    expect(screen.getByText('Salt')).toBeInTheDocument()
    expect(screen.getByText('Diluent')).toBeInTheDocument()
    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('expands and collapses ingredient types', async () => {
    store = createTestStore({
      ingredientsByType: {
        Macronutrient: [mockIngredient],
        Micronutrient: [],
        Additive: [],
        Salt: [],
        Diluent: [],
        Other: [],
      },
    })

    render(
      <Provider store={store}>
        <IngredientVariantManager onVariantSelect={mockOnVariantSelect} />
      </Provider>
    )

    // Initially collapsed
    expect(screen.queryByText('Protein')).not.toBeInTheDocument()

    // Click to expand Macronutrient type
    const macronutrientButton = screen.getByText('Macronutrient').closest('[role="button"]')
    if (macronutrientButton) {
      fireEvent.click(macronutrientButton)
    }

    // Now ingredient should be visible
    await waitFor(() => {
      expect(screen.getByText('Protein')).toBeInTheDocument()
    })

    // Click to collapse
    if (macronutrientButton) {
      fireEvent.click(macronutrientButton)
    }

    // Ingredient should be hidden again
    await waitFor(() => {
      expect(screen.queryByText('Protein')).not.toBeInTheDocument()
    })
  })

  it('expands and collapses individual ingredients to show variants', async () => {
    store = createTestStore({
      ingredientsByType: {
        Macronutrient: [mockIngredient],
        Micronutrient: [],
        Additive: [],
        Salt: [],
        Diluent: [],
        Other: [],
      },
      expandedTypes: ['Macronutrient'],
    })

    render(
      <Provider store={store}>
        <IngredientVariantManager onVariantSelect={mockOnVariantSelect} />
      </Provider>
    )

    // Ingredient should be visible
    expect(screen.getByText('Protein')).toBeInTheDocument()

    // Initially variants are not visible
    expect(screen.queryByText('NEO')).not.toBeInTheDocument()

    // Click to expand ingredient
    const ingredientButton = screen.getByText('Protein').closest('[role="button"]')
    if (ingredientButton) {
      fireEvent.click(ingredientButton)
    }

    // Variant should now be visible
    await waitFor(() => {
      expect(screen.getByText('NEO')).toBeInTheDocument()
      expect(screen.getByText('CHOC')).toBeInTheDocument()
    })
  })

  it('displays test status correctly', () => {
    store = createTestStore({
      ingredientsByType: {
        Macronutrient: [mockIngredient],
        Micronutrient: [],
        Additive: [],
        Salt: [],
        Diluent: [],
        Other: [],
      },
      expandedTypes: ['Macronutrient'],
    })

    render(
      <Provider store={store}>
        <IngredientVariantManager onVariantSelect={mockOnVariantSelect} />
      </Provider>
    )

    // Should show "2/3 tests" for the ingredient (only enabled tests counted)
    expect(screen.getByText('2/3 tests')).toBeInTheDocument()
  })

  it('shows sync conflict indicator', () => {
    store = createTestStore({
      ingredientsByType: {
        Macronutrient: [mockIngredientWithConflict],
        Micronutrient: [],
        Additive: [],
        Salt: [],
        Diluent: [],
        Other: [],
      },
      expandedTypes: ['Macronutrient'],
    })

    render(
      <Provider store={store}>
        <IngredientVariantManager onVariantSelect={mockOnVariantSelect} />
      </Provider>
    )

    // Should show sync conflict icon for ingredient with conflicts
    const conflictIcons = screen.getAllByTestId('SyncProblemIcon')
    expect(conflictIcons.length).toBeGreaterThan(0)
  })

  it('selects a variant when clicked', async () => {
    store = createTestStore({
      ingredientsByType: {
        Macronutrient: [mockIngredient],
        Micronutrient: [],
        Additive: [],
        Salt: [],
        Diluent: [],
        Other: [],
      },
      expandedTypes: ['Macronutrient'],
      expandedIngredients: ['ing-1'],
    })

    render(
      <Provider store={store}>
        <IngredientVariantManager onVariantSelect={mockOnVariantSelect} />
      </Provider>
    )

    // Click on the variant
    const variantItem = screen.getByText('NEO').closest('[role="button"]')
    if (variantItem) {
      fireEvent.click(variantItem)
    }

    // Callback should be called with variant ID
    await waitFor(() => {
      expect(mockOnVariantSelect).toHaveBeenCalledWith('variant-1')
    })
  })

  it('displays correct population icons', () => {
    const variantsWithDifferentPopulations: IngredientVariant[] = [
      { ...mockVariant, id: 'v1', population: 'NEO' },
      { ...mockVariant, id: 'v2', population: 'CHILD' },
      { ...mockVariant, id: 'v3', population: 'ADOLESCENT' },
      { ...mockVariant, id: 'v4', population: 'ADULT' },
    ]

    const ingredientWithMultipleVariants: Ingredient = {
      ...mockIngredient,
      variants: variantsWithDifferentPopulations,
    }

    store = createTestStore({
      ingredientsByType: {
        Macronutrient: [ingredientWithMultipleVariants],
        Micronutrient: [],
        Additive: [],
        Salt: [],
        Diluent: [],
        Other: [],
      },
      expandedTypes: ['Macronutrient'],
      expandedIngredients: ['ing-1'],
    })

    render(
      <Provider store={store}>
        <IngredientVariantManager onVariantSelect={mockOnVariantSelect} />
      </Provider>
    )

    // Check that population emojis are displayed
    expect(screen.getByText('👶')).toBeInTheDocument() // NEO
    expect(screen.getByText('👧')).toBeInTheDocument() // CHILD
    expect(screen.getByText('🧑')).toBeInTheDocument() // ADOLESCENT
    expect(screen.getByText('👨')).toBeInTheDocument() // ADULT
  })

  it('displays version information', () => {
    store = createTestStore({
      ingredientsByType: {
        Macronutrient: [mockIngredient],
        Micronutrient: [],
        Additive: [],
        Salt: [],
        Diluent: [],
        Other: [],
      },
      expandedTypes: ['Macronutrient'],
      expandedIngredients: ['ing-1'],
    })

    render(
      <Provider store={store}>
        <IngredientVariantManager onVariantSelect={mockOnVariantSelect} />
      </Provider>
    )

    // Check that version is displayed
    expect(screen.getByText('v1.0.0')).toBeInTheDocument()
  })

  it('shows ingredient count badges', () => {
    store = createTestStore({
      ingredientsByType: {
        Macronutrient: [mockIngredient, mockIngredientWithConflict],
        Micronutrient: [],
        Additive: [],
        Salt: [],
        Diluent: [],
        Other: [],
      },
    })

    render(
      <Provider store={store}>
        <IngredientVariantManager onVariantSelect={mockOnVariantSelect} />
      </Provider>
    )

    // Find the chip showing count for Macronutrient (should be 2)
    const chips = screen.getAllByText('2')
    expect(chips.length).toBeGreaterThan(0)
  })
})