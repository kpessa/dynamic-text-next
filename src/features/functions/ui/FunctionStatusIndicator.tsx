import React from 'react'
import { 
  Chip, 
  CircularProgress, 
  Tooltip,
  Box,
  Typography,
} from '@mui/material'
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  AccessTime as PendingIcon,
} from '@mui/icons-material'
import { useAppSelector } from '@/app/hooks'
import { selectFunctionCall } from '../model/functionsSlice'

interface FunctionStatusIndicatorProps {
  functionName: string
  showDetails?: boolean
  size?: 'small' | 'medium'
}

export const FunctionStatusIndicator: React.FC<FunctionStatusIndicatorProps> = ({
  functionName,
  showDetails = false,
  size = 'medium',
}) => {
  const functionCall = useAppSelector(state => selectFunctionCall(state, functionName))

  if (!functionCall) {
    return null
  }

  const { status, error, startedAt, completedAt, attemptCount } = functionCall

  const duration = startedAt && completedAt 
    ? ((completedAt - startedAt) / 1000).toFixed(1) 
    : null

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <CircularProgress size={size === 'small' ? 16 : 20} thickness={4} />
      case 'succeeded':
        return <SuccessIcon fontSize={size} color="success" />
      case 'failed':
        return <ErrorIcon fontSize={size} color="error" />
      default:
        return <PendingIcon fontSize={size} color="action" />
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'loading':
        return attemptCount && attemptCount > 1 ? `Retrying... (${attemptCount})` : 'Processing...'
      case 'succeeded':
        return duration ? `Success (${duration}s)` : 'Success'
      case 'failed':
        return 'Failed'
      default:
        return 'Idle'
    }
  }

  const getStatusColor = (): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'loading':
        return 'primary'
      case 'succeeded':
        return 'success'
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }

  const statusChip = (
    <Chip
      icon={getStatusIcon()}
      label={getStatusLabel()}
      color={getStatusColor()}
      size={size}
      variant={status === 'loading' ? 'filled' : 'outlined'}
    />
  )

  if (!showDetails) {
    return error ? (
      <Tooltip title={error}>
        {statusChip}
      </Tooltip>
    ) : (
      statusChip
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {statusChip}
      
      {showDetails && (
        <Box sx={{ pl: 2 }}>
          {duration && (
            <Typography variant="caption" color="text.secondary" display="block">
              Duration: {duration} seconds
            </Typography>
          )}
          
          {attemptCount && attemptCount > 1 && (
            <Typography variant="caption" color="text.secondary" display="block">
              Attempts: {attemptCount}
            </Typography>
          )}
          
          {error && (
            <Typography variant="caption" color="error" display="block">
              Error: {error}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  )
}