import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import TPNCalculatorPage from './page'
import { Provider } from 'react-redux'
import { createMockStore } from '@/app/store/mockStore'

const meta = {
  title: 'Pages/TPN Calculator',
  component: TPNCalculatorPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Full TPN Calculator page with input form, results display, and validation',
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
} satisfies Meta<typeof TPNCalculatorPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Default (Empty)',
  parameters: {
    docs: {
      description: {
        story: 'TPN Calculator page in its initial state, ready for data input',
      },
    },
  },
}

export const WithAdultData: Story = {
  name: 'Adult Patient',
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        tpn: {
          instances: [],
          activeInstanceId: null,
          advisorType: 'ADULT',
          calculations: {
            loading: false,
            results: null,
            errors: [],
            warnings: []
          },
          history: []
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Calculator with adult patient data pre-filled',
      },
    },
  },
}

export const WithCalculationResults: Story = {
  name: 'With Results',
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        tpn: {
          instances: [],
          activeInstanceId: null,
          advisorType: 'ADULT',
          calculations: {
            loading: false,
            results: {
              calories: 2100,
              protein: 84,
              carbohydrates: 280,
              lipids: 70,
              sodium: 140,
              potassium: 70,
              calcium: 35,
              magnesium: 10.5,
              phosphorus: 35,
            },
            errors: [],
            warnings: []
          },
          history: []
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Calculator showing calculation results with all tabs enabled',
      },
    },
  },
}

export const PediatricMode: Story = {
  name: 'Pediatric Patient',
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        tpn: {
          instances: [],
          activeInstanceId: null,
          advisorType: 'CHILD',
          calculations: {
            loading: false,
            results: null,
            errors: [],
            warnings: []
          },
          history: []
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Calculator configured for pediatric patients',
      },
    },
  },
}

export const NeonatalMode: Story = {
  name: 'Neonatal Patient',
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        tpn: {
          instances: [],
          activeInstanceId: null,
          advisorType: 'NEO',
          calculations: {
            loading: false,
            results: null,
            errors: [],
            warnings: []
          },
          history: []
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Calculator configured for neonatal patients with specific fields',
      },
    },
  },
}

export const LoadingState: Story = {
  name: 'Loading State',
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        tpn: {
          instances: [],
          activeInstanceId: null,
          advisorType: 'ADULT',
          calculations: {
            loading: true,
            results: null,
            errors: [],
            warnings: []
          },
          history: []
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Calculator in loading state while calculation is in progress',
      },
    },
  },
}

export const WithValidationErrors: Story = {
  name: 'Validation Errors',
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        tpn: {
          instances: [],
          activeInstanceId: null,
          advisorType: 'ADULT',
          calculations: {
            loading: false,
            results: null,
            errors: ['Invalid input values'],
            warnings: ['Weight is below recommended range', 'Age exceeds maximum value']
          },
          history: []
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Calculator showing validation errors for invalid inputs',
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
        story: 'TPN Calculator optimized for mobile devices',
      },
    },
  },
}

export const TabletView: Story = {
  name: 'Tablet View',
  parameters: {
    viewport: {
      defaultViewport: 'ipad',
    },
    docs: {
      description: {
        story: 'TPN Calculator on tablet devices',
      },
    },
  },
}