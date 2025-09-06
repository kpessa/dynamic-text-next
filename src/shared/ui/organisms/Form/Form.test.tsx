import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form } from './Form'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'

describe('Form', () => {
  const mockSubmit = vi.fn()
  const mockError = vi.fn()
  const mockCancel = vi.fn()
  const mockAutoSave = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render text field correctly', () => {
      render(
        <Form
          fields={[
            { name: 'username', label: 'Username', type: 'text' }
          ]}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByLabelText('Username')).toBeInTheDocument()
    })

    it('should render multiple field types', () => {
      render(
        <Form
          fields={[
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'password', label: 'Password', type: 'password' },
            { name: 'age', label: 'Age', type: 'number' },
            { name: 'bio', label: 'Bio', type: 'textarea' }
          ]}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Age')).toBeInTheDocument()
      expect(screen.getByLabelText('Bio')).toBeInTheDocument()
    })

    it('should render select field with options', () => {
      render(
        <Form
          fields={[
            {
              name: 'country',
              label: 'Country',
              type: 'select',
              options: [
                { value: 'us', label: 'United States' },
                { value: 'uk', label: 'United Kingdom' }
              ]
            }
          ]}
          onSubmit={mockSubmit}
        />
      )

      const select = screen.getByLabelText('Country')
      expect(select).toBeInTheDocument()
    })

    it('should render checkbox field', () => {
      render(
        <Form
          fields={[
            { name: 'terms', label: 'Accept Terms', type: 'checkbox' }
          ]}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByLabelText('Accept Terms')).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('should render radio group with options', () => {
      render(
        <Form
          fields={[
            {
              name: 'gender',
              label: 'Gender',
              type: 'radio',
              options: [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ]
            }
          ]}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByLabelText('Male')).toBeInTheDocument()
      expect(screen.getByLabelText('Female')).toBeInTheDocument()
      expect(screen.getByLabelText('Other')).toBeInTheDocument()
    })

    it('should render switch field', () => {
      render(
        <Form
          fields={[
            { name: 'notifications', label: 'Enable Notifications', type: 'switch' }
          ]}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByLabelText('Enable Notifications')).toBeInTheDocument()
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })
  })

  describe('Form Sections', () => {
    it('should render sections with titles', () => {
      render(
        <Form
          sections={[
            {
              title: 'Personal Info',
              fields: [
                { name: 'firstName', label: 'First Name', type: 'text' },
                { name: 'lastName', label: 'Last Name', type: 'text' }
              ]
            },
            {
              title: 'Contact Info',
              fields: [
                { name: 'email', label: 'Email', type: 'email' },
                { name: 'phone', label: 'Phone', type: 'tel' }
              ]
            }
          ]}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByText('Personal Info')).toBeInTheDocument()
      expect(screen.getByText('Contact Info')).toBeInTheDocument()
      expect(screen.getByLabelText('First Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('should render collapsible sections', () => {
      render(
        <Form
          sections={[
            {
              title: 'Advanced Settings',
              collapsible: true,
              defaultExpanded: false,
              fields: [
                { name: 'setting1', label: 'Setting 1', type: 'text' }
              ]
            }
          ]}
          onSubmit={mockSubmit}
        />
      )

      const accordion = screen.getByText('Advanced Settings')
      expect(accordion).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should validate required fields', async () => {
      const schema = yup.object({
        username: yup.string().required('Username is required')
      })

      render(
        <Form
          fields={[
            { name: 'username', label: 'Username', type: 'text', required: true }
          ]}
          validationSchema={schema}
          onSubmit={mockSubmit}
        />
      )

      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument()
      })
    })

    it('should validate email format', async () => {
      const schema = yup.object({
        email: yup.string().email('Invalid email').required('Email is required')
      })

      render(
        <Form
          fields={[
            { name: 'email', label: 'Email', type: 'email' }
          ]}
          validationSchema={schema}
          onSubmit={mockSubmit}
        />
      )

      const emailField = screen.getByLabelText('Email')
      const submitButton = screen.getByText('Submit')

      await userEvent.type(emailField, 'invalid-email')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email')).toBeInTheDocument()
      })
    })

    it('should show validation summary when enabled', async () => {
      const schema = yup.object({
        field1: yup.string().required('Field 1 is required'),
        field2: yup.string().required('Field 2 is required')
      })

      render(
        <Form
          fields={[
            { name: 'field1', label: 'Field 1', type: 'text' },
            { name: 'field2', label: 'Field 2', type: 'text' }
          ]}
          validationSchema={schema}
          showValidationSummary
          onSubmit={mockSubmit}
        />
      )

      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please correct the following errors:')).toBeInTheDocument()
        expect(screen.getByText('Field 1 is required')).toBeInTheDocument()
        expect(screen.getByText('Field 2 is required')).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call onSubmit with form data', async () => {
      render(
        <Form
          fields={[
            { name: 'username', label: 'Username', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' }
          ]}
          defaultValues={{
            username: 'testuser',
            email: 'test@example.com'
          }}
          onSubmit={mockSubmit}
        />
      )

      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          username: 'testuser',
          email: 'test@example.com'
        })
      })
    })

    it('should call onError when submission fails', async () => {
      const error = new Error('Submission failed')
      mockSubmit.mockRejectedValueOnce(error)

      render(
        <Form
          fields={[
            { name: 'field', label: 'Field', type: 'text' }
          ]}
          onSubmit={mockSubmit}
          onError={mockError}
        />
      )

      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockError).toHaveBeenCalledWith(error)
      })
    })

    it('should submit on Enter key when submitOnEnter is true', async () => {
      render(
        <Form
          fields={[
            { name: 'field', label: 'Field', type: 'text' }
          ]}
          defaultValues={{ field: 'test' }}
          submitOnEnter
          onSubmit={mockSubmit}
        />
      )

      const textField = screen.getByLabelText('Field')
      fireEvent.keyPress(textField, { key: 'Enter', code: 'Enter', charCode: 13 })

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({ field: 'test' })
      })
    })
  })

  describe('Form Buttons', () => {
    it('should render submit, reset, and cancel buttons', () => {
      render(
        <Form
          fields={[{ name: 'field', label: 'Field', type: 'text' }]}
          showReset
          showCancel
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />
      )

      expect(screen.getByText('Submit')).toBeInTheDocument()
      expect(screen.getByText('Reset')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should use custom button labels', () => {
      render(
        <Form
          fields={[{ name: 'field', label: 'Field', type: 'text' }]}
          submitLabel="Save"
          resetLabel="Clear"
          cancelLabel="Back"
          showReset
          showCancel
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByText('Save')).toBeInTheDocument()
      expect(screen.getByText('Clear')).toBeInTheDocument()
      expect(screen.getByText('Back')).toBeInTheDocument()
    })

    it('should reset form when reset button is clicked', async () => {
      render(
        <Form
          fields={[
            { name: 'field', label: 'Field', type: 'text' }
          ]}
          defaultValues={{ field: 'initial' }}
          showReset
          onSubmit={mockSubmit}
        />
      )

      const textField = screen.getByLabelText('Field')
      const resetButton = screen.getByText('Reset')

      await userEvent.clear(textField)
      await userEvent.type(textField, 'modified')
      expect(textField).toHaveValue('modified')

      fireEvent.click(resetButton)

      await waitFor(() => {
        expect(textField).toHaveValue('initial')
      })
    })

    it('should call onCancel when cancel button is clicked', () => {
      render(
        <Form
          fields={[{ name: 'field', label: 'Field', type: 'text' }]}
          showCancel
          onSubmit={mockSubmit}
          onCancel={mockCancel}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      expect(mockCancel).toHaveBeenCalled()
    })

    it('should render custom buttons', () => {
      render(
        <Form
          fields={[{ name: 'field', label: 'Field', type: 'text' }]}
          onSubmit={mockSubmit}
          customButtons={
            <>
              <button>Custom Action 1</button>
              <button>Custom Action 2</button>
            </>
          }
        />
      )

      expect(screen.getByText('Custom Action 1')).toBeInTheDocument()
      expect(screen.getByText('Custom Action 2')).toBeInTheDocument()
      expect(screen.queryByText('Submit')).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should disable form when loading', () => {
      render(
        <Form
          fields={[
            { name: 'field', label: 'Field', type: 'text' }
          ]}
          loading
          onSubmit={mockSubmit}
        />
      )

      const submitButton = screen.getByText('Submit')
      expect(submitButton).toBeDisabled()
    })

    it('should show loading indicator on submit button', () => {
      render(
        <Form
          fields={[{ name: 'field', label: 'Field', type: 'text' }]}
          loading
          onSubmit={mockSubmit}
        />
      )

      const submitButton = screen.getByText('Submit')
      expect(submitButton.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Conditional Fields', () => {
    it('should show field based on condition', async () => {
      render(
        <Form
          fields={[
            { name: 'showExtra', label: 'Show Extra', type: 'checkbox' },
            {
              name: 'extra',
              label: 'Extra Field',
              type: 'text',
              showWhen: (values) => values.showExtra === true
            }
          ]}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.queryByLabelText('Extra Field')).not.toBeInTheDocument()

      const checkbox = screen.getByLabelText('Show Extra')
      fireEvent.click(checkbox)

      await waitFor(() => {
        expect(screen.getByLabelText('Extra Field')).toBeInTheDocument()
      })
    })
  })

  describe('Auto-save', () => {
    it('should call onAutoSave when form changes', async () => {
      vi.useFakeTimers()

      render(
        <Form
          fields={[
            { name: 'field', label: 'Field', type: 'text' }
          ]}
          defaultValues={{ field: 'initial' }}
          autoSave
          autoSaveDelay={1000}
          onAutoSave={mockAutoSave}
          onSubmit={mockSubmit}
        />
      )

      const textField = screen.getByLabelText('Field')
      await userEvent.clear(textField)
      await userEvent.type(textField, 'modified')

      vi.advanceTimersByTime(1000)

      await waitFor(() => {
        expect(mockAutoSave).toHaveBeenCalledWith({ field: 'modified' })
      })

      vi.useRealTimers()
    })
  })

  describe('Messages', () => {
    it('should display success message', () => {
      render(
        <Form
          fields={[{ name: 'field', label: 'Field', type: 'text' }]}
          successMessage="Form submitted successfully!"
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByText('Form submitted successfully!')).toBeInTheDocument()
    })

    it('should display error message', () => {
      render(
        <Form
          fields={[{ name: 'field', label: 'Field', type: 'text' }]}
          errorMessage="Form submission failed!"
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByText('Form submission failed!')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render fields in specified columns', () => {
      render(
        <Form
          fields={[
            { name: 'field1', label: 'Field 1', type: 'text' },
            { name: 'field2', label: 'Field 2', type: 'text' },
            { name: 'field3', label: 'Field 3', type: 'text' },
            { name: 'field4', label: 'Field 4', type: 'text' }
          ]}
          columns={2}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByLabelText('Field 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Field 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Field 3')).toBeInTheDocument()
      expect(screen.getByLabelText('Field 4')).toBeInTheDocument()
    })

    it('should render header and footer', () => {
      render(
        <Form
          fields={[{ name: 'field', label: 'Field', type: 'text' }]}
          header={<div>Form Header</div>}
          footer={<div>Form Footer</div>}
          onSubmit={mockSubmit}
        />
      )

      expect(screen.getByText('Form Header')).toBeInTheDocument()
      expect(screen.getByText('Form Footer')).toBeInTheDocument()
    })
  })

  describe('Field Transform', () => {
    it('should apply input and output transforms', async () => {
      render(
        <Form
          fields={[
            {
              name: 'amount',
              label: 'Amount',
              type: 'text',
              transform: {
                input: (value) => value ? `$${value}` : '',
                output: (value) => value.replace('$', '')
              }
            }
          ]}
          defaultValues={{ amount: '100' }}
          onSubmit={mockSubmit}
        />
      )

      const amountField = screen.getByLabelText('Amount')
      expect(amountField).toHaveValue('$100')

      await userEvent.clear(amountField)
      await userEvent.type(amountField, '$200')

      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({ amount: '200' })
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <Form
          fields={[
            { name: 'username', label: 'Username', type: 'text', required: true },
            { name: 'password', label: 'Password', type: 'password' }
          ]}
          onSubmit={mockSubmit}
        />
      )

      const usernameField = screen.getByLabelText('Username')
      const passwordField = screen.getByLabelText('Password')

      expect(usernameField).toHaveAttribute('required')
      expect(passwordField).toHaveAttribute('type', 'password')
    })

    it('should show error messages with proper association', async () => {
      const schema = yup.object({
        username: yup.string().required('Username is required')
      })

      render(
        <Form
          fields={[
            { name: 'username', label: 'Username', type: 'text' }
          ]}
          validationSchema={schema}
          onSubmit={mockSubmit}
        />
      )

      const submitButton = screen.getByText('Submit')
      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorMessage = screen.getByText('Username is required')
        expect(errorMessage).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })
})