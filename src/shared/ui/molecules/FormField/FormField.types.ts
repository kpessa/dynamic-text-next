import { InputProps } from '@/shared/ui/atoms/Input'
import { ReactNode } from 'react'

export interface FormFieldProps extends Omit<InputProps, 'error'> {
  label?: string
  helperText?: string
  error?: boolean
  errorMessage?: string
  required?: boolean
  showCharacterCount?: boolean
  maxLength?: number
  id?: string
  labelPlacement?: 'top' | 'left'
  labelWidth?: string | number
}