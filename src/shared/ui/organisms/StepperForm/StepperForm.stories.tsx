import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { StepperForm } from './StepperForm'
import { StepperFormStep } from '../Form/Form.types'
import { fn } from '@storybook/test'
import * as yup from 'yup'
import { Box, Typography } from '@mui/material'

const meta: Meta<typeof StepperForm> = {
  title: 'Organisms/StepperForm',
  component: StepperForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A multi-step form component with validation, navigation, and review capabilities.'
      }
    }
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof StepperForm>

// Registration wizard steps
const registrationSteps: StepperFormStep[] = [
  {
    label: 'Account Details',
    description: 'Create your account credentials',
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        required: true,
        placeholder: 'Choose a username',
        validation: {
          required: 'Username is required',
          minLength: { value: 3, message: 'At least 3 characters' }
        }
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'your@email.com',
        validation: {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        }
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        validation: {
          required: 'Password is required',
          minLength: { value: 8, message: 'At least 8 characters' }
        }
      },
      {
        name: 'confirmPassword',
        label: 'Confirm Password',
        type: 'password',
        required: true,
        validation: {
          required: 'Please confirm password'
        }
      }
    ],
    validationSchema: yup.object({
      username: yup.string().required('Username is required').min(3),
      email: yup.string().email('Invalid email').required('Email is required'),
      password: yup.string().required('Password is required').min(8),
      confirmPassword: yup.string()
        .required('Please confirm password')
        .oneOf([yup.ref('password')], 'Passwords must match')
    })
  },
  {
    label: 'Personal Information',
    description: 'Tell us about yourself',
    fields: [
      {
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        required: true,
        validation: {
          required: 'First name is required'
        }
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        required: true,
        validation: {
          required: 'Last name is required'
        }
      },
      {
        name: 'birthDate',
        label: 'Date of Birth',
        type: 'date',
        required: true,
        validation: {
          required: 'Birth date is required'
        }
      },
      {
        name: 'gender',
        label: 'Gender',
        type: 'select',
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
    label: 'Contact Information',
    description: 'How can we reach you?',
    fields: [
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '+1 (555) 000-0000'
      },
      {
        name: 'address',
        label: 'Street Address',
        type: 'text'
      },
      {
        name: 'city',
        label: 'City',
        type: 'text'
      },
      {
        name: 'state',
        label: 'State/Province',
        type: 'text'
      },
      {
        name: 'zipCode',
        label: 'ZIP/Postal Code',
        type: 'text'
      },
      {
        name: 'country',
        label: 'Country',
        type: 'select',
        options: [
          { label: 'United States', value: 'US' },
          { label: 'Canada', value: 'CA' },
          { label: 'United Kingdom', value: 'UK' },
          { label: 'Australia', value: 'AU' },
          { label: 'Other', value: 'other' }
        ],
        defaultValue: 'US'
      }
    ],
    optional: true,
    canSkip: true
  },
  {
    label: 'Preferences',
    description: 'Customize your experience',
    fields: [
      {
        name: 'newsletter',
        label: 'Subscribe to newsletter',
        type: 'checkbox',
        defaultValue: true
      },
      {
        name: 'notifications',
        label: 'Email notifications',
        type: 'radio',
        options: [
          { label: 'All notifications', value: 'all' },
          { label: 'Important only', value: 'important' },
          { label: 'None', value: 'none' }
        ],
        defaultValue: 'important'
      },
      {
        name: 'theme',
        label: 'App Theme',
        type: 'select',
        options: [
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
          { label: 'System', value: 'system' }
        ],
        defaultValue: 'system'
      }
    ]
  }
]

// Survey steps
const surveySteps: StepperFormStep[] = [
  {
    label: 'Basic Information',
    fields: [
      {
        name: 'age',
        label: 'Age Range',
        type: 'select',
        required: true,
        options: [
          { label: '18-24', value: '18-24' },
          { label: '25-34', value: '25-34' },
          { label: '35-44', value: '35-44' },
          { label: '45-54', value: '45-54' },
          { label: '55+', value: '55+' }
        ]
      },
      {
        name: 'occupation',
        label: 'Occupation',
        type: 'text'
      }
    ]
  },
  {
    label: 'Experience',
    fields: [
      {
        name: 'satisfaction',
        label: 'How satisfied are you with our service?',
        type: 'radio',
        required: true,
        options: [
          { label: 'Very Satisfied', value: '5' },
          { label: 'Satisfied', value: '4' },
          { label: 'Neutral', value: '3' },
          { label: 'Dissatisfied', value: '2' },
          { label: 'Very Dissatisfied', value: '1' }
        ]
      },
      {
        name: 'recommend',
        label: 'Would you recommend us to others?',
        type: 'radio',
        required: true,
        options: [
          { label: 'Definitely', value: 'yes' },
          { label: 'Maybe', value: 'maybe' },
          { label: 'No', value: 'no' }
        ]
      }
    ]
  },
  {
    label: 'Feedback',
    fields: [
      {
        name: 'improvements',
        label: 'What could we improve?',
        type: 'textarea',
        rows: 4,
        placeholder: 'Your suggestions...'
      },
      {
        name: 'additionalComments',
        label: 'Additional Comments',
        type: 'textarea',
        rows: 3,
        placeholder: 'Anything else you\'d like to share...'
      }
    ]
  }
]

// Job application steps with sections
const jobApplicationSteps: StepperFormStep[] = [
  {
    label: 'Personal Details',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          {
            name: 'fullName',
            label: 'Full Name',
            type: 'text',
            required: true,
            gridProps: { xs: 12, sm: 6 }
          },
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
            required: true,
            gridProps: { xs: 12, sm: 6 }
          },
          {
            name: 'linkedin',
            label: 'LinkedIn Profile',
            type: 'url',
            gridProps: { xs: 12, sm: 6 }
          }
        ]
      },
      {
        title: 'Address',
        fields: [
          {
            name: 'city',
            label: 'City',
            type: 'text',
            required: true,
            gridProps: { xs: 12, sm: 6 }
          },
          {
            name: 'country',
            label: 'Country',
            type: 'text',
            required: true,
            gridProps: { xs: 12, sm: 6 }
          }
        ]
      }
    ]
  },
  {
    label: 'Professional Experience',
    fields: [
      {
        name: 'currentRole',
        label: 'Current Job Title',
        type: 'text'
      },
      {
        name: 'currentCompany',
        label: 'Current Company',
        type: 'text'
      },
      {
        name: 'yearsExperience',
        label: 'Years of Experience',
        type: 'select',
        required: true,
        options: [
          { label: '0-2 years', value: '0-2' },
          { label: '3-5 years', value: '3-5' },
          { label: '6-10 years', value: '6-10' },
          { label: '10+ years', value: '10+' }
        ]
      },
      {
        name: 'skills',
        label: 'Key Skills',
        type: 'multiselect',
        options: [
          { label: 'JavaScript', value: 'js' },
          { label: 'TypeScript', value: 'ts' },
          { label: 'React', value: 'react' },
          { label: 'Node.js', value: 'node' },
          { label: 'Python', value: 'python' },
          { label: 'Java', value: 'java' }
        ]
      }
    ]
  },
  {
    label: 'Additional Information',
    fields: [
      {
        name: 'resume',
        label: 'Upload Resume',
        type: 'file',
        accept: '.pdf,.doc,.docx',
        required: true
      },
      {
        name: 'coverLetter',
        label: 'Cover Letter',
        type: 'textarea',
        rows: 6,
        placeholder: 'Why are you interested in this position?'
      },
      {
        name: 'availability',
        label: 'When can you start?',
        type: 'date'
      }
    ]
  }
]

export const Default: Story = {
  args: {
    steps: registrationSteps,
    onSubmit: fn(),
  },
}

export const WithReviewStep: Story = {
  args: {
    steps: registrationSteps,
    showReviewStep: true,
    onSubmit: fn(),
  },
}

export const VerticalStepper: Story = {
  args: {
    steps: registrationSteps,
    orientation: 'vertical',
    onSubmit: fn(),
  },
}

export const AlternativeLabel: Story = {
  args: {
    steps: registrationSteps.slice(0, 3),
    alternativeLabel: true,
    onSubmit: fn(),
  },
}

export const NonLinearStepper: Story = {
  args: {
    steps: registrationSteps,
    nonLinear: true,
    onSubmit: fn(),
  },
}

export const SurveyForm: Story = {
  args: {
    steps: surveySteps,
    showReviewStep: true,
    onSubmit: fn(),
  },
}

export const JobApplication: Story = {
  args: {
    steps: jobApplicationSteps,
    showReviewStep: true,
    reviewStepLabel: 'Review Application',
    finishLabel: 'Submit Application',
    onSubmit: fn(),
  },
}

export const WithOptionalSteps: Story = {
  args: {
    steps: [
      {
        label: 'Required Step',
        fields: [
          {
            name: 'required',
            label: 'Required Field',
            type: 'text',
            required: true
          }
        ]
      },
      {
        label: 'Optional Step',
        optional: true,
        canSkip: true,
        fields: [
          {
            name: 'optional',
            label: 'Optional Field',
            type: 'text'
          }
        ]
      },
      {
        label: 'Final Step',
        fields: [
          {
            name: 'final',
            label: 'Final Field',
            type: 'text'
          }
        ]
      }
    ],
    onSubmit: fn(),
  },
}

export const WithDefaultValues: Story = {
  args: {
    steps: registrationSteps,
    defaultValues: {
      username: 'johndoe',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      newsletter: true,
      theme: 'dark'
    },
    onSubmit: fn(),
  },
}

export const WithValidation: Story = {
  args: {
    steps: registrationSteps,
    validateOnStepChange: true,
    onSubmit: fn(),
  },
}

export const LoadingState: Story = {
  args: {
    steps: registrationSteps.slice(0, 2),
    loading: true,
    onSubmit: fn(),
  },
}

export const DisabledState: Story = {
  args: {
    steps: registrationSteps.slice(0, 2),
    disabled: true,
    onSubmit: fn(),
  },
}

export const CustomLabels: Story = {
  args: {
    steps: surveySteps,
    nextLabel: 'Continue',
    backLabel: 'Previous',
    skipLabel: 'Skip This',
    finishLabel: 'Complete Survey',
    resetLabel: 'Start Over',
    onSubmit: fn(),
  },
}

export const WithHeaderAndFooter: Story = {
  args: {
    steps: registrationSteps.slice(0, 3),
    header: (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Create Your Account</Typography>
        <Typography variant="body2" color="text.secondary">
          Complete all steps to finish registration
        </Typography>
      </Box>
    ),
    footer: (
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </Box>
    ),
    onSubmit: fn(),
  },
}

export const WithStepHandlers: Story = {
  args: {
    steps: [
      {
        label: 'Step 1',
        fields: [
          {
            name: 'field1',
            label: 'Field 1',
            type: 'text'
          }
        ],
        onStepSubmit: fn()
      },
      {
        label: 'Step 2',
        fields: [
          {
            name: 'field2',
            label: 'Field 2',
            type: 'text'
          }
        ],
        onStepSubmit: fn()
      },
      {
        label: 'Step 3',
        fields: [
          {
            name: 'field3',
            label: 'Field 3',
            type: 'text'
          }
        ],
        onStepSubmit: fn()
      }
    ],
    onSubmit: fn(),
    onStepChange: fn(),
  },
}

export const SimpleWizard: Story = {
  args: {
    steps: [
      {
        label: 'Welcome',
        fields: [
          {
            name: 'name',
            label: 'What\'s your name?',
            type: 'text',
            required: true
          }
        ]
      },
      {
        label: 'About',
        fields: [
          {
            name: 'about',
            label: 'Tell us about yourself',
            type: 'textarea',
            rows: 4
          }
        ]
      },
      {
        label: 'Done',
        fields: [
          {
            name: 'agree',
            label: 'I agree to continue',
            type: 'checkbox',
            required: true
          }
        ]
      }
    ],
    orientation: 'vertical',
    onSubmit: fn(),
  },
}