import type { Meta, StoryObj } from '@storybook/react'
import { HeaderWidget } from './HeaderWidget'

const meta = {
  title: 'Widgets/HeaderWidget',
  component: HeaderWidget,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Application title'
    },
    onMenuClick: {
      action: 'menu clicked'
    }
  }
} satisfies Meta<typeof HeaderWidget>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Dynamic Text Editor'
  }
}

export const WithMenu: Story = {
  args: {
    title: 'Dynamic Text Editor',
    onMenuClick: () => console.log('Menu clicked')
  }
}

export const CustomTitle: Story = {
  args: {
    title: 'TPN Configuration Tool'
  }
}