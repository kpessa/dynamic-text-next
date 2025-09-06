import React from 'react'
import { Alert, AlertTitle, Box, Button, Collapse } from '@mui/material'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { selectFunctionError, clearFunctionCall } from '../model/functionsSlice'

interface FunctionErrorDisplayProps {
  functionName: string
  onRetry?: () => void
  dismissible?: boolean
  severity?: 'error' | 'warning'
}

export const FunctionErrorDisplay: React.FC<FunctionErrorDisplayProps> = ({
  functionName,
  onRetry,
  dismissible = true,
  severity = 'error',
}) => {
  const dispatch = useAppDispatch()
  const error = useAppSelector(state => selectFunctionError(state, functionName))
  const [open, setOpen] = React.useState(true)

  if (!error || !open) {
    return null
  }

  const handleDismiss = () => {
    setOpen(false)
    if (dismissible) {
      dispatch(clearFunctionCall(functionName))
    }
  }

  return (
    <Collapse in={open}>
      <Alert 
        severity={severity}
        onClose={dismissible ? handleDismiss : undefined}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onRetry && (
              <Button size="small" color="inherit" onClick={onRetry}>
                Retry
              </Button>
            )}
            {dismissible && (
              <Button size="small" color="inherit" onClick={handleDismiss}>
                Dismiss
              </Button>
            )}
          </Box>
        }
      >
        <AlertTitle>Function Error</AlertTitle>
        {error}
      </Alert>
    </Collapse>
  )
}