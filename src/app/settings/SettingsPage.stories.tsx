import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import SettingsPage from './page'
import { Provider } from 'react-redux'
import { createMockStore } from '@/app/store/mockStore'

const meta = {
  title: 'Pages/Settings',
  component: SettingsPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Settings page with theme preferences, calculation settings, and data management',
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
} satisfies Meta<typeof SettingsPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Default Settings',
  parameters: {
    docs: {
      description: {
        story: 'Settings page with default configuration',
      },
    },
  },
}

export const DarkModeEnabled: Story = {
  name: 'Dark Mode Settings',
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        settings: {
          theme: {
            mode: 'dark',
            primaryColor: '#1976d2',
            fontSize: 'medium',
          },
          calculation: {
            precision: 2,
            defaultPopulation: 'ADULT',
            autoCalculate: true,
          },
          notifications: {
            enabled: true,
            sound: true,
            desktop: false,
          },
          dataManagement: {
            autoSave: true,
            saveInterval: 60,
            backupEnabled: false,
          },
        },
      })}>
        <div style={{ backgroundColor: '#121212', minHeight: '100vh' }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Settings page with dark theme enabled',
      },
    },
  },
}

export const WithCustomPreferences: Story = {
  name: 'Custom Preferences',
  decorators: [
    (Story) => (
      <Provider store={createMockStore({
        settings: {
          theme: {
            mode: 'light',
            primaryColor: '#9c27b0',
            fontSize: 'large',
          },
          calculation: {
            precision: 3,
            defaultPopulation: 'PEDIATRIC',
            autoCalculate: false,
          },
          dataManagement: {
            autoSave: true,
            saveInterval: 30,
            backupEnabled: true,
          },
          notifications: {
            enabled: false,
            sound: false,
            desktop: false,
          },
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Settings page with customized preferences',
      },
    },
  },
}

export const MobileView: Story = {
  name: 'Mobile Settings',
  parameters: {
    viewport: {
      defaultViewport: 'iphone12',
    },
    docs: {
      description: {
        story: 'Settings page optimized for mobile devices',
      },
    },
  },
}

export const TabletView: Story = {
  name: 'Tablet Settings',
  parameters: {
    viewport: {
      defaultViewport: 'ipad',
    },
    docs: {
      description: {
        story: 'Settings page on tablet',
      },
    },
  },
}