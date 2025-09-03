import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { DatePicker, DateRangePicker } from './DatePicker'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import { addDays, addMonths, subDays } from 'date-fns'

const meta = {
  title: 'Molecules/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'DatePicker molecule provides date selection with calendar popup, time picker, and date range selection.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'date',
      description: 'Selected date value'
    },
    label: {
      control: 'text',
      description: 'Field label'
    },
    format: {
      control: 'text',
      description: 'Date format string'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the date picker'
    },
    showTimePicker: {
      control: 'boolean',
      description: 'Include time selection'
    },
    disablePast: {
      control: 'boolean',
      description: 'Disable past dates'
    },
    disableFuture: {
      control: 'boolean',
      description: 'Disable future dates'
    }
  }
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Select Date',
    placeholder: 'MM/DD/YYYY'
  }
}

export const WithValue: Story = {
  args: {
    label: 'Appointment Date',
    value: new Date()
  }
}

export const DateTimeSelection: Story = {
  args: {
    label: 'Select Date & Time',
    showTimePicker: true,
    value: new Date()
  }
}

export const DisablePastDates: Story = {
  args: {
    label: 'Future Date Only',
    disablePast: true,
    helperText: 'Past dates are disabled'
  }
}

export const DisableFutureDates: Story = {
  args: {
    label: 'Past Date Only',
    disableFuture: true,
    helperText: 'Future dates are disabled'
  }
}

export const DateRange: Story = {
  render: () => {
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    
    return (
      <DateRangePicker
        label="Select Range"
        startDate={startDate}
        endDate={endDate}
        onChange={(start, end) => {
          setStartDate(start)
          setEndDate(end)
        }}
      />
    )
  }
}

export const ControlledExample: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(new Date())
    
    return (
      <Stack spacing={2} sx={{ width: 300 }}>
        <DatePicker
          label="Select Date"
          value={date}
          onChange={setDate}
        />
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2">
            Selected: {date ? date.toLocaleDateString() : 'None'}
          </Typography>
        </Paper>
      </Stack>
    )
  }
}

export const InteractivePlayground: Story = {
  args: {
    label: 'Interactive Date Picker',
    placeholder: 'Select a date...',
    helperText: 'Choose your preferred date',
    required: false,
    error: false,
    disabled: false,
    disablePast: false,
    disableFuture: false,
    showTimePicker: false,
    fullWidth: true,
    size: 'medium',
    variant: 'outlined'
  }
}