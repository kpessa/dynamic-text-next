import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormField } from './FormField'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'

const meta = {
  title: 'Molecules/FormField',
  component: FormField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'FormField molecule combines Input with Label, Helper Text, and Error states for complete form field functionality.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Field label text'
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below the input'
    },
    errorMessage: {
      control: 'text',
      description: 'Error message displayed when error is true'
    },
    error: {
      control: 'boolean',
      description: 'Error state of the field'
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required'
    },
    showCharacterCount: {
      control: 'boolean',
      description: 'Show character counter'
    },
    maxLength: {
      control: 'number',
      description: 'Maximum character length'
    },
    labelPlacement: {
      control: 'select',
      options: ['top', 'left'],
      description: 'Label placement relative to input'
    }
  }
} satisfies Meta<typeof FormField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    helperText: 'We\'ll never share your email'
  }
}

export const Required: Story = {
  args: {
    label: 'Username',
    required: true,
    helperText: 'Choose a unique username'
  }
}

export const WithError: Story = {
  args: {
    label: 'Password',
    type: 'password',
    error: true,
    errorMessage: 'Password must be at least 8 characters',
    value: 'weak'
  }
}

export const WithCharacterCount: Story = {
  args: {
    label: 'Bio',
    multiline: true,
    rows: 4,
    showCharacterCount: true,
    maxLength: 200,
    helperText: 'Tell us about yourself'
  }
}

export const LabelPlacement: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 500 }}>
      <FormField
        label="Top Label"
        labelPlacement="top"
        placeholder="Label is above the input"
      />
      <FormField
        label="Left Label"
        labelPlacement="left"
        labelWidth={120}
        placeholder="Label is to the left"
      />
      <FormField
        label="Description"
        labelPlacement="left"
        labelWidth={120}
        multiline
        rows={3}
        placeholder="Works with multiline too"
      />
    </Stack>
  )
}

export const FormVariants: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 400 }}>
      <FormField
        label="Text Input"
        placeholder="Enter text"
        helperText="Standard text input"
      />
      <FormField
        label="Email"
        type="email"
        placeholder="john@example.com"
        required
        helperText="Required email field"
      />
      <FormField
        label="Password"
        type="password"
        placeholder="Enter password"
        helperText="Minimum 8 characters"
      />
      <FormField
        label="Number"
        type="number"
        placeholder="0"
        helperText="Numeric input only"
      />
      <FormField
        label="Comments"
        multiline
        rows={4}
        placeholder="Your feedback..."
        showCharacterCount
        maxLength={500}
      />
    </Stack>
  )
}

export const ValidationStates: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: 400 }}>
      <FormField
        label="Valid Input"
        value="john@example.com"
        helperText="Email format is correct"
        color="success"
      />
      <FormField
        label="Invalid Input"
        value="invalid-email"
        error
        errorMessage="Please enter a valid email address"
      />
      <FormField
        label="Warning State"
        value="admin"
        helperText="This username might be reserved"
        color="warning"
      />
      <FormField
        label="Disabled Field"
        value="Cannot edit"
        disabled
        helperText="This field is read-only"
      />
    </Stack>
  )
}

export const CharacterCountDemo: Story = {
  render: () => {
    const [value, setValue] = useState('')
    
    return (
      <Stack spacing={3} sx={{ width: 400 }}>
        <FormField
          label="Tweet"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          multiline
          rows={3}
          showCharacterCount
          maxLength={280}
          helperText="Share your thoughts"
          error={value.length > 280}
          errorMessage={value.length > 280 ? 'Tweet is too long' : undefined}
        />
        <FormField
          label="Short Description"
          showCharacterCount
          maxLength={50}
          helperText="Keep it brief"
        />
        <FormField
          label="Long Description"
          multiline
          rows={5}
          showCharacterCount
          maxLength={1000}
          helperText="Detailed description"
        />
      </Stack>
    )
  }
}

export const CompleteForm: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      bio: ''
    })
    
    const [errors, setErrors] = useState<Record<string, string>>({})
    
    const handleSubmit = () => {
      const newErrors: Record<string, string> = {}
      
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.email) newErrors.email = 'Email is required'
      if (!formData.email.includes('@')) newErrors.email = 'Invalid email format'
      if (!formData.password) newErrors.password = 'Password is required'
      if (formData.password.length < 8) newErrors.password = 'Password too short'
      
      setErrors(newErrors)
      
      if (Object.keys(newErrors).length === 0) {
        alert('Form submitted successfully!')
      }
    }
    
    return (
      <Paper sx={{ p: 3, width: 500 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2}>
            <FormField
              label="First Name"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              error={!!errors.firstName}
              errorMessage={errors.firstName}
            />
            <FormField
              label="Last Name"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={!!errors.lastName}
              errorMessage={errors.lastName}
            />
          </Stack>
          
          <FormField
            label="Email"
            type="email"
            required
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={!!errors.email}
            errorMessage={errors.email}
            helperText="We'll never share your email"
          />
          
          <FormField
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={!!errors.password}
            errorMessage={errors.password}
            helperText="Minimum 8 characters"
          />
          
          <FormField
            label="Bio"
            multiline
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            showCharacterCount
            maxLength={500}
            helperText="Tell us about yourself (optional)"
          />
          
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            fullWidth
          >
            Submit
          </Button>
        </Stack>
      </Paper>
    )
  }
}

export const ResponsiveLayout: Story = {
  render: () => (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 600 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormField
          label="First Name"
          required
          sx={{ flex: 1 }}
        />
        <FormField
          label="Last Name"
          required
          sx={{ flex: 1 }}
        />
      </Stack>
      
      <FormField
        label="Address Line 1"
        required
      />
      
      <FormField
        label="Address Line 2"
        helperText="Apartment, suite, etc. (optional)"
      />
      
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormField
          label="City"
          required
          sx={{ flex: 2 }}
        />
        <FormField
          label="State"
          required
          sx={{ flex: 1 }}
        />
        <FormField
          label="ZIP"
          required
          sx={{ flex: 1 }}
        />
      </Stack>
    </Stack>
  )
}

export const InteractivePlayground: Story = {
  args: {
    label: 'Field Label',
    placeholder: 'Enter value...',
    helperText: 'Helper text goes here',
    required: false,
    error: false,
    showCharacterCount: false,
    maxLength: 100,
    multiline: false,
    rows: 4,
    disabled: false,
    labelPlacement: 'top'
  }
}