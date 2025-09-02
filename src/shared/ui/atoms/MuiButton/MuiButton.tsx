import React from 'react'
import MuiButtonBase, { ButtonProps as MuiButtonProps } from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

export interface ButtonProps extends MuiButtonProps {
  loading?: boolean
  gradient?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loading, children, disabled, startIcon, gradient, ...props }, ref) => {
    return (
      <MuiButtonBase
        ref={ref}
        disabled={disabled || loading}
        startIcon={
          loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            startIcon
          )
        }
        variant={gradient ? 'contained' : props.variant}
        {...props}
      >
        {children}
      </MuiButtonBase>
    )
  }
)

Button.displayName = 'Button'