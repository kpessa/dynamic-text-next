import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Radio, RadioGroup } from './Radio'

describe('Radio', () => {
  describe('Single Radio Button', () => {
    it('should render radio button without label', () => {
      render(<Radio />)
      const radio = screen.getByRole('radio')
      expect(radio).toBeInTheDocument()
    })

    it('should render radio button with label', () => {
      render(<Radio label="Option A" />)
      const radio = screen.getByRole('radio')
      const label = screen.getByText('Option A')
      expect(radio).toBeInTheDocument()
      expect(label).toBeInTheDocument()
    })

    it('should render with helper text', () => {
      render(<Radio label="Choice" helperText="Select this option" />)
      expect(screen.getByText('Select this option')).toBeInTheDocument()
    })

    it('should handle disabled state', () => {
      render(<Radio label="Disabled" disabled />)
      const radio = screen.getByRole('radio')
      expect(radio).toBeDisabled()
    })

    it('should handle required state', () => {
      render(<Radio label="Required" required />)
      const radio = screen.getByRole('radio')
      expect(radio).toBeRequired()
    })

    it('should handle checked state', () => {
      render(<Radio label="Checked" checked />)
      const radio = screen.getByRole('radio') as HTMLInputElement
      expect(radio.checked).toBe(true)
    })
  })

  describe('RadioGroup', () => {
    const mockOptions = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3', disabled: true },
      { value: 'option4', label: 'Option 4', helperText: 'Recommended choice' }
    ]

    it('should render radio group with options', () => {
      render(<RadioGroup options={mockOptions} />)
      expect(screen.getByText('Option 1')).toBeInTheDocument()
      expect(screen.getByText('Option 2')).toBeInTheDocument()
      expect(screen.getByText('Option 3')).toBeInTheDocument()
      expect(screen.getByText('Option 4')).toBeInTheDocument()
    })

    it('should render with group label', () => {
      render(<RadioGroup options={mockOptions} label="Select an option" />)
      expect(screen.getByText('Select an option')).toBeInTheDocument()
    })

    it('should render with helper text', () => {
      render(<RadioGroup options={mockOptions} helperText="Choose one option" />)
      expect(screen.getByText('Choose one option')).toBeInTheDocument()
    })

    it('should render option helper text', () => {
      render(<RadioGroup options={mockOptions} />)
      expect(screen.getByText('Recommended choice')).toBeInTheDocument()
    })

    it('should handle value selection', () => {
      render(<RadioGroup options={mockOptions} value="option2" />)
      const option2 = screen.getByLabelText('Option 2') as HTMLInputElement
      expect(option2.checked).toBe(true)
    })

    it('should handle onChange event', () => {
      const handleChange = vi.fn()
      render(<RadioGroup options={mockOptions} onChange={handleChange} />)
      const option1 = screen.getByLabelText('Option 1')
      
      fireEvent.click(option1)
      expect(handleChange).toHaveBeenCalled()
    })

    it('should disable specific options', () => {
      render(<RadioGroup options={mockOptions} />)
      const option3 = screen.getByLabelText('Option 3')
      expect(option3).toBeDisabled()
    })

    it('should disable entire group', () => {
      render(<RadioGroup options={mockOptions} disabled />)
      const radios = screen.getAllByRole('radio')
      radios.forEach(radio => {
        expect(radio).toBeDisabled()
      })
    })

    it('should apply error state', () => {
      render(<RadioGroup options={mockOptions} error helperText="Please select an option" />)
      expect(screen.getByText('Please select an option')).toBeInTheDocument()
    })

    it('should render horizontally', () => {
      const { container } = render(<RadioGroup options={mockOptions} orientation="horizontal" />)
      const radioGroup = container.querySelector('.MuiRadioGroup-root')
      expect(radioGroup?.className).toContain('MuiRadioGroup-row')
    })

    it('should render vertically by default', () => {
      const { container } = render(<RadioGroup options={mockOptions} />)
      const radioGroup = container.querySelector('.MuiRadioGroup-root')
      expect(radioGroup?.className).not.toContain('MuiRadioGroup-row')
    })
  })

  describe('Label Placement', () => {
    it('should place label at end by default', () => {
      const { container } = render(<Radio label="End placement" />)
      const label = container.querySelector('.MuiFormControlLabel-root')
      expect(label?.className).toContain('MuiFormControlLabel-labelPlacementEnd')
    })

    it('should place label at start', () => {
      const { container } = render(<Radio label="Start placement" labelPlacement="start" />)
      const label = container.querySelector('.MuiFormControlLabel-root')
      expect(label?.className).toContain('MuiFormControlLabel-labelPlacementStart')
    })

    it('should place label at top', () => {
      const { container } = render(<Radio label="Top placement" labelPlacement="top" />)
      const label = container.querySelector('.MuiFormControlLabel-root')
      expect(label?.className).toContain('MuiFormControlLabel-labelPlacementTop')
    })

    it('should place label at bottom', () => {
      const { container } = render(<Radio label="Bottom placement" labelPlacement="bottom" />)
      const label = container.querySelector('.MuiFormControlLabel-root')
      expect(label?.className).toContain('MuiFormControlLabel-labelPlacementBottom')
    })
  })

  describe('Accessibility', () => {
    it('should have proper role', () => {
      render(<Radio label="Accessible" />)
      const radio = screen.getByRole('radio')
      expect(radio).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      render(<Radio label="Keyboard Nav" />)
      const radio = screen.getByRole('radio')
      
      radio.focus()
      expect(document.activeElement).toBe(radio)
    })

    it('should associate label with radio button', () => {
      render(<Radio label="Associated Label" />)
      const radio = screen.getByRole('radio')
      const label = screen.getByText('Associated Label')
      
      fireEvent.click(label)
    })

    it('should have required indicator in group', () => {
      render(<RadioGroup options={[{ value: '1', label: 'Option' }]} label="Required Group" required />)
      const label = screen.getByText('Required Group')
      const asterisk = label.parentElement?.querySelector('.MuiFormLabel-asterisk')
      expect(asterisk).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render without label and helper text', () => {
      const { container } = render(<Radio />)
      const radio = screen.getByRole('radio')
      expect(radio).toBeInTheDocument()
      expect(container.querySelector('.MuiFormControlLabel-root')).not.toBeInTheDocument()
    })

    it('should handle empty options array', () => {
      render(<RadioGroup options={[]} label="Empty Group" />)
      expect(screen.getByText('Empty Group')).toBeInTheDocument()
      expect(screen.queryAllByRole('radio')).toHaveLength(0)
    })

    it('should handle numeric values', () => {
      const numericOptions = [
        { value: 1, label: 'One' },
        { value: 2, label: 'Two' }
      ]
      render(<RadioGroup options={numericOptions} value={1} />)
      const option1 = screen.getByLabelText('One') as HTMLInputElement
      expect(option1.checked).toBe(true)
    })
  })
})