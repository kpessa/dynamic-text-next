import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Radio, RadioGroup } from './Radio'

const meta = {
  title: 'Atoms/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Radio buttons and RadioGroup components for single-choice selection. Supports various layouts, label placements, and helper text.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the radio is checked'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the radio is disabled'
    },
    required: {
      control: 'boolean',
      description: 'Whether the radio is required'
    },
    error: {
      control: 'boolean',
      description: 'Whether the radio has an error state'
    },
    labelPlacement: {
      control: 'select',
      options: ['end', 'start', 'top', 'bottom'],
      description: 'Position of the label relative to the radio'
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the radio button'
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'warning', 'info', 'default'],
      description: 'Color of the radio button'
    }
  }
} satisfies Meta<typeof Radio>

export default meta
type Story = StoryObj<typeof meta>

export const SingleRadio: Story = {
  args: {
    label: 'Single Radio Button'
  }
}

export const RadioWithHelperText: Story = {
  args: {
    label: 'Option with help',
    helperText: 'This provides additional context'
  }
}

export const RadioGroupBasic: Story = {
  render: () => {
    const [value, setValue] = useState('option1')
    
    return (
      <RadioGroup
        value={value}
        onChange={(e) => setValue(e.target.value)}
        options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
          { value: 'option3', label: 'Option 3' }
        ]}
      />
    )
  }
}

export const RadioGroupWithLabel: Story = {
  render: () => {
    const [value, setValue] = useState('small')
    
    return (
      <RadioGroup
        label="Select Size"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        options={[
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ]}
        helperText="Choose your preferred size"
      />
    )
  }
}

export const RadioGroupHorizontal: Story = {
  render: () => {
    const [value, setValue] = useState('yes')
    
    return (
      <RadioGroup
        label="Do you agree?"
        orientation="horizontal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        options={[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'maybe', label: 'Maybe' }
        ]}
      />
    )
  }
}

export const RadioGroupWithDisabledOptions: Story = {
  render: () => {
    const [value, setValue] = useState('standard')
    
    return (
      <RadioGroup
        label="Subscription Plan"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        options={[
          { value: 'free', label: 'Free', helperText: 'Basic features only' },
          { value: 'standard', label: 'Standard', helperText: 'Most popular choice' },
          { value: 'premium', label: 'Premium', helperText: 'All features included' },
          { value: 'enterprise', label: 'Enterprise', disabled: true, helperText: 'Contact sales' }
        ]}
      />
    )
  }
}

export const RadioGroupRequired: Story = {
  render: () => {
    const [value, setValue] = useState('')
    
    return (
      <RadioGroup
        label="Required Selection"
        required
        error={!value}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
          { value: 'option3', label: 'Option 3' }
        ]}
        helperText={!value ? 'Please select an option' : 'Option selected'}
      />
    )
  }
}

export const RadioGroupDisabled: Story = {
  render: () => (
    <RadioGroup
      label="Disabled Group"
      disabled
      value="option1"
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ]}
      helperText="This group is disabled"
    />
  )
}

export const RadioGroupError: Story = {
  render: () => (
    <RadioGroup
      label="Selection with Error"
      error
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ]}
      helperText="Please correct your selection"
    />
  )
}

export const LabelPlacements: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <RadioGroup
        label="Label at End (default)"
        labelPlacement="end"
        value="option1"
        options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]}
      />
      <RadioGroup
        label="Label at Start"
        labelPlacement="start"
        value="option1"
        options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]}
      />
      <RadioGroup
        label="Label at Top"
        labelPlacement="top"
        orientation="horizontal"
        value="option1"
        options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]}
      />
      <RadioGroup
        label="Label at Bottom"
        labelPlacement="bottom"
        orientation="horizontal"
        value="option1"
        options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' }
        ]}
      />
    </div>
  )
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Radio label="Small Radio" size="small" />
      <Radio label="Medium Radio (default)" size="medium" />
      <Radio label="Large Radio" size="large" />
    </div>
  )
}

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Radio label="Primary Color" color="primary" checked />
      <Radio label="Secondary Color" color="secondary" checked />
      <Radio label="Success Color" color="success" checked />
      <Radio label="Error Color" color="error" checked />
      <Radio label="Warning Color" color="warning" checked />
      <Radio label="Info Color" color="info" checked />
      <Radio label="Default Color" color="default" checked />
    </div>
  )
}

export const FormExample: Story = {
  render: () => {
    const [gender, setGender] = useState('')
    const [experience, setExperience] = useState('')
    const [newsletter, setNewsletter] = useState('')
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '400px' }}>
        <h3>User Preferences</h3>
        
        <RadioGroup
          label="Gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
            { value: 'prefer-not', label: 'Prefer not to say' }
          ]}
        />
        
        <RadioGroup
          label="Experience Level"
          required
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          options={[
            { value: 'beginner', label: 'Beginner', helperText: 'Less than 1 year' },
            { value: 'intermediate', label: 'Intermediate', helperText: '1-3 years' },
            { value: 'advanced', label: 'Advanced', helperText: '3-5 years' },
            { value: 'expert', label: 'Expert', helperText: 'More than 5 years' }
          ]}
          error={!experience}
          helperText={!experience ? 'Please select your experience level' : ''}
        />
        
        <RadioGroup
          label="Newsletter Frequency"
          orientation="horizontal"
          value={newsletter}
          onChange={(e) => setNewsletter(e.target.value)}
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'never', label: 'Never' }
          ]}
        />
      </div>
    )
  }
}

export const InteractivePlayground: Story = {
  args: {
    label: 'Playground Radio',
    helperText: 'Experiment with the controls'
  }
}