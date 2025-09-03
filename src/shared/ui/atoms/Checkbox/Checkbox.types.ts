import { CheckboxProps as MuiCheckboxProps } from '@mui/material/Checkbox'
import { FormControlLabelProps } from '@mui/material/FormControlLabel'

export type CheckboxLabelPlacement = 'end' | 'start' | 'top' | 'bottom'

export interface CheckboxProps extends Omit<MuiCheckboxProps, 'indeterminate'> {
  label?: string
  labelPlacement?: CheckboxLabelPlacement
  indeterminate?: boolean
  helperText?: string
  error?: boolean
  FormControlLabelProps?: Partial<FormControlLabelProps>
}