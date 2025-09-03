import React from 'react'
import MuiCheckbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import FormControl from '@mui/material/FormControl'
import { CheckboxProps } from './Checkbox.types'

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      label,
      labelPlacement = 'end',
      indeterminate = false,
      helperText,
      error = false,
      FormControlLabelProps,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const checkbox = (
      <MuiCheckbox
        ref={ref}
        indeterminate={indeterminate}
        disabled={disabled}
        required={required}
        color={error ? 'error' : props.color}
        {...props}
      />
    )

    if (!label && !helperText) {
      return checkbox
    }

    const control = label ? (
      <FormControlLabel
        control={checkbox}
        label={label}
        labelPlacement={labelPlacement}
        disabled={disabled}
        required={required}
        {...FormControlLabelProps}
      />
    ) : (
      checkbox
    )

    if (helperText) {
      return (
        <FormControl error={error} disabled={disabled} required={required}>
          {control}
          <FormHelperText>{helperText}</FormHelperText>
        </FormControl>
      )
    }

    return control
  }
)

Checkbox.displayName = 'Checkbox'