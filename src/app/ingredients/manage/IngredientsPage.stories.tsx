import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import IngredientsManagePage from './page'
import { Provider } from 'react-redux'
import { createMockStore } from '@/app/store/mockStore'

const meta = {
  title: 'Pages/Ingredients Manager',
  component: IngredientsManagePage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Ingredient management page with list, search, filters, and import/export functionality',
      },
    },
  },
  decorators: [
    (Story) => (
      <Provider store={createMockStore()}>
        <Story />
      </Provider>
    ),
  ],
} satisfies Meta<typeof IngredientsManagePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Empty List',
  parameters: {
    docs: {
      description: {
        story: 'Ingredient manager with no ingredients',
      },
    },
  },
}

export const WithIngredients: Story = {
  name: 'With Ingredients',
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        ingredients: {
          items: [
            {
              id: '1',
              displayName: 'Standard PN Adult',
              category: 'parenteral',
              calories: 2100,
              protein: 84,
              carbs: 280,
              fat: 70,
              sodium: 140,
              potassium: 70,
            },
            {
              id: '2',
              displayName: 'Pediatric Formula',
              category: 'pediatric',
              calories: 1500,
              protein: 60,
              carbs: 200,
              fat: 50,
              sodium: 100,
              potassium: 50,
            },
            {
              id: '3',
              displayName: 'Neonatal Mix',
              category: 'neonatal',
              calories: 800,
              protein: 32,
              carbs: 106,
              fat: 27,
              sodium: 53,
              potassium: 27,
            },
          ],
          loading: false,
          error: null,
          duplicates: [],
          importDialogOpen: false,
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Ingredient manager with sample ingredients',
      },
    },
  },
}

export const WithDuplicates: Story = {
  name: 'Duplicate Detection',
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        ingredients: {
          items: [
            {
              id: '1',
              displayName: 'Standard PN',
              category: 'parenteral',
              calories: 2100,
            },
            {
              id: '2',
              displayName: 'Standard PN',
              category: 'parenteral',
              calories: 2100,
            },
            {
              id: '3',
              displayName: 'Standard PN',
              category: 'enteral',
              calories: 2000,
            },
          ],
          duplicates: ['2', '3'],
          loading: false,
          error: null,
          importDialogOpen: false,
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Showing duplicate detection feature',
      },
    },
  },
}

export const ImportMode: Story = {
  name: 'Import Dialog Open',
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        ingredients: {
          items: [],
          importDialogOpen: true,
          loading: false,
          error: null,
          duplicates: [],
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Ingredient manager with import dialog open',
      },
    },
  },
}

export const LoadingState: Story = {
  name: 'Loading',
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        ingredients: {
          items: [],
          loading: true,
          error: null,
          duplicates: [],
          importDialogOpen: false,
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Ingredient manager in loading state',
      },
    },
  },
}

export const ErrorState: Story = {
  name: 'Error State',
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        ingredients: {
          items: [],
          loading: false,
          error: 'Failed to load ingredients',
          duplicates: [],
          importDialogOpen: false,
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Ingredient manager showing error state',
      },
    },
  },
}

export const MobileView: Story = {
  name: 'Mobile View',
  parameters: {
    viewport: {
      defaultViewport: 'iphone12',
    },
    docs: {
      description: {
        story: 'Ingredient manager on mobile',
      },
    },
  },
}