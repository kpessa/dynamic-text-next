import React from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { DateField } from '@mui/x-date-pickers/DateField'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import { DatePickerProps, DateRangePickerProps } from './DatePicker.types'

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      label,
      value,
      onChange,
      placeholder,
      format = 'MM/dd/yyyy',
      minDate,
      maxDate,
      disabled = false,
      required = false,
      error = false,
      helperText,
      fullWidth = true,
      size = 'medium',
      variant = 'outlined',
      showTimePicker = false,
      disablePast = false,
      disableFuture = false,
      shouldDisableDate,
      sx,
      className
    },
    ref
  ) => {
    const PickerComponent = showTimePicker ? DateTimePicker : MuiDatePicker

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box ref={ref} sx={{ width: fullWidth ? '100%' : 'auto', ...sx }} className={className}>
          <PickerComponent
            label={label}
            value={value || null}
            onChange={(newValue) => {
              if (onChange) {
                onChange(newValue)
              }
            }}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
            disablePast={disablePast}
            disableFuture={disableFuture}
            shouldDisableDate={shouldDisableDate}
            format={showTimePicker ? 'MM/dd/yyyy HH:mm' : format}
            slotProps={{
              textField: {
                placeholder,
                required,
                error,
                helperText,
                fullWidth,
                size,
                variant
              },
              actionBar: {
                actions: ['clear', 'today', 'accept']
              }
            }}
          />
        </Box>
      </LocalizationProvider>
    )
  }
)

DatePicker.displayName = 'DatePicker'

export const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      label,
      startDate,
      endDate,
      onChange,
      startPlaceholder = 'Start date',
      endPlaceholder = 'End date',
      format = 'MM/dd/yyyy',
      minDate,
      maxDate,
      disabled = false,
      required = false,
      error = false,
      helperText,
      fullWidth = true,
      size = 'medium',
      variant = 'outlined',
      disablePast = false,
      disableFuture = false,
      sx,
      className
    },
    ref
  ) => {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box 
          ref={ref} 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            width: fullWidth ? '100%' : 'auto',
            ...sx 
          }} 
          className={className}
        >
          <MuiDatePicker
            label={label ? `${label} - Start` : 'Start Date'}
            value={startDate || null}
            onChange={(newValue) => {
              if (onChange) {
                onChange(newValue, endDate)
              }
            }}
            disabled={disabled}
            minDate={minDate}
            maxDate={endDate || maxDate}
            disablePast={disablePast}
            disableFuture={disableFuture}
            format={format}
            slotProps={{
              textField: {
                placeholder: startPlaceholder,
                required,
                error,
                fullWidth: true,
                size,
                variant
              }
            }}
          />
          
          <MuiDatePicker
            label={label ? `${label} - End` : 'End Date'}
            value={endDate || null}
            onChange={(newValue) => {
              if (onChange) {
                onChange(startDate, newValue)
              }
            }}
            disabled={disabled}
            minDate={startDate || minDate}
            maxDate={maxDate}
            disablePast={disablePast}
            disableFuture={disableFuture}
            format={format}
            slotProps={{
              textField: {
                placeholder: endPlaceholder,
                required,
                error,
                helperText: helperText,
                fullWidth: true,
                size,
                variant
              }
            }}
          />
        </Box>
      </LocalizationProvider>
    )
  }
)

DateRangePicker.displayName = 'DateRangePicker'