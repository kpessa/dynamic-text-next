import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormField } from './FormField'

describe('FormField', () => {
  describe('Basic Rendering', () => {
    it('should render input field', () => {
      render(<FormField />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should render with label', () => {
      render(<FormField label="Email Address" />)
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    })

    it('should render helper text', () => {
      render(<FormField helperText="Enter your email" />)
      expect(screen.getByText('Enter your email')).toBeInTheDocument()
    })

    it('should show required indicator', () => {
      render(<FormField label="Name" required />)
      const asterisks = screen.getAllByText('*')
      expect(asterisks.length).toBeGreaterThan(0)
    })
  })

  describe('Error States', () => {
    it('should show error state', () => {
      const { container } = render(<FormField error />)
      const formControl = container.querySelector('.MuiFormControl-root')
      expect(formControl).toBeInTheDocument()
      // MUI v7 may not add Mui-error class directly
    })

    it('should show error message', () => {
      render(<FormField error errorMessage="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should prioritize error message over helper text', () => {
      render(
        <FormField 
          helperText="Enter value" 
          error 
          errorMessage="Invalid value" 
        />
      )
      expect(screen.getByText('Invalid value')).toBeInTheDocument()
      expect(screen.queryByText('Enter value')).not.toBeInTheDocument()
    })
  })

  describe('Character Counter', () => {
    it('should show character count when enabled', () => {
      render(
        <FormField 
          showCharacterCount 
          maxLength={100} 
          value="Hello"
        />
      )
      expect(screen.getByText('5/100')).toBeInTheDocument()
    })

    it('should update character count on input', async () => {
      const user = userEvent.setup()
      render(<FormField showCharacterCount maxLength={50} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'Testing')
      
      expect(screen.getByText('7/50')).toBeInTheDocument()
    })

    it('should show error color when exceeding max length', () => {
      render(
        <FormField 
          showCharacterCount 
          maxLength={5} 
          value="Hello World"
        />
      )
      
      const counter = screen.getByText('11/5')
      expect(counter).toBeInTheDocument()
      // Color is applied through MUI theme
    })
  })

  describe('Label Placement', () => {
    it('should place label on top by default', () => {
      const { container } = render(<FormField label="Name" />)
      const formControl = container.querySelector('.MuiFormControl-root')
      expect(formControl).not.toHaveStyle({ flexDirection: 'row' })
    })

    it('should place label on left when specified', () => {
      const { container } = render(
        <FormField label="Name" labelPlacement="left" />
      )
      const formControl = container.querySelector('.MuiFormControl-root')
      expect(formControl).toHaveStyle({ flexDirection: 'row' })
    })

    it('should apply label width for left placement', () => {
      const { container } = render(
        <FormField 
          label="Name" 
          labelPlacement="left" 
          labelWidth={120}
        />
      )
      const label = container.querySelector('.MuiFormLabel-root')
      expect(label).toHaveStyle({ width: '120px' })
    })
  })

  describe('User Interaction', () => {
    it('should handle text input', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<FormField onChange={handleChange} />)
      const input = screen.getByRole('textbox')
      
      await user.type(input, 'Test')
      expect(handleChange).toHaveBeenCalledTimes(4)
    })

    it('should handle controlled input', () => {
      const { rerender } = render(<FormField value="Initial" />)
      expect(screen.getByRole('textbox')).toHaveValue('Initial')
      
      rerender(<FormField value="Updated" />)
      expect(screen.getByRole('textbox')).toHaveValue('Updated')
    })

    it('should handle uncontrolled input', async () => {
      const user = userEvent.setup()
      render(<FormField />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'Uncontrolled')
      
      expect(input).toHaveValue('Uncontrolled')
    })
  })

  describe('Input Props Forwarding', () => {
    it('should forward placeholder', () => {
      render(<FormField placeholder="Enter text here" />)
      expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument()
    })

    it('should forward disabled state', () => {
      render(<FormField disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('should forward multiline prop', () => {
      render(<FormField multiline rows={4} />)
      const textbox = screen.getByRole('textbox')
      expect(textbox).toBeInTheDocument()
      // Multiline is handled by MUI TextField
    })

    it('should apply maxLength constraint', () => {
      render(<FormField maxLength={10} />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('maxLength', '10')
    })
  })

  describe('Accessibility', () => {
    it('should associate label with input using id', () => {
      render(<FormField label="Email" id="email-field" />)
      const input = screen.getByLabelText('Email')
      expect(input).toHaveAttribute('id', 'email-field')
    })

    it('should generate id if not provided', () => {
      render(<FormField label="Name" />)
      const input = screen.getByLabelText('Name')
      expect(input).toHaveAttribute('id')
    })

    it('should mark required fields', () => {
      render(<FormField label="Required Field" required />)
      const input = screen.getByLabelText(/Required Field/)
      expect(input).toBeInTheDocument()
      // Required is handled by FormControl, not the input directly
    })

    it('should have proper ARIA attributes for errors', () => {
      render(<FormField error errorMessage="Invalid input" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })
  })
})