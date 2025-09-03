import { RadioProps as MuiRadioProps } from '@mui/material/Radio'
import { RadioGroupProps as MuiRadioGroupProps } from '@mui/material/RadioGroup'
import { FormControlLabelProps } from '@mui/material/FormControlLabel'

export type RadioLabelPlacement = 'end' | 'start' | 'top' | 'bottom'
export type RadioGroupOrientation = 'horizontal' | 'vertical'

export interface RadioOption {
  value: string | number
  label: string
  disabled?: boolean
  helperText?: string
}

export interface RadioProps extends Omit<MuiRadioProps, 'color'> {
  label?: string
  labelPlacement?: RadioLabelPlacement
  helperText?: string
  error?: boolean
  color?: MuiRadioProps['color']
  FormControlLabelProps?: Partial<FormControlLabelProps>
}

export interface RadioGroupProps extends Omit<MuiRadioGroupProps, 'orientation'> {
  options: RadioOption[]
  label?: string
  helperText?: string
  error?: boolean
  required?: boolean
  disabled?: boolean
  orientation?: RadioGroupOrientation
  labelPlacement?: RadioLabelPlacement
}