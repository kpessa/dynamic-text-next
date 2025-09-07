import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { HomePage } from './HomePage'

const meta = {
  title: 'Pages/Home',
  component: HomePage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main landing page of the application with quick actions',
      },
    },
  },
} satisfies Meta<typeof HomePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'Default Home Page',
  parameters: {
    docs: {
      description: {
        story: 'The default home page with welcome message and quick action cards',
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
        story: 'Home page as it appears on mobile devices',
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
        story: 'Home page as it appears on tablet devices',
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
        story: 'Home page with dark theme applied',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh', backgroundColor: '#121212' }}>
        <Story />
      </div>
    ),
  ],
}