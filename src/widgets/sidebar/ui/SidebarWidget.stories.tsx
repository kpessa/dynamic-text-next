import type { Meta, StoryObj } from '@storybook/react'
import { SidebarWidget } from './SidebarWidget'
import type { RecentFile } from '@/entities/session'

const meta = {
  title: 'Widgets/SidebarWidget',
  component: SidebarWidget,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Sidebar open state'
    },
    width: {
      control: 'number',
      description: 'Sidebar width in pixels'
    },
    onNavigate: {
      action: 'navigated'
    }
  }
} satisfies Meta<typeof SidebarWidget>

export default meta
type Story = StoryObj<typeof meta>

const mockRecentFiles: RecentFile[] = [
  {
    id: 'file-1',
    title: 'TPN Adult Protocol',
    lastOpened: new Date(),
    contentType: 'TPN'
  },
  {
    id: 'file-2',
    title: 'Neonatal Guidelines',
    lastOpened: new Date(Date.now() - 86400000),
    contentType: 'TPN'
  },
  {
    id: 'file-3',
    title: 'General Documentation',
    lastOpened: new Date(Date.now() - 172800000),
    contentType: 'general'
  }
]

export const Default: Story = {
  args: {
    open: true,
    width: 240
  }
}

export const WithRecentFiles: Story = {
  args: {
    open: true,
    width: 240,
    recentFiles: mockRecentFiles
  }
}

export const Collapsed: Story = {
  args: {
    open: false,
    width: 240
  }
}

export const WideDrawer: Story = {
  args: {
    open: true,
    width: 320,
    recentFiles: mockRecentFiles
  }
}