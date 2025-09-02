import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Card } from './Card'
import { Button } from '@/shared/ui/atoms/MuiButton'
import Typography from '@mui/material/Typography'

const meta = {
  title: 'Molecules/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Material UI Card component with title, subtitle, content, and actions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Card title',
    },
    subtitle: {
      control: 'text',
      description: 'Card subtitle',
    },
    hoverable: {
      control: 'boolean',
      description: 'Adds hover effect to the card',
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'This is a subtitle',
    children: (
      <Typography variant="body1">
        This is the card content. You can put any content here.
      </Typography>
    ),
  },
}

export const WithActions: Story = {
  args: {
    title: 'Card with Actions',
    subtitle: 'This card has action buttons',
    children: (
      <Typography variant="body1">
        Cards can have action buttons at the bottom for user interactions.
      </Typography>
    ),
    actions: (
      <>
        <Button size="small" color="primary">
          Learn More
        </Button>
        <Button size="small" color="secondary">
          Share
        </Button>
      </>
    ),
  },
}

export const Hoverable: Story = {
  args: {
    title: 'Hoverable Card',
    subtitle: 'Hover over this card to see the effect',
    hoverable: true,
    children: (
      <Typography variant="body1">
        This card has a hover effect that lifts it up and adds a shadow.
      </Typography>
    ),
  },
}

export const NoTitle: Story = {
  args: {
    children: (
      <Typography variant="body1">
        This card has no title or subtitle, just content.
      </Typography>
    ),
  },
}

export const ComplexContent: Story = {
  args: {
    title: 'Complex Card',
    subtitle: 'With multiple content types',
    children: (
      <div>
        <Typography variant="body1" paragraph>
          This card demonstrates complex content with multiple elements.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          You can include multiple paragraphs, lists, and other components.
        </Typography>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li>Feature 1</li>
          <li>Feature 2</li>
          <li>Feature 3</li>
        </ul>
      </div>
    ),
    actions: (
      <>
        <Button size="small" variant="outlined" color="primary">
          Cancel
        </Button>
        <Button size="small" variant="contained" color="primary">
          Confirm
        </Button>
      </>
    ),
    hoverable: true,
  },
}

export const CardGrid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', width: '800px' }}>
      <Card 
        title="Card 1" 
        subtitle="First card"
        hoverable
      >
        <Typography variant="body2">
          Content for the first card in the grid.
        </Typography>
      </Card>
      <Card 
        title="Card 2" 
        subtitle="Second card"
        hoverable
      >
        <Typography variant="body2">
          Content for the second card in the grid.
        </Typography>
      </Card>
      <Card 
        title="Card 3" 
        subtitle="Third card"
        hoverable
      >
        <Typography variant="body2">
          Content for the third card in the grid.
        </Typography>
      </Card>
    </div>
  ),
}