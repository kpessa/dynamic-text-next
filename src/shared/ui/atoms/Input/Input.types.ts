import { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField'

export type InputVariant = 'text' | 'number' | 'password' | 'textarea' | 'email' | 'tel' | 'url' | 'search'

export interface InputProps extends Omit<MuiTextFieldProps, 'variant' | 'type'> {
  variant?: InputVariant
  showPasswordToggle?: boolean
  incrementControls?: boolean
  autoResize?: boolean
  maxLength?: number
  showCharacterCount?: boolean
  validationState?: 'default' | 'success' | 'warning' | 'error'
  min?: number
  max?: number
  step?: number
}