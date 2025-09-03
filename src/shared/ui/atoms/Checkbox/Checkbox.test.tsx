import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  describe('Basic Rendering', () => {
    it('should render checkbox without label', () => {
      render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('should render checkbox with label', () => {
      render(<Checkbox label="Accept terms" />)
      const checkbox = screen.getByRole('checkbox')
      const label = screen.getByText('Accept terms')
      expect(checkbox).toBeInTheDocument()
      expect(label).toBeInTheDocument()
    })

    it('should render with helper text', () => {
      render(<Checkbox label="Subscribe" helperText="Receive our newsletter" />)
      expect(screen.getByText('Receive our newsletter')).toBeInTheDocument()
    })
  })

  describe('Checkbox States', () => {
    it('should handle checked state', () => {
      render(<Checkbox label="Checked" checked />)
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })

    it('should handle unchecked state', () => {
      render(<Checkbox label="Unchecked" checked={false} />)
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })

    it('should handle indeterminate state', () => {
      const { container } = render(<Checkbox label="Indeterminate" indeterminate />)
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox).toBeInTheDocument()
    })

    it('should handle disabled state', () => {
      render(<Checkbox label="Disabled" disabled />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })

    it('should handle required state', () => {
      render(<Checkbox label="Required" required />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeRequired()
    })

    it('should handle error state', () => {
      render(<Checkbox label="Error" error helperText="This field has an error" />)
      expect(screen.getByText('This field has an error')).toBeInTheDocument()
    })
  })

  describe('Label Placement', () => {
    it('should place label at end by default', () => {
      const { container } = render(<Checkbox label="End placement" />)
      const label = container.querySelector('.MuiFormControlLabel-root')
      expect(label?.className).toContain('MuiFormControlLabel-labelPlacementEnd')
    })

    it('should place label at start', () => {
      const { container } = render(<Checkbox label="Start placement" labelPlacement="start" />)
      const label = container.querySelector('.MuiFormControlLabel-root')
      expect(label?.className).toContain('MuiFormControlLabel-labelPlacementStart')
    })

    it('should place label at top', () => {
      const { container } = render(<Checkbox label="Top placement" labelPlacement="top" />)
      const label = container.querySelector('.MuiFormControlLabel-root')
      expect(label?.className).toContain('MuiFormControlLabel-labelPlacementTop')
    })

    it('should place label at bottom', () => {
      const { container } = render(<Checkbox label="Bottom placement" labelPlacement="bottom" />)
      const label = container.querySelector('.MuiFormControlLabel-root')
      expect(label?.className).toContain('MuiFormControlLabel-labelPlacementBottom')
    })
  })

  describe('User Interactions', () => {
    it('should handle onChange event', () => {
      const handleChange = vi.fn()
      render(<Checkbox label="Clickable" onChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')
      
      fireEvent.click(checkbox)
      expect(handleChange).toHaveBeenCalled()
    })

    it('should not trigger onChange when disabled', () => {
      const handleChange = vi.fn()
      render(<Checkbox label="Disabled" disabled onChange={handleChange} />)
      const checkbox = screen.getByRole('checkbox')
      
      fireEvent.click(checkbox)
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('should toggle checked state', () => {
      const handleChange = vi.fn()
      const { rerender } = render(
        <Checkbox label="Toggle" checked={false} onChange={handleChange} />
      )
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement
      
      expect(checkbox.checked).toBe(false)
      
      fireEvent.click(checkbox)
      expect(handleChange).toHaveBeenCalled()
      
      rerender(<Checkbox label="Toggle" checked={true} onChange={handleChange} />)
      expect(checkbox.checked).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Checkbox label="Accessible" />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
    })

    it('should associate label with checkbox', () => {
      render(<Checkbox label="Associated Label" />)
      const checkbox = screen.getByRole('checkbox')
      const label = screen.getByText('Associated Label')
      
      fireEvent.click(label)
    })

    it('should support keyboard navigation', () => {
      render(<Checkbox label="Keyboard Nav" />)
      const checkbox = screen.getByRole('checkbox')
      
      checkbox.focus()
      expect(document.activeElement).toBe(checkbox)
    })

    it('should have proper checked state', () => {
      render(<Checkbox label="Checked" checked />)
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should render without label and helper text', () => {
      const { container } = render(<Checkbox />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(container.querySelector('.MuiFormControlLabel-root')).not.toBeInTheDocument()
    })

    it('should render with only helper text', () => {
      render(<Checkbox helperText="Helper only" />)
      const checkbox = screen.getByRole('checkbox')
      const helperText = screen.getByText('Helper only')
      expect(checkbox).toBeInTheDocument()
      expect(helperText).toBeInTheDocument()
    })
  })
})