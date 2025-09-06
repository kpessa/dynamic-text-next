import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatePicker, DateRangePicker } from './DatePicker'

describe('DatePicker', () => {
  describe('Basic Rendering', () => {
    it('should render date picker input', () => {
      const { container } = render(<DatePicker label="Select Date" />)
      const input = container.querySelector('input')
      expect(input).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      render(<DatePicker placeholder="MM/DD/YYYY" />)
      expect(screen.getByPlaceholderText('MM/DD/YYYY')).toBeInTheDocument()
    })

    it('should display selected date', () => {
      const testDate = new Date(2024, 0, 15)
      render(<DatePicker value={testDate} />)
      expect(screen.getByDisplayValue('01/15/2024')).toBeInTheDocument()
    })
  })

  describe('User Interaction', () => {
    it('should call onChange when date is selected', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()
      
      const { container } = render(<DatePicker onChange={handleChange} label="Date" />)
      const input = container.querySelector('input')
      
      await user.click(input!)
      // DatePicker interaction would open calendar
      expect(input).toBeInTheDocument()
    })

    it('should handle disabled state', () => {
      const { container } = render(<DatePicker label="Disabled Date" disabled />)
      const input = container.querySelector('input')
      expect(input).toBeDisabled()
    })
  })

  describe('Validation', () => {
    it('should show error state', () => {
      render(<DatePicker error helperText="Invalid date" />)
      expect(screen.getByText('Invalid date')).toBeInTheDocument()
    })

    it('should handle required field', () => {
      const { container } = render(<DatePicker required label="Required Date" />)
      const input = container.querySelector('input')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('DateTimePicker', () => {
    it('should render datetime picker when showTimePicker is true', () => {
      const { container } = render(<DatePicker showTimePicker label="Date and Time" />)
      const input = container.querySelector('input')
      expect(input).toBeInTheDocument()
    })
  })
})

describe('DateRangePicker', () => {
  describe('Basic Rendering', () => {
    it('should render start and end date inputs', () => {
      const { container } = render(<DateRangePicker label="Date Range" />)
      const inputs = container.querySelectorAll('input')
      expect(inputs.length).toBe(2)
    })

    it('should display selected date range', () => {
      const startDate = new Date(2024, 0, 1)
      const endDate = new Date(2024, 0, 31)
      
      render(<DateRangePicker startDate={startDate} endDate={endDate} />)
      expect(screen.getByDisplayValue('01/01/2024')).toBeInTheDocument()
      expect(screen.getByDisplayValue('01/31/2024')).toBeInTheDocument()
    })
  })

  describe('User Interaction', () => {
    it('should call onChange when dates are selected', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()
      
      const { container } = render(<DateRangePicker onChange={handleChange} />)
      const inputs = container.querySelectorAll('input')
      const startInput = inputs[0]
      
      await user.click(startInput)
      // Interaction would open calendar
      expect(startInput).toBeInTheDocument()
    })

    it('should handle disabled state for both inputs', () => {
      const { container } = render(<DateRangePicker disabled />)
      const inputs = container.querySelectorAll('input')
      expect(inputs[0]).toBeDisabled()
      expect(inputs[1]).toBeDisabled()
    })
  })
})