import React, { useState, useEffect } from 'react'
import MuiAlert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import CloseIcon from '@mui/icons-material/Close'
import { AlertProps } from './Alert.types'

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      severity = 'info',
      variant = 'standard',
      title,
      dismissible = false,
      onDismiss,
      actionButton,
      icon,
      autoHideDuration,
      children,
      onClose,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useState(true)

    useEffect(() => {
      if (autoHideDuration) {
        const timer = setTimeout(() => {
          handleClose()
        }, autoHideDuration)

        return () => clearTimeout(timer)
      }
    }, [autoHideDuration])

    const handleClose = () => {
      setOpen(false)
      if (onDismiss) {
        onDismiss()
      }
      if (onClose) {
        onClose(new Event('close'), 'timeout')
      }
    }

    const handleActionClick = () => {
      if (actionButton?.onClick) {
        actionButton.onClick()
      }
    }

    const action = (
      <>
        {actionButton && (
          <Button
            color="inherit"
            size="small"
            onClick={handleActionClick}
            sx={{ mr: dismissible ? 0 : 1 }}
          >
            {actionButton.label}
          </Button>
        )}
        {dismissible && (
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        )}
      </>
    )

    return (
      <Collapse in={open}>
        <MuiAlert
          ref={ref}
          severity={severity}
          variant={variant}
          icon={icon}
          action={dismissible || actionButton ? action : undefined}
          {...props}
        >
          {title && <AlertTitle>{title}</AlertTitle>}
          {children}
        </MuiAlert>
      </Collapse>
    )
  }
)

Alert.displayName = 'Alert'