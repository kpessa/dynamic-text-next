import React from 'react'
import MuiRadio from '@mui/material/Radio'
import MuiRadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import FormHelperText from '@mui/material/FormHelperText'
import { RadioProps, RadioGroupProps } from './Radio.types'

export const Radio = React.forwardRef<HTMLButtonElement, RadioProps>(
  (
    {
      label,
      labelPlacement = 'end',
      helperText,
      error = false,
      FormControlLabelProps,
      disabled,
      required,
      color = error ? 'error' : 'primary',
      ...props
    },
    ref
  ) => {
    const radio = (
      <MuiRadio
        ref={ref}
        disabled={disabled}
        required={required}
        color={color}
        {...props}
      />
    )

    if (!label && !helperText) {
      return radio
    }

    const control = label ? (
      <FormControlLabel
        control={radio}
        label={label}
        labelPlacement={labelPlacement}
        disabled={disabled}
        required={required}
        {...FormControlLabelProps}
      />
    ) : (
      radio
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

Radio.displayName = 'Radio'

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      options,
      label,
      helperText,
      error = false,
      required = false,
      disabled = false,
      orientation = 'vertical',
      labelPlacement = 'end',
      ...props
    },
    ref
  ) => {
    return (
      <FormControl
        ref={ref}
        error={error}
        disabled={disabled}
        required={required}
        component="fieldset"
      >
        {label && (
          <FormLabel component="legend">{label}</FormLabel>
        )}
        <MuiRadioGroup
          row={orientation === 'horizontal'}
          {...props}
        >
          {options.map((option) => (
            <React.Fragment key={option.value}>
              <FormControlLabel
                value={option.value}
                control={<MuiRadio />}
                label={option.label}
                disabled={option.disabled || disabled}
                labelPlacement={labelPlacement}
              />
              {option.helperText && (
                <FormHelperText style={{ marginLeft: labelPlacement === 'end' ? '32px' : '0' }}>
                  {option.helperText}
                </FormHelperText>
              )}
            </React.Fragment>
          ))}
        </MuiRadioGroup>
        {helperText && (
          <FormHelperText>{helperText}</FormHelperText>
        )}
      </FormControl>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'