import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Typography } from './Typography'

const meta = {
  title: 'Atoms/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Extended Material UI Typography component with additional features like text truncation, gradients, and enhanced styling options.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'subtitle1', 'subtitle2',
        'body1', 'body2',
        'caption', 'overline', 'button'
      ],
      description: 'Typography variant'
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
      description: 'Text alignment'
    },
    color: {
      control: 'select',
      options: [
        'primary', 'secondary',
        'textPrimary', 'textSecondary', 'textDisabled',
        'error', 'warning', 'info', 'success'
      ],
      description: 'Text color'
    },
    truncate: {
      control: 'boolean',
      description: 'Truncate text with ellipsis'
    },
    maxLines: {
      control: 'number',
      description: 'Maximum number of lines to display'
    },
    gradient: {
      control: 'boolean',
      description: 'Apply gradient effect to text'
    },
    noWrap: {
      control: 'boolean',
      description: 'Prevent text wrapping'
    },
    paragraph: {
      control: 'boolean',
      description: 'Add bottom margin'
    },
    gutterBottom: {
      control: 'boolean',
      description: 'Add bottom gutter'
    }
  }
} satisfies Meta<typeof Typography>

export default meta
type Story = StoryObj<typeof meta>

const sampleText = 'The quick brown fox jumps over the lazy dog'
const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

export const Default: Story = {
  args: {
    children: sampleText
  }
}

export const Headings: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <Typography variant="h1">Heading 1</Typography>
      <Typography variant="h2">Heading 2</Typography>
      <Typography variant="h3">Heading 3</Typography>
      <Typography variant="h4">Heading 4</Typography>
      <Typography variant="h5">Heading 5</Typography>
      <Typography variant="h6">Heading 6</Typography>
    </div>
  )
}

export const BodyText: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start', maxWidth: '600px' }}>
      <Typography variant="body1">
        Body 1: {longText}
      </Typography>
      <Typography variant="body2">
        Body 2: {longText}
      </Typography>
    </div>
  )
}

export const Subtitles: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <Typography variant="subtitle1">
        Subtitle 1: Larger subtitle text for secondary headings
      </Typography>
      <Typography variant="subtitle2">
        Subtitle 2: Smaller subtitle text for tertiary headings
      </Typography>
    </div>
  )
}

export const SpecialVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <Typography variant="caption">
        Caption: Small text typically used for image captions or footnotes
      </Typography>
      <Typography variant="overline">
        Overline: Small uppercase text for labels
      </Typography>
      <Typography variant="button">
        Button: Text styled for buttons
      </Typography>
    </div>
  )
}

export const TextAlignment: Story = {
  render: () => (
    <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Typography align="left" style={{ width: '100%', background: '#f0f0f0', padding: '8px' }}>
        Left aligned text
      </Typography>
      <Typography align="center" style={{ width: '100%', background: '#f0f0f0', padding: '8px' }}>
        Center aligned text
      </Typography>
      <Typography align="right" style={{ width: '100%', background: '#f0f0f0', padding: '8px' }}>
        Right aligned text
      </Typography>
      <Typography align="justify" style={{ width: '100%', background: '#f0f0f0', padding: '8px' }}>
        Justified text alignment spreads the text evenly across the width of the container
      </Typography>
    </div>
  )
}

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
      <Typography color="primary">Primary Color</Typography>
      <Typography color="secondary">Secondary Color</Typography>
      <Typography color="textPrimary">Text Primary</Typography>
      <Typography color="textSecondary">Text Secondary</Typography>
      <Typography color="textDisabled">Text Disabled</Typography>
      <Typography color="error">Error Color</Typography>
      <Typography color="warning">Warning Color</Typography>
      <Typography color="info">Info Color</Typography>
      <Typography color="success">Success Color</Typography>
      <Typography color="#ff5722">Custom Hex Color</Typography>
    </div>
  )
}

export const TextTruncation: Story = {
  render: () => (
    <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <Typography variant="subtitle2" gutterBottom>Single Line Truncation:</Typography>
        <Typography truncate>
          {longText}
        </Typography>
      </div>
      
      <div>
        <Typography variant="subtitle2" gutterBottom>Two Line Truncation:</Typography>
        <Typography maxLines={2}>
          {longText}
        </Typography>
      </div>
      
      <div>
        <Typography variant="subtitle2" gutterBottom>Three Line Truncation:</Typography>
        <Typography maxLines={3}>
          {longText}
        </Typography>
      </div>
    </div>
  )
}

export const GradientText: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <Typography variant="h3" gradient>
        Default Gradient Text
      </Typography>
      <Typography variant="h4" gradient gradientColors={['#FF6B6B', '#4ECDC4']}>
        Custom Red to Teal Gradient
      </Typography>
      <Typography variant="h4" gradient gradientColors={['#667eea', '#764ba2']}>
        Purple Gradient
      </Typography>
      <Typography variant="h4" gradient gradientColors={['#f093fb', '#f5576c']}>
        Pink Gradient
      </Typography>
      <Typography variant="h4" gradient gradientColors={['#4facfe', '#00f2fe']}>
        Blue Gradient
      </Typography>
      <Typography variant="h4" gradient gradientColors={['#43e97b', '#38f9d7']}>
        Green Gradient
      </Typography>
    </div>
  )
}

export const ParagraphSpacing: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <Typography paragraph>
        This is a paragraph with bottom margin. It automatically adds spacing after the text to separate it from the next element.
      </Typography>
      <Typography paragraph>
        Another paragraph that also has bottom margin. This helps create proper spacing in text-heavy layouts.
      </Typography>
      <Typography>
        This text doesn't have the paragraph prop, so no bottom margin is added.
      </Typography>
    </div>
  )
}

export const NoWrap: Story = {
  render: () => (
    <div style={{ width: '200px', border: '1px solid #ccc', padding: '16px' }}>
      <Typography variant="subtitle2" gutterBottom>Without noWrap:</Typography>
      <Typography gutterBottom>
        This text will wrap normally within the container
      </Typography>
      
      <Typography variant="subtitle2" gutterBottom>With noWrap:</Typography>
      <Typography noWrap>
        This text will not wrap and will be cut off with ellipsis
      </Typography>
    </div>
  )
}

export const ComponentProp: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <Typography variant="h1" component="h2">
        H1 styling on an H2 element
      </Typography>
      <Typography variant="body1" component="div">
        Body text rendered as a div
      </Typography>
      <Typography variant="caption" component="span">
        Caption text rendered as a span
      </Typography>
    </div>
  )
}

export const RealWorldExample: Story = {
  render: () => (
    <article style={{ maxWidth: '800px', padding: '24px' }}>
      <Typography variant="h3" gutterBottom gradient gradientColors={['#667eea', '#764ba2']}>
        Welcome to Our Platform
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Discover amazing features and capabilities
      </Typography>
      
      <Typography variant="body1" paragraph>
        {longText}
      </Typography>
      
      <div style={{ display: 'flex', gap: '32px', marginTop: '24px' }}>
        <div style={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Feature One
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Description of the first feature with some details about what it does.
          </Typography>
        </div>
        
        <div style={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Feature Two
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Description of the second feature with some details about what it does.
          </Typography>
        </div>
        
        <div style={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Feature Three
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Description of the third feature with some details about what it does.
          </Typography>
        </div>
      </div>
      
      <Typography variant="caption" color="textDisabled" style={{ marginTop: '24px', display: 'block' }}>
        © 2025 Your Company. All rights reserved.
      </Typography>
    </article>
  )
}

export const InteractivePlayground: Story = {
  args: {
    children: 'Experiment with the controls to see different typography styles',
    variant: 'body1'
  }
}