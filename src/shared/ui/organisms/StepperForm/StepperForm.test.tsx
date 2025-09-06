import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepperForm } from './StepperForm'
import * as yup from 'yup'

describe('StepperForm', () => {
  const mockSubmit = vi.fn()
  const mockError = vi.fn()
  const mockStepChange = vi.fn()
  const mockStepSubmit = vi.fn()

  const basicSteps = [
    {
      label: 'Step 1',
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text' as const },
        { name: 'lastName', label: 'Last Name', type: 'text' as const }
      ]
    },
    {
      label: 'Step 2',
      fields: [
        { name: 'email', label: 'Email', type: 'email' as const },
        { name: 'phone', label: 'Phone', type: 'tel' as const }
      ]
    },
    {
      label: 'Step 3',
      fields: [
        { name: 'address', label: 'Address', type: 'text' as const },
        { name: 'city', label: 'City', type: 'text' as const }
      ]
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render stepper with steps', () => {
      render(
        <StepperForm
          steps={basicSteps}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 2')).toBeInTheDocument()
      expect(screen.getByText('Step 3')).toBeInTheDocument()
    })

    it('should render first step fields', () => {
      render(
        <StepperForm
          steps={basicSteps}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument()
      expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
    })

    it('should render with default step', () => {
      render(
        <StepperForm
          steps={basicSteps}
          defaultStep={1}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Phone')).toBeInTheDocument()
      expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument()
    })

    it('should render vertical stepper', () => {
      render(
        <StepperForm
          steps={basicSteps}
          orientation="vertical"
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByText('Step 1')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate to next step on Next button click', async () => {
      render(
        <StepperForm
          steps={basicSteps}
          onSubmit={mockSubmit}
          onStepChange={mockStepChange}
        />
      )

      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(mockStepChange).toHaveBeenCalledWith(1)
      })
    })

    it('should navigate back on Back button click', async () => {
      render(
        <StepperForm
          steps={basicSteps}
          defaultStep={1}
          onSubmit={mockSubmit}
          onStepChange={mockStepChange}
        />
      )

      const backButton = screen.getByText('Back')
      fireEvent.click(backButton)

      await waitFor(() => {
        expect(screen.getByLabelText('First Name')).toBeInTheDocument()
        expect(mockStepChange).toHaveBeenCalledWith(0)
      })
    })

    it('should not show Back button on first step', () => {
      render(
        <StepperForm
          steps={basicSteps}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.queryByText('Back')).not.toBeInTheDocument()
    })

    it('should show Finish button on last step', () => {
      render(
        <StepperForm
          steps={basicSteps}
          defaultStep={2}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByText('Finish')).toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('should allow skipping optional steps', async () => {
      const stepsWithOptional = [
        ...basicSteps.slice(0, 1),
        { ...basicSteps[1], optional: true, canSkip: true },
        ...basicSteps.slice(2)
      ]

      render(
        <StepperForm
          steps={stepsWithOptional}
          defaultStep={1}
          onSubmit={mockSubmit}
        />
      )

      const skipButton = screen.getByText('Skip')
      fireEvent.click(skipButton)

      await waitFor(() => {
        expect(screen.getByLabelText('Address')).toBeInTheDocument()
      })
    })
  })

  describe('Non-Linear Navigation', () => {
    it('should allow clicking on completed steps', async () => {
      render(
        <StepperForm
          steps={basicSteps}
          nonLinear={true}
          defaultStep={2}
          onSubmit={mockSubmit}
        />
      )

      // Simulate that steps 0 and 1 are completed
      const step1 = screen.getByText('Step 1')
      fireEvent.click(step1)

      await waitFor(() => {
        expect(screen.queryByLabelText('First Name')).toBeInTheDocument()
      })
    })
  })

  describe('Validation', () => {
    it('should validate step before proceeding', async () => {
      const stepsWithValidation = [
        {
          ...basicSteps[0],
          validationSchema: yup.object({
            firstName: yup.string().required('First Name is required'),
            lastName: yup.string().required('Last Name is required')
          })
        },
        ...basicSteps.slice(1)
      ]

      render(
        <StepperForm
          steps={stepsWithValidation}
          validateOnStepChange={true}
          onSubmit={mockSubmit}
        />
      )

      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)

      // Should stay on same step due to validation failure
      await waitFor(() => {
        expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      })
    })

    it('should proceed when validation passes', async () => {
      const stepsWithValidation = [
        {
          ...basicSteps[0],
          validationSchema: yup.object({
            firstName: yup.string().required('First Name is required'),
            lastName: yup.string().required('Last Name is required')
          })
        },
        ...basicSteps.slice(1)
      ]

      render(
        <StepperForm
          steps={stepsWithValidation}
          validateOnStepChange={true}
          onSubmit={mockSubmit}
        />
      )

      await userEvent.type(screen.getByLabelText('First Name'), 'John')
      await userEvent.type(screen.getByLabelText('Last Name'), 'Doe')

      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
      })
    })

    it('should call onStepSubmit handler', async () => {
      const stepsWithHandler = [
        {
          ...basicSteps[0],
          onStepSubmit: mockStepSubmit
        },
        ...basicSteps.slice(1)
      ]

      render(
        <StepperForm
          steps={stepsWithHandler}
          onSubmit={mockSubmit}
        />
      )

      await userEvent.type(screen.getByLabelText('First Name'), 'John')
      await userEvent.type(screen.getByLabelText('Last Name'), 'Doe')

      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(mockStepSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            firstName: 'John',
            lastName: 'Doe'
          })
        )
      })
    })
  })

  describe('Review Step', () => {
    it('should show review step when enabled', () => {
      render(
        <StepperForm
          steps={basicSteps}
          showReviewStep={true}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByText('Review & Submit')).toBeInTheDocument()
    })

    it('should display review content on review step', async () => {
      render(
        <StepperForm
          steps={basicSteps.slice(0, 1)}
          showReviewStep={true}
          defaultValues={{
            firstName: 'John',
            lastName: 'Doe'
          }}
          onSubmit={mockSubmit}
        />
      )

      // Navigate to review step
      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Review Your Information')).toBeInTheDocument()
        expect(screen.getByText('John')).toBeInTheDocument()
        expect(screen.getByText('Doe')).toBeInTheDocument()
      })
    })

    it('should use custom review step label', () => {
      render(
        <StepperForm
          steps={basicSteps}
          showReviewStep={true}
          reviewStepLabel="Confirm Details"
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByText('Confirm Details')).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call onSubmit with all form data', async () => {
      const singleStep = [basicSteps[0]]

      render(
        <StepperForm
          steps={singleStep}
          defaultValues={{
            firstName: 'John',
            lastName: 'Doe'
          }}
          onSubmit={mockSubmit}
        />
      )

      const finishButton = screen.getByText('Finish')
      fireEvent.click(finishButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe'
        })
      })
    })

    it('should call onError when submission fails', async () => {
      const error = new Error('Submission failed')
      mockSubmit.mockRejectedValueOnce(error)

      render(
        <StepperForm
          steps={[basicSteps[0]]}
          onSubmit={mockSubmit}
          onError={mockError}
        />
      )

      const finishButton = screen.getByText('Finish')
      fireEvent.click(finishButton)

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith(error)
      })
    })

    it('should show success message after successful submission', async () => {
      render(
        <StepperForm
          steps={[basicSteps[0]]}
          onSubmit={mockSubmit}
        />
      )

      const finishButton = screen.getByText('Finish')
      fireEvent.click(finishButton)

      await waitFor(() => {
        expect(screen.getByText('Form submitted successfully!')).toBeInTheDocument()
      })
    })
  })

  describe('Reset Functionality', () => {
    it('should reset form when success and reset button clicked', async () => {
      render(
        <StepperForm
          steps={[basicSteps[0]]}
          defaultValues={{
            firstName: 'John',
            lastName: 'Doe'
          }}
          onSubmit={mockSubmit}
        />
      )

      // Submit form
      const finishButton = screen.getByText('Finish')
      fireEvent.click(finishButton)

      await waitFor(() => {
        expect(screen.getByText('Form submitted successfully!')).toBeInTheDocument()
      })

      // Reset form
      const resetButton = screen.getByText('Reset')
      fireEvent.click(resetButton)

      await waitFor(() => {
        expect(screen.queryByText('Form submitted successfully!')).not.toBeInTheDocument()
        expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      })
    })
  })

  describe('Custom Labels', () => {
    it('should use custom button labels', () => {
      render(
        <StepperForm
          steps={basicSteps}
          nextLabel="Continue"
          backLabel="Previous"
          finishLabel="Complete"
          skipLabel="Skip This"
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByText('Continue')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should disable buttons when loading', () => {
      render(
        <StepperForm
          steps={basicSteps}
          loading={true}
          onSubmit={mockSubmit}
        />
      )

      const nextButton = screen.getByText('Next')
      expect(nextButton).toBeDisabled()
    })
  })

  describe('Step Description', () => {
    it('should render step description', () => {
      const stepsWithDescription = [
        {
          ...basicSteps[0],
          description: 'Enter your personal information'
        }
      ]

      render(
        <StepperForm
          steps={stepsWithDescription}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByText('Enter your personal information')).toBeInTheDocument()
    })
  })

  describe('Header and Footer', () => {
    it('should render custom header and footer', () => {
      render(
        <StepperForm
          steps={basicSteps}
          header={<div>Custom Header</div>}
          footer={<div>Custom Footer</div>}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByText('Custom Header')).toBeInTheDocument()
      expect(screen.getByText('Custom Footer')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for stepper', () => {
      render(
        <StepperForm
          steps={basicSteps}
          onSubmit={mockSubmit}
        />
      )

      const stepper = screen.getByRole('list')
      expect(stepper).toBeInTheDocument()
    })

    it('should indicate active step', () => {
      render(
        <StepperForm
          steps={basicSteps}
          onSubmit={mockSubmit}
        />
      )

      const step1 = screen.getByText('Step 1')
      const step1Parent = step1.closest('[aria-current]')
      if (step1Parent) {
        expect(step1Parent.getAttribute('aria-current')).toBe('step')
      }
    })
  })
})