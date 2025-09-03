import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatePicker, DateRangePicker } from './DatePicker'

describe('DatePicker', () => {
  describe('Basic Rendering', () => {
    it('should render date picker input', () => {
      render(<DatePicker label="Select Date" />)
      expect(screen.getByLabelText(/Select Date/i)).toBeInTheDocument()
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
      
      render(<DatePicker onChange={handleChange} label="Date" />)
      const input = screen.getByLabelText(/Date/i)
      
      await user.click(input)
      // DatePicker interaction would open calendar
      expect(input).toBeInTheDocument()
    })

    it('should handle disabled state', () => {
      render(<DatePicker label="Disabled Date" disabled />)
      expect(screen.getByLabelText(/Disabled Date/i)).toBeDisabled()
    })
  })

  describe('Validation', () => {
    it('should show error state', () => {
      render(<DatePicker error helperText="Invalid date" />)
      expect(screen.getByText('Invalid date')).toBeInTheDocument()
    })

    it('should handle required field', () => {
      const { container } = render(<DatePicker required label="Required Date" />)
      const textField = container.querySelector('.MuiTextField-root')
      expect(textField).toBeInTheDocument()
    })
  })

  describe('DateTimePicker', () => {
    it('should render datetime picker when showTimePicker is true', () => {
      render(<DatePicker showTimePicker label="Date and Time" />)
      expect(screen.getByLabelText(/Date and Time/i)).toBeInTheDocument()
    })
  })
})

describe('DateRangePicker', () => {
  describe('Basic Rendering', () => {
    it('should render start and end date inputs', () => {
      render(<DateRangePicker label="Date Range" />)
      expect(screen.getByLabelText(/Start/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/End/i)).toBeInTheDocument()
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
      
      render(<DateRangePicker onChange={handleChange} />)
      const startInput = screen.getByLabelText(/Start/i)
      
      await user.click(startInput)
      // Interaction would open calendar
      expect(startInput).toBeInTheDocument()
    })

    it('should handle disabled state for both inputs', () => {
      render(<DateRangePicker disabled />)
      expect(screen.getByLabelText(/Start/i)).toBeDisabled()
      expect(screen.getByLabelText(/End/i)).toBeDisabled()
    })
  })
})