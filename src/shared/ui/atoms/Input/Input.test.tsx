import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  describe('Text Input Variant', () => {
    it('should render text input correctly', () => {
      render(<Input label="Name" variant="text" />)
      const input = screen.getByLabelText('Name')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should handle text input changes', async () => {
      const handleChange = vi.fn()
      render(<Input label="Name" variant="text" onChange={handleChange} />)
      const input = screen.getByLabelText('Name')
      
      await userEvent.type(input, 'John Doe')
      expect(handleChange).toHaveBeenCalled()
    })

    it('should respect maxLength', async () => {
      render(<Input label="Short" variant="text" maxLength={5} />)
      const input = screen.getByLabelText('Short') as HTMLInputElement
      
      await userEvent.type(input, 'abcdefghij')
      expect(input.value).toHaveLength(5)
    })

    it('should show character count when enabled', () => {
      render(
        <Input 
          label="Message" 
          variant="text" 
          value="Hello"
          maxLength={10}
          showCharacterCount
        />
      )
      expect(screen.getByText('5/10')).toBeInTheDocument()
    })
  })

  describe('Number Input Variant', () => {
    it('should render number input correctly', () => {
      render(<Input label="Age" variant="number" />)
      const input = screen.getByLabelText('Age')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should show increment/decrement controls when enabled', () => {
      render(<Input label="Quantity" variant="number" incrementControls />)
      expect(screen.getByLabelText('decrease value')).toBeInTheDocument()
      expect(screen.getByLabelText('increase value')).toBeInTheDocument()
    })

    it('should handle increment button click', async () => {
      const handleChange = vi.fn()
      render(
        <Input 
          label="Quantity" 
          variant="number" 
          incrementControls 
          value={5}
          onChange={handleChange}
        />
      )
      
      const increaseButton = screen.getByLabelText('increase value')
      fireEvent.click(increaseButton)
      
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled()
      })
    })

    it('should handle decrement button click', async () => {
      const handleChange = vi.fn()
      render(
        <Input 
          label="Quantity" 
          variant="number" 
          incrementControls 
          value={5}
          onChange={handleChange}
        />
      )
      
      const decreaseButton = screen.getByLabelText('decrease value')
      fireEvent.click(decreaseButton)
      
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled()
      })
    })

    it('should respect min and max values', () => {
      render(
        <Input 
          label="Limited" 
          variant="number" 
          incrementControls
          value={0}
          min={0}
          max={10}
        />
      )
      
      const decreaseButton = screen.getByLabelText('decrease value')
      expect(decreaseButton).toBeDisabled()
    })
  })

  describe('Password Input Variant', () => {
    it('should render password input correctly', () => {
      render(<Input label="Password" variant="password" />)
      const input = screen.getByLabelText('Password')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should toggle password visibility', () => {
      render(<Input label="Password" variant="password" />)
      const input = screen.getByLabelText('Password')
      const toggleButton = screen.getByLabelText('toggle password visibility')
      
      expect(input).toHaveAttribute('type', 'password')
      
      fireEvent.click(toggleButton)
      expect(input).toHaveAttribute('type', 'text')
      
      fireEvent.click(toggleButton)
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should hide toggle when showPasswordToggle is false', () => {
      render(<Input label="Password" variant="password" showPasswordToggle={false} />)
      expect(screen.queryByLabelText('toggle password visibility')).not.toBeInTheDocument()
    })
  })

  describe('Textarea Variant', () => {
    it('should render textarea correctly', () => {
      render(<Input label="Description" variant="textarea" />)
      const input = screen.getByLabelText('Description')
      expect(input).toBeInTheDocument()
      expect(input.tagName.toLowerCase()).toBe('textarea')
    })

    it('should handle multiline text', async () => {
      const handleChange = vi.fn()
      render(<Input label="Description" variant="textarea" onChange={handleChange} />)
      const textarea = screen.getByLabelText('Description')
      
      await userEvent.type(textarea, 'Line 1\nLine 2\nLine 3')
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('Validation States', () => {
    it('should apply success validation state', () => {
      const { container } = render(
        <Input label="Valid" validationState="success" />
      )
      const fieldset = container.querySelector('.MuiOutlinedInput-root')
      expect(fieldset?.className).toContain('MuiInputBase-colorSuccess')
    })

    it('should apply error validation state', () => {
      const { container } = render(
        <Input label="Invalid" validationState="error" helperText="This field has an error" />
      )
      expect(screen.getByText('This field has an error')).toBeInTheDocument()
    })

    it('should apply warning validation state', () => {
      const { container } = render(
        <Input label="Warning" validationState="warning" />
      )
      const fieldset = container.querySelector('.MuiOutlinedInput-root')
      expect(fieldset).toBeInTheDocument()
    })
  })

  describe('Other Input Types', () => {
    it('should render email input', () => {
      render(<Input label="Email" variant="email" />)
      const input = screen.getByLabelText('Email')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render tel input', () => {
      render(<Input label="Phone" variant="tel" />)
      const input = screen.getByLabelText('Phone')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('should render url input', () => {
      render(<Input label="Website" variant="url" />)
      const input = screen.getByLabelText('Website')
      expect(input).toHaveAttribute('type', 'url')
    })

    it('should render search input', () => {
      render(<Input label="Search" variant="search" />)
      const input = screen.getByLabelText('Search')
      expect(input).toHaveAttribute('type', 'search')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Input label="Accessible Input" aria-label="Custom Label" />)
      const input = screen.getByLabelText('Accessible Input')
      expect(input).toHaveAttribute('aria-label', 'Custom Label')
    })

    it('should support keyboard navigation', async () => {
      render(<Input label="Keyboard Nav" />)
      const input = screen.getByLabelText('Keyboard Nav')
      
      input.focus()
      expect(document.activeElement).toBe(input)
      
      await userEvent.tab()
      expect(document.activeElement).not.toBe(input)
    })

    it('should properly handle disabled state', () => {
      render(<Input label="Disabled" disabled />)
      const input = screen.getByLabelText('Disabled')
      expect(input).toBeDisabled()
    })

    it('should properly handle required state', () => {
      render(<Input label="Required Field" required />)
      const input = screen.getByLabelText('Required Field *')
      expect(input).toBeRequired()
    })
  })

  describe('Helper Text', () => {
    it('should display helper text', () => {
      render(<Input label="Field" helperText="This is helpful" />)
      expect(screen.getByText('This is helpful')).toBeInTheDocument()
    })

    it('should combine helper text with character count', () => {
      render(
        <Input 
          label="Field" 
          helperText="Description"
          value="test"
          maxLength={10}
          showCharacterCount
        />
      )
      expect(screen.getByText('Description (4/10)')).toBeInTheDocument()
    })
  })
})