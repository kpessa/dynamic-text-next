import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import DashboardPage from './page'
import { Provider } from 'react-redux'
import { createMockStore } from '@/app/store/mockStore'

const meta = {
  title: 'Pages/Dashboard',
  component: DashboardPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main dashboard with quick actions, recent activity, and statistics',
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
} satisfies Meta<typeof DashboardPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Empty Dashboard',
  parameters: {
    docs: {
      description: {
        story: 'Dashboard with no recent activity',
      },
    },
  },
}

export const WithRecentActivity: Story = {
  name: 'With Activity',
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
          history: [
            {
              id: '1',
              instanceId: 'default',
              timestamp: new Date().toISOString(),
              inputValues: { weight: 70, height: 175, age: 45 },
              calculatedValues: {
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
              advisorType: 'ADULT',
              userId: 'user1',
            },
            {
              id: '2',
              instanceId: 'default',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              inputValues: { weight: 25, height: 120, age: 8 },
              calculatedValues: {
                calories: 1500,
                protein: 60,
                carbohydrates: 200,
                lipids: 50,
                sodium: 100,
                potassium: 50,
                calcium: 25,
                magnesium: 7.5,
                phosphorus: 25,
              },
              advisorType: 'CHILD',
              userId: 'user1',
            },
          ]
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Dashboard showing recent calculations and activity',
      },
    },
  },
}

export const MobileView: Story = {
  name: 'Mobile Dashboard',
  parameters: {
    viewport: {
      defaultViewport: 'iphone12',
    },
    docs: {
      description: {
        story: 'Dashboard optimized for mobile viewing',
      },
    },
  },
}

export const TabletView: Story = {
  name: 'Tablet Dashboard',
  parameters: {
    viewport: {
      defaultViewport: 'ipad',
    },
    docs: {
      description: {
        story: 'Dashboard on tablet screen',
      },
    },
  },
}

export const DarkMode: Story = {
  name: 'Dark Mode',
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Dashboard with dark theme',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#121212', minHeight: '100vh' }}>
        <Story />
      </div>
    ),
  ],
}