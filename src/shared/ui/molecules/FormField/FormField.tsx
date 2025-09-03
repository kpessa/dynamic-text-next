import React, { useState, useId } from 'react'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import FormHelperText from '@mui/material/FormHelperText'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Input } from '@/shared/ui/atoms/Input'
import { FormFieldProps } from './FormField.types'

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      helperText,
      error = false,
      errorMessage,
      required = false,
      showCharacterCount = false,
      maxLength,
      id: providedId,
      labelPlacement = 'top',
      labelWidth = 'auto',
      value,
      onChange,
      multiline,
      ...inputProps
    },
    ref
  ) => {
    const generatedId = useId()
    const id = providedId || generatedId
    const [internalValue, setInternalValue] = useState(value || '')
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      if (onChange) {
        onChange(e)
      }
    }

    const currentValue = value !== undefined ? value : internalValue
    const characterCount = typeof currentValue === 'string' ? currentValue.length : 0
    const displayHelperText = error ? errorMessage : helperText

    return (
      <FormControl
        ref={ref}
        error={error}
        required={required}
        fullWidth
        sx={{
          ...(labelPlacement === 'left' && {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 2
          })
        }}
      >
        {label && (
          <FormLabel
            htmlFor={id}
            sx={{
              ...(labelPlacement === 'left' && {
                width: labelWidth,
                minWidth: labelWidth,
                pt: multiline ? 1.5 : 1,
                textAlign: 'right'
              }),
              ...(labelPlacement === 'top' && {
                mb: 1
              })
            }}
          >
            {label}
            {required && (
              <Typography
                component="span"
                sx={{ color: 'error.main', ml: 0.5 }}
              >
                *
              </Typography>
            )}
          </FormLabel>
        )}
        
        <Box sx={{ flex: 1, width: '100%' }}>
          <Input
            id={id}
            error={error}
            value={currentValue}
            onChange={handleChange}
            multiline={multiline}
            inputProps={{ maxLength }}
            {...inputProps}
          />
          
          {(displayHelperText || showCharacterCount) && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 0.5
              }}
            >
              {displayHelperText && (
                <FormHelperText error={error}>
                  {displayHelperText}
                </FormHelperText>
              )}
              
              {showCharacterCount && maxLength && (
                <Typography
                  variant="caption"
                  color={characterCount > maxLength ? 'error' : 'text.secondary'}
                  sx={{ ml: 'auto' }}
                >
                  {characterCount}/{maxLength}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </FormControl>
    )
  }
)

FormField.displayName = 'FormField'