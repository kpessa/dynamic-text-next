import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Select } from './Select'
import { SelectOption } from './Select.types'

const mockOptions: SelectOption[] = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3', disabled: true },
  { value: '4', label: 'Option 4' }
]

describe('Select', () => {
  describe('Basic Rendering', () => {
    it('should render select with label', () => {
      const { container } = render(<Select label="Choose One" options={mockOptions} />)
      const label = container.querySelector('.MuiFormLabel-root')
      expect(label?.textContent).toContain('Choose One')
    })

    it('should display placeholder when no value selected', () => {
      render(<Select label="Choose" options={mockOptions} placeholder="Select an option..." />)
      expect(screen.getByText('Select an option...')).toBeInTheDocument()
    })

    it('should display selected value', () => {
      render(<Select label="Choose" options={mockOptions} value="2" />)
      expect(screen.getByText('Option 2')).toBeInTheDocument()
    })

    it('should display helper text', () => {
      render(
        <Select 
          label="Field" 
          options={mockOptions}
          helperText="This is helpful"
        />
      )
      expect(screen.getByText('This is helpful')).toBeInTheDocument()
    })
  })

  describe('Multi Select', () => {
    it('should display multiple selected values', () => {
      render(
        <Select 
          label="Choose Multiple" 
          options={mockOptions} 
          variant="multi"
          value={['1', '2']}
        />
      )
      expect(screen.getByText('Option 1, Option 2')).toBeInTheDocument()
    })

    it('should display placeholder for empty multi-select', () => {
      render(
        <Select 
          label="Choose Multiple" 
          options={mockOptions} 
          variant="multi"
          placeholder="Select multiple..."
          value={[]}
        />
      )
      expect(screen.getByText('Select multiple...')).toBeInTheDocument()
    })
  })

  describe('Validation States', () => {
    it('should apply error state with helper text', () => {
      render(
        <Select 
          label="Invalid" 
          options={mockOptions} 
          validationState="error"
          helperText="This field has an error"
        />
      )
      expect(screen.getByText('This field has an error')).toBeInTheDocument()
    })
  })

  describe('Required Field', () => {
    it('should show required indicator', () => {
      render(<Select label="Required Field" options={mockOptions} required />)
      const label = screen.getByText('Required Field')
      const asterisk = label.parentElement?.querySelector('.MuiFormLabel-asterisk')
      expect(asterisk).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      render(<Select label="Empty" options={[]} placeholder="No options..." />)
      expect(screen.getByText('No options...')).toBeInTheDocument()
    })

    it('should handle options with icons', () => {
      const optionsWithIcons: SelectOption[] = [
        { value: '1', label: 'Home', icon: '🏠' }
      ]
      
      render(<Select label="With Icons" options={optionsWithIcons} value="1" />)
      expect(screen.getByText('Home')).toBeInTheDocument()
    })
  })
})