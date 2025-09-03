import React, { useState, useRef, useEffect } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import { Visibility, VisibilityOff, Add, Remove } from '@mui/icons-material'
import { InputProps } from './Input.types'

export const Input = React.forwardRef<HTMLDivElement, InputProps>(
  (
    {
      variant = 'text',
      showPasswordToggle = true,
      incrementControls = false,
      autoResize = false,
      maxLength,
      showCharacterCount = false,
      validationState = 'default',
      min,
      max,
      step = 1,
      value,
      onChange,
      helperText,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [internalValue, setInternalValue] = useState(value || '')
    const textAreaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
      setInternalValue(value || '')
    }, [value])

    useEffect(() => {
      if (autoResize && variant === 'textarea' && textAreaRef.current) {
        textAreaRef.current.style.height = 'auto'
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
      }
    }, [internalValue, autoResize, variant])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value

      if (maxLength && newValue.length > maxLength) {
        return
      }

      setInternalValue(newValue)
      if (onChange) {
        onChange(event)
      }
    }

    const handleNumberChange = (delta: number) => {
      const currentValue = typeof internalValue === 'number' ? internalValue : parseFloat(internalValue as string) || 0
      let newValue = currentValue + delta

      if (min !== undefined && newValue < min) newValue = min
      if (max !== undefined && newValue > max) newValue = max

      const syntheticEvent = {
        target: { value: newValue.toString() }
      } as React.ChangeEvent<HTMLInputElement>

      setInternalValue(newValue)
      if (onChange) {
        onChange(syntheticEvent)
      }
    }

    const getInputType = () => {
      switch (variant) {
        case 'password':
          return showPassword ? 'text' : 'password'
        case 'number':
          return 'number'
        case 'email':
          return 'email'
        case 'tel':
          return 'tel'
        case 'url':
          return 'url'
        case 'search':
          return 'search'
        case 'textarea':
          return undefined
        default:
          return 'text'
      }
    }

    const getValidationColor = () => {
      switch (validationState) {
        case 'success':
          return 'success'
        case 'warning':
          return 'warning'
        case 'error':
          return 'error'
        default:
          return undefined
      }
    }

    const getHelperText = () => {
      if (showCharacterCount && maxLength) {
        const currentLength = String(internalValue).length
        const characterCountText = `${currentLength}/${maxLength}`
        return helperText ? `${helperText} (${characterCountText})` : characterCountText
      }
      return helperText
    }

    const getEndAdornment = () => {
      const adornments = []

      if (variant === 'password' && showPasswordToggle) {
        adornments.push(
          <InputAdornment position="end" key="password-toggle">
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
              size="small"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        )
      }

      if (variant === 'number' && incrementControls) {
        adornments.push(
          <InputAdornment position="end" key="number-controls">
            <IconButton
              aria-label="decrease value"
              onClick={() => handleNumberChange(-step)}
              size="small"
              disabled={min !== undefined && Number(internalValue) <= min}
            >
              <Remove />
            </IconButton>
            <IconButton
              aria-label="increase value"
              onClick={() => handleNumberChange(step)}
              size="small"
              disabled={max !== undefined && Number(internalValue) >= max}
            >
              <Add />
            </IconButton>
          </InputAdornment>
        )
      }

      return adornments.length > 0 ? adornments : undefined
    }

    return (
      <TextField
        ref={ref}
        {...props}
        type={getInputType()}
        multiline={variant === 'textarea'}
        rows={variant === 'textarea' ? 4 : undefined}
        value={internalValue}
        onChange={handleChange}
        color={getValidationColor()}
        helperText={getHelperText()}
        inputProps={{
          min,
          max,
          step: variant === 'number' ? step : undefined,
          maxLength,
          'aria-label': props['aria-label'],
          ...props.inputProps
        }}
        InputProps={{
          endAdornment: getEndAdornment(),
          inputRef: variant === 'textarea' && autoResize ? textAreaRef : undefined,
          ...props.InputProps
        }}
      />
    )
  }
)

Input.displayName = 'Input'