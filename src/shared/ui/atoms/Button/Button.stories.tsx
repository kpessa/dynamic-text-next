import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { fn } from '@storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Base button component with multiple variants and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'ghost', 'soft', 'ringed'],
      description: 'Visual style variant of the button',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'success', 'warning', 'error'],
      description: 'Color scheme of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'base', 'lg', 'xl'],
      description: 'Size of the button',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading spinner and disables button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Makes button full width of container',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary button story
export const Primary: Story = {
  args: {
    variant: 'filled',
    color: 'primary',
    children: 'Primary Button',
  },
};

// Secondary button story
export const Secondary: Story = {
  args: {
    variant: 'filled',
    color: 'secondary',
    children: 'Secondary Button',
  },
};

// Ghost button story
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    color: 'primary',
    children: 'Ghost Button',
  },
};

// Loading state
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

// Size variations
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <Button size="sm">Small</Button>
      <Button size="base">Base</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};

// Color variations
export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="tertiary">Tertiary</Button>
      <Button color="success">Success</Button>
      <Button color="warning">Warning</Button>
      <Button color="error">Error</Button>
    </div>
  ),
};

// Interactive playground
export const Playground: Story = {
  args: {
    variant: 'filled',
    color: 'primary',
    size: 'base',
    children: 'Playground Button',
  },
};