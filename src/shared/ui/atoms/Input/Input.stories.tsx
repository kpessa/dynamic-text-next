import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const meta = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile input component with multiple variants including text, number, password, and textarea. Supports validation states, character counting, and various input types.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'number', 'password', 'textarea', 'email', 'tel', 'url', 'search'],
      description: 'The type of input to render'
    },
    validationState: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error'],
      description: 'Visual validation state of the input'
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'Size of the input field'
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the input should take full width'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled'
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required'
    }
  }
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Default Input',
    variant: 'text',
    placeholder: 'Enter text...'
  }
}

export const TextInput: Story = {
  args: {
    label: 'Full Name',
    variant: 'text',
    placeholder: 'John Doe',
    helperText: 'Enter your full name'
  }
}

export const TextInputWithCharacterCount: Story = {
  args: {
    label: 'Bio',
    variant: 'text',
    placeholder: 'Tell us about yourself...',
    maxLength: 100,
    showCharacterCount: true,
    helperText: 'Brief description'
  }
}

export const NumberInput: Story = {
  args: {
    label: 'Age',
    variant: 'number',
    min: 0,
    max: 120,
    defaultValue: 25
  }
}

export const NumberInputWithControls: Story = {
  args: {
    label: 'Quantity',
    variant: 'number',
    incrementControls: true,
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 10
  }
}

export const PasswordInput: Story = {
  args: {
    label: 'Password',
    variant: 'password',
    placeholder: 'Enter password...',
    helperText: 'Must be at least 8 characters'
  }
}

export const PasswordInputWithoutToggle: Story = {
  args: {
    label: 'Secret',
    variant: 'password',
    showPasswordToggle: false,
    placeholder: 'Enter secret...'
  }
}

export const TextareaInput: Story = {
  args: {
    label: 'Description',
    variant: 'textarea',
    placeholder: 'Enter detailed description...',
    rows: 4,
    helperText: 'Provide a detailed description'
  }
}

export const TextareaWithAutoResize: Story = {
  args: {
    label: 'Comments',
    variant: 'textarea',
    autoResize: true,
    placeholder: 'Start typing and the field will grow...',
    helperText: 'This textarea auto-resizes as you type'
  }
}

export const TextareaWithCharacterLimit: Story = {
  args: {
    label: 'Review',
    variant: 'textarea',
    maxLength: 500,
    showCharacterCount: true,
    rows: 5,
    placeholder: 'Write your review...',
    helperText: 'Share your thoughts'
  }
}

export const EmailInput: Story = {
  args: {
    label: 'Email Address',
    variant: 'email',
    placeholder: 'user@example.com',
    helperText: 'We\'ll never share your email'
  }
}

export const PhoneInput: Story = {
  args: {
    label: 'Phone Number',
    variant: 'tel',
    placeholder: '+1 (555) 000-0000',
    helperText: 'Include country code'
  }
}

export const URLInput: Story = {
  args: {
    label: 'Website',
    variant: 'url',
    placeholder: 'https://example.com',
    helperText: 'Enter full URL including https://'
  }
}

export const SearchInput: Story = {
  args: {
    label: 'Search',
    variant: 'search',
    placeholder: 'Search for items...',
    fullWidth: true
  }
}

export const ValidationStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <Input
        label="Default State"
        variant="text"
        validationState="default"
        defaultValue="Normal input"
        helperText="This is the default state"
      />
      <Input
        label="Success State"
        variant="text"
        validationState="success"
        defaultValue="Valid input"
        helperText="Input is valid!"
      />
      <Input
        label="Warning State"
        variant="text"
        validationState="warning"
        defaultValue="Check this"
        helperText="Please review this input"
      />
      <Input
        label="Error State"
        variant="text"
        validationState="error"
        defaultValue="Invalid input"
        helperText="This field has an error"
      />
    </div>
  )
}

export const RequiredFields: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <Input
        label="Required Field"
        variant="text"
        required
        helperText="This field is required"
      />
      <Input
        label="Optional Field"
        variant="text"
        helperText="This field is optional"
      />
    </div>
  )
}

export const DisabledInputs: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <Input
        label="Disabled Empty"
        variant="text"
        disabled
        placeholder="Cannot edit..."
      />
      <Input
        label="Disabled with Value"
        variant="text"
        disabled
        defaultValue="This is disabled"
      />
      <Input
        label="Disabled Number"
        variant="number"
        disabled
        incrementControls
        defaultValue={42}
      />
    </div>
  )
}

export const InputSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <Input
        label="Small Input"
        variant="text"
        size="small"
        placeholder="Small size..."
      />
      <Input
        label="Medium Input"
        variant="text"
        size="medium"
        placeholder="Medium size (default)..."
      />
    </div>
  )
}

export const FullWidthInputs: Story = {
  render: () => (
    <div style={{ width: '500px' }}>
      <Input
        label="Full Width Input"
        variant="text"
        fullWidth
        placeholder="This input takes full width..."
        helperText="Spans the entire container width"
      />
    </div>
  )
}

export const InteractivePlayground: Story = {
  args: {
    label: 'Playground Input',
    variant: 'text',
    placeholder: 'Try different props...',
    helperText: 'Experiment with the controls'
  }
}