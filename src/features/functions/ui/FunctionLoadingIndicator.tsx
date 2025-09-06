import React from 'react'
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material'
import { useAppSelector } from '@/app/hooks'
import { selectFunctionLoading, selectFunctionCall } from '../model/functionsSlice'

interface FunctionLoadingIndicatorProps {
  functionName: string
  showProgress?: boolean
  message?: string
  compact?: boolean
}

export const FunctionLoadingIndicator: React.FC<FunctionLoadingIndicatorProps> = ({
  functionName,
  showProgress = false,
  message,
  compact = false,
}) => {
  const isLoading = useAppSelector(state => selectFunctionLoading(state, functionName))
  const functionCall = useAppSelector(state => selectFunctionCall(state, functionName))

  if (!isLoading) {
    return null
  }

  const elapsedTime = functionCall?.startedAt 
    ? Math.floor((Date.now() - functionCall.startedAt) / 1000)
    : 0

  if (compact) {
    return <CircularProgress size={20} thickness={4} />
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={24} thickness={4} />
        <Typography variant="body2" color="text.secondary">
          {message || `Processing ${functionName}...`}
        </Typography>
      </Box>
      
      {showProgress && (
        <LinearProgress variant="indeterminate" />
      )}
      
      {elapsedTime > 2 && (
        <Typography variant="caption" color="text.secondary">
          {elapsedTime} seconds elapsed
          {functionCall?.attemptCount && functionCall.attemptCount > 1 && 
            ` (Attempt ${functionCall.attemptCount})`
          }
        </Typography>
      )}
    </Box>
  )
}