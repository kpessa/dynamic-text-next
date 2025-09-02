import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Button } from './MuiButton'
import SaveIcon from '@mui/icons-material/Save'
import SendIcon from '@mui/icons-material/Send'
import DeleteIcon from '@mui/icons-material/Delete'

const meta = {
  title: 'Atoms/MuiButton',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Material UI Button component with loading state and gradient support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'outlined', 'contained'],
      description: 'The variant of the button',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
      description: 'The color of the button',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the button',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading spinner and disables button',
    },
    gradient: {
      control: 'boolean',
      description: 'Applies gradient background',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'contained',
    color: 'primary',
    children: 'Primary Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'contained',
    color: 'secondary',
    children: 'Secondary Button',
  },
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    color: 'primary',
    children: 'Outlined Button',
  },
}

export const Text: Story = {
  args: {
    variant: 'text',
    color: 'primary',
    children: 'Text Button',
  },
}

export const WithIcon: Story = {
  args: {
    variant: 'contained',
    color: 'primary',
    startIcon: <SaveIcon />,
    children: 'Save',
  },
}

export const IconButtons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Button variant="contained" color="primary" startIcon={<SaveIcon />}>
        Save
      </Button>
      <Button variant="contained" color="secondary" startIcon={<SendIcon />}>
        Send
      </Button>
      <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>
        Delete
      </Button>
    </div>
  ),
}

export const Gradient: Story = {
  args: {
    gradient: true,
    children: 'Gradient Button',
  },
}

export const Loading: Story = {
  args: {
    loading: true,
    variant: 'contained',
    color: 'primary',
    children: 'Loading...',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    variant: 'contained',
    color: 'primary',
    children: 'Disabled Button',
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Button size="small" variant="contained">Small</Button>
      <Button size="medium" variant="contained">Medium</Button>
      <Button size="large" variant="contained">Large</Button>
    </div>
  ),
}

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Button variant="contained" color="primary">Primary</Button>
        <Button variant="contained" color="secondary">Secondary</Button>
        <Button variant="contained" color="success">Success</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Button variant="contained" color="info">Info</Button>
        <Button variant="contained" color="warning">Warning</Button>
        <Button variant="contained" color="error">Error</Button>
      </div>
    </div>
  ),
}