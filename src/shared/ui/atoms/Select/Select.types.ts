import { SelectProps as MuiSelectProps } from '@mui/material/Select'
import { ReactNode } from 'react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  icon?: ReactNode
}

export interface SelectProps extends Omit<MuiSelectProps, 'variant'> {
  options: SelectOption[]
  variant?: 'single' | 'multi' | 'searchable'
  placeholder?: string
  searchable?: boolean
  showCheckboxes?: boolean
  groupBy?: (option: SelectOption) => string
  helperText?: string
  validationState?: 'default' | 'success' | 'warning' | 'error'
}