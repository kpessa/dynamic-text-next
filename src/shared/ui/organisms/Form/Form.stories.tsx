import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Form } from './Form'
import { FieldConfig, FormSection } from './Form.types'
import { fn } from '@storybook/test'
import * as yup from 'yup'
import { Box, Typography } from '@mui/material'

const meta: Meta<typeof Form> = {
  title: 'Organisms/Form',
  component: Form,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A comprehensive form component with react-hook-form integration, validation, and various field types.'
      }
    }
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Form>

// Basic fields
const basicFields: FieldConfig[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'Enter your first name',
    required: true,
    validation: {
      required: 'First name is required',
      minLength: { value: 2, message: 'Must be at least 2 characters' }
    }
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Enter your last name',
    required: true,
    validation: {
      required: 'Last name is required'
    }
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
    required: true,
    validation: {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address'
      }
    }
  },
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    validation: {
      min: { value: 18, message: 'Must be at least 18' },
      max: { value: 100, message: 'Must be less than 100' }
    }
  }
]

// Contact form fields
const contactFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    gridProps: { xs: 12 }
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    gridProps: { xs: 12, sm: 6 }
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    gridProps: { xs: 12, sm: 6 }
  },
  {
    name: 'subject',
    label: 'Subject',
    type: 'text',
    required: true,
    gridProps: { xs: 12 }
  },
  {
    name: 'message',
    label: 'Message',
    type: 'textarea',
    rows: 4,
    required: true,
    gridProps: { xs: 12 }
  }
]

// Registration form sections
const registrationSections: FormSection[] = [
  {
    title: 'Account Information',
    description: 'Choose your username and password',
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        required: true,
        helperText: 'Choose a unique username',
        validation: {
          required: 'Username is required',
          minLength: { value: 3, message: 'Must be at least 3 characters' }
        }
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        validation: {
          required: 'Password is required',
          minLength: { value: 8, message: 'Must be at least 8 characters' }
        }
      },
      {
        name: 'confirmPassword',
        label: 'Confirm Password',
        type: 'password',
        required: true,
        validation: {
          required: 'Please confirm your password'
        }
      }
    ]
  },
  {
    title: 'Personal Information',
    description: 'Tell us about yourself',
    fields: [
      {
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        required: true
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        required: true
      },
      {
        name: 'birthDate',
        label: 'Date of Birth',
        type: 'date'
      },
      {
        name: 'gender',
        label: 'Gender',
        type: 'radio',
        options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Other', value: 'other' },
          { label: 'Prefer not to say', value: 'none' }
        ]
      }
    ]
  },
  {
    title: 'Preferences',
    description: 'Customize your experience',
    collapsible: true,
    defaultExpanded: false,
    fields: [
      {
        name: 'newsletter',
        label: 'Subscribe to newsletter',
        type: 'checkbox',
        defaultValue: true
      },
      {
        name: 'notifications',
        label: 'Enable notifications',
        type: 'switch'
      },
      {
        name: 'theme',
        label: 'Theme',
        type: 'select',
        options: [
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
          { label: 'Auto', value: 'auto' }
        ],
        defaultValue: 'auto'
      }
    ]
  }
]

// All field types example
const allFieldTypes: FieldConfig[] = [
  {
    name: 'text',
    label: 'Text Field',
    type: 'text',
    placeholder: 'Enter text'
  },
  {
    name: 'email',
    label: 'Email Field',
    type: 'email',
    placeholder: 'email@example.com'
  },
  {
    name: 'password',
    label: 'Password Field',
    type: 'password',
    placeholder: 'Enter password'
  },
  {
    name: 'number',
    label: 'Number Field',
    type: 'number',
    placeholder: '0'
  },
  {
    name: 'tel',
    label: 'Phone Field',
    type: 'tel',
    placeholder: '+1 (555) 000-0000'
  },
  {
    name: 'url',
    label: 'URL Field',
    type: 'url',
    placeholder: 'https://example.com'
  },
  {
    name: 'date',
    label: 'Date Field',
    type: 'date'
  },
  {
    name: 'time',
    label: 'Time Field',
    type: 'time'
  },
  {
    name: 'datetime',
    label: 'DateTime Field',
    type: 'datetime-local'
  },
  {
    name: 'select',
    label: 'Select Field',
    type: 'select',
    options: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' }
    ]
  },
  {
    name: 'multiselect',
    label: 'Multi-Select Field',
    type: 'multiselect',
    options: [
      { label: 'Option A', value: 'a' },
      { label: 'Option B', value: 'b' },
      { label: 'Option C', value: 'c' },
      { label: 'Option D', value: 'd' }
    ]
  },
  {
    name: 'checkbox',
    label: 'I agree to the terms and conditions',
    type: 'checkbox'
  },
  {
    name: 'radio',
    label: 'Radio Options',
    type: 'radio',
    options: [
      { label: 'Option X', value: 'x' },
      { label: 'Option Y', value: 'y' },
      { label: 'Option Z', value: 'z' }
    ]
  },
  {
    name: 'switch',
    label: 'Toggle Switch',
    type: 'switch'
  },
  {
    name: 'textarea',
    label: 'Textarea Field',
    type: 'textarea',
    rows: 3,
    placeholder: 'Enter multiple lines of text...'
  },
  {
    name: 'file',
    label: 'Upload File',
    type: 'file',
    accept: 'image/*'
  }
]

// Yup validation schema
const validationSchema = yup.object({
  firstName: yup.string().required('First name is required').min(2, 'Too short'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  age: yup.number().min(18, 'Must be 18+').max(100, 'Too old')
})

export const Default: Story = {
  args: {
    fields: basicFields,
    onSubmit: fn(),
  },
}

export const WithValidation: Story = {
  args: {
    fields: basicFields,
    validationSchema,
    onSubmit: fn(),
    showValidationSummary: true,
  },
}

export const ContactForm: Story = {
  args: {
    fields: contactFields,
    columns: 2,
    onSubmit: fn(),
    submitLabel: 'Send Message',
  },
}

export const RegistrationForm: Story = {
  args: {
    sections: registrationSections,
    onSubmit: fn(),
    submitLabel: 'Create Account',
    showReset: true,
  },
}

export const AllFieldTypes: Story = {
  args: {
    fields: allFieldTypes,
    onSubmit: fn(),
  },
}

export const TwoColumns: Story = {
  args: {
    fields: basicFields,
    columns: 2,
    onSubmit: fn(),
  },
}

export const ThreeColumns: Story = {
  args: {
    fields: basicFields,
    columns: 3,
    onSubmit: fn(),
  },
}

export const WithSections: Story = {
  args: {
    sections: [
      {
        title: 'Section 1',
        description: 'First section of the form',
        fields: basicFields.slice(0, 2)
      },
      {
        title: 'Section 2',
        description: 'Second section of the form',
        fields: basicFields.slice(2)
      }
    ],
    onSubmit: fn(),
  },
}

export const CollapsibleSections: Story = {
  args: {
    sections: [
      {
        title: 'Required Information',
        fields: basicFields.slice(0, 2),
        collapsible: true,
        defaultExpanded: true
      },
      {
        title: 'Optional Information',
        fields: basicFields.slice(2),
        collapsible: true,
        defaultExpanded: false
      }
    ],
    onSubmit: fn(),
  },
}

export const ConditionalFields: Story = {
  args: {
    fields: [
      {
        name: 'hasAccount',
        label: 'Do you have an account?',
        type: 'radio',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ],
        defaultValue: 'no'
      },
      {
        name: 'accountNumber',
        label: 'Account Number',
        type: 'text',
        showWhen: (values) => values.hasAccount === 'yes',
        placeholder: 'Enter your account number'
      },
      {
        name: 'createAccount',
        label: 'Would you like to create an account?',
        type: 'checkbox',
        showWhen: (values) => values.hasAccount === 'no'
      }
    ],
    onSubmit: fn(),
  },
}

export const WithDefaultValues: Story = {
  args: {
    fields: basicFields,
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      age: 25
    },
    onSubmit: fn(),
  },
}

export const DisabledForm: Story = {
  args: {
    fields: basicFields,
    disabled: true,
    onSubmit: fn(),
  },
}

export const LoadingState: Story = {
  args: {
    fields: basicFields,
    loading: true,
    onSubmit: fn(),
  },
}

export const WithCustomButtons: Story = {
  args: {
    fields: basicFields,
    customButtons: (
      <Box display="flex" gap={2}>
        <button>Custom Cancel</button>
        <button>Custom Submit</button>
      </Box>
    ),
    onSubmit: fn(),
  },
}

export const WithHeaderAndFooter: Story = {
  args: {
    fields: basicFields,
    header: (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">User Registration</Typography>
        <Typography variant="body2" color="text.secondary">
          Please fill out all required fields
        </Typography>
      </Box>
    ),
    footer: (
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          By submitting this form, you agree to our terms and conditions
        </Typography>
      </Box>
    ),
    onSubmit: fn(),
  },
}

export const WithMessages: Story = {
  args: {
    fields: basicFields,
    successMessage: 'Form submitted successfully!',
    errorMessage: 'There was an error submitting the form.',
    showValidationSummary: true,
    onSubmit: fn(),
  },
}

export const AutoSaveEnabled: Story = {
  args: {
    fields: basicFields,
    autoSave: true,
    autoSaveDelay: 2000,
    onAutoSave: fn(),
    onSubmit: fn(),
  },
}

export const InlineLayout: Story = {
  args: {
    fields: [
      {
        name: 'search',
        label: 'Search',
        type: 'text',
        placeholder: 'Enter search term'
      },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        options: [
          { label: 'All', value: 'all' },
          { label: 'Products', value: 'products' },
          { label: 'Services', value: 'services' }
        ]
      }
    ],
    layout: 'inline',
    columns: 2,
    submitLabel: 'Search',
    showReset: false,
    onSubmit: fn(),
  },
}

export const WithCancelButton: Story = {
  args: {
    fields: basicFields,
    showCancel: true,
    onCancel: fn(),
    onSubmit: fn(),
  },
}

export const CustomFieldSpacing: Story = {
  args: {
    fields: basicFields,
    spacing: 4,
    onSubmit: fn(),
  },
}

export const ComplexForm: Story = {
  args: {
    sections: [
      {
        title: 'Personal Information',
        fields: [
          {
            name: 'title',
            label: 'Title',
            type: 'select',
            options: [
              { label: 'Mr.', value: 'mr' },
              { label: 'Mrs.', value: 'mrs' },
              { label: 'Ms.', value: 'ms' },
              { label: 'Dr.', value: 'dr' }
            ],
            gridProps: { xs: 12, sm: 3 }
          },
          {
            name: 'firstName',
            label: 'First Name',
            type: 'text',
            required: true,
            gridProps: { xs: 12, sm: 4 }
          },
          {
            name: 'middleName',
            label: 'Middle Name',
            type: 'text',
            gridProps: { xs: 12, sm: 2 }
          },
          {
            name: 'lastName',
            label: 'Last Name',
            type: 'text',
            required: true,
            gridProps: { xs: 12, sm: 3 }
          }
        ]
      },
      {
        title: 'Contact Details',
        fields: [
          {
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            gridProps: { xs: 12, sm: 6 }
          },
          {
            name: 'phone',
            label: 'Phone',
            type: 'tel',
            gridProps: { xs: 12, sm: 6 }
          },
          {
            name: 'address',
            label: 'Street Address',
            type: 'text',
            gridProps: { xs: 12 }
          },
          {
            name: 'city',
            label: 'City',
            type: 'text',
            gridProps: { xs: 12, sm: 4 }
          },
          {
            name: 'state',
            label: 'State/Province',
            type: 'text',
            gridProps: { xs: 12, sm: 4 }
          },
          {
            name: 'zipCode',
            label: 'ZIP/Postal Code',
            type: 'text',
            gridProps: { xs: 12, sm: 4 }
          }
        ]
      },
      {
        title: 'Additional Information',
        collapsible: true,
        defaultExpanded: false,
        fields: [
          {
            name: 'bio',
            label: 'Biography',
            type: 'textarea',
            rows: 4,
            gridProps: { xs: 12 }
          },
          {
            name: 'interests',
            label: 'Interests',
            type: 'multiselect',
            options: [
              { label: 'Sports', value: 'sports' },
              { label: 'Music', value: 'music' },
              { label: 'Reading', value: 'reading' },
              { label: 'Travel', value: 'travel' },
              { label: 'Cooking', value: 'cooking' }
            ],
            gridProps: { xs: 12 }
          }
        ]
      }
    ],
    columns: 1,
    showValidationSummary: true,
    submitLabel: 'Submit Application',
    showReset: true,
    onSubmit: fn(),
  },
}