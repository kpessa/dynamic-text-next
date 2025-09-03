export interface DatePickerProps {
  label?: string
  value?: Date | null
  onChange?: (date: Date | null) => void
  placeholder?: string
  format?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  required?: boolean
  error?: boolean
  helperText?: string
  fullWidth?: boolean
  size?: 'small' | 'medium'
  variant?: 'outlined' | 'filled' | 'standard'
  showTimePicker?: boolean
  disablePast?: boolean
  disableFuture?: boolean
  shouldDisableDate?: (date: Date) => boolean
  sx?: any
  className?: string
}

export interface DateRangePickerProps {
  label?: string
  startDate?: Date | null
  endDate?: Date | null
  onChange?: (startDate: Date | null, endDate: Date | null) => void
  startPlaceholder?: string
  endPlaceholder?: string
  format?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  required?: boolean
  error?: boolean
  helperText?: string
  fullWidth?: boolean
  size?: 'small' | 'medium'
  variant?: 'outlined' | 'filled' | 'standard'
  disablePast?: boolean
  disableFuture?: boolean
  sx?: any
  className?: string
}