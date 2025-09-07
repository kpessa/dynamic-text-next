import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { UserMenu } from './UserMenu'

const meta: Meta<typeof UserMenu> = {
  title: 'Shared/Molecules/UserMenu',
  component: UserMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    userName: {
      control: 'text',
      description: 'User display name',
    },
    userEmail: {
      control: 'text',
      description: 'User email address',
    },
    userAvatar: {
      control: 'text',
      description: 'URL to user avatar image',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    onLogout: action('logout'),
    onProfile: action('profile'),
    onSettings: action('settings'),
  },
}

export const WithAvatar: Story = {
  args: {
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    userAvatar: 'https://mui.com/static/images/avatar/2.jpg',
    onLogout: action('logout'),
    onProfile: action('profile'),
    onSettings: action('settings'),
  },
}

export const NoEmail: Story = {
  args: {
    userName: 'User Name',
    onLogout: action('logout'),
    onProfile: action('profile'),
    onSettings: action('settings'),
  },
}

export const OnlyLogout: Story = {
  args: {
    userName: 'Simple User',
    onLogout: action('logout'),
  },
}

export const NoUserInfo: Story = {
  args: {
    onLogout: action('logout'),
    onProfile: action('profile'),
    onSettings: action('settings'),
  },
}

export const LongName: Story = {
  args: {
    userName: 'Alexander Maximillian Rodriguez',
    userEmail: 'alexander.maximillian.rodriguez@verylongemaildomain.com',
    onLogout: action('logout'),
    onProfile: action('profile'),
    onSettings: action('settings'),
  },
}