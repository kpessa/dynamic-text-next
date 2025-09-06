import React from 'react'
import MuiCircularProgress from '@mui/material/CircularProgress'
import MuiLinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ProgressProps, CircularProgressProps, LinearProgressProps } from './Progress.types'

export const CircularProgress = React.forwardRef<HTMLSpanElement, CircularProgressProps>(
  (
    {
      color = 'primary',
      value,
      determinate = false,
      size = 40,
      thickness = 3.6,
      label,
      showLabel = false,
      ...props
    },
    ref
  ) => {
    const progressValue = determinate && value !== undefined ? value : undefined
    const variant: 'determinate' | 'indeterminate' = determinate ? 'determinate' : 'indeterminate'

    if (showLabel && determinate) {
      return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <MuiCircularProgress
            ref={ref}
            variant={variant}
            color={color}
            value={progressValue}
            size={size}
            thickness={thickness}
            {...props}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
            >
              {label || `${Math.round(progressValue || 0)}%`}
            </Typography>
          </Box>
        </Box>
      )
    }

    return (
      <MuiCircularProgress
        ref={ref}
        variant={variant}
        color={color}
        value={progressValue}
        size={size}
        thickness={thickness}
        {...props}
      />
    )
  }
)

CircularProgress.displayName = 'CircularProgress'

export const LinearProgress = React.forwardRef<HTMLSpanElement, LinearProgressProps>(
  (
    {
      color = 'primary',
      value,
      determinate = false,
      buffer,
      height = 4,
      label,
      showLabel = false,
      ...props
    },
    ref
  ) => {
    const progressValue = determinate && value !== undefined ? value : undefined
    const variant = buffer !== undefined ? 'buffer' : (determinate ? 'determinate' : 'indeterminate')

    if (showLabel && determinate) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <MuiLinearProgress
              ref={ref}
              variant={variant as any}
              color={color}
              value={progressValue}
              valueBuffer={buffer}
              sx={{ height }}
              {...props}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
              {label || `${Math.round(progressValue || 0)}%`}
            </Typography>
          </Box>
        </Box>
      )
    }

    return (
      <MuiLinearProgress
        ref={ref}
        variant={variant as any}
        color={color}
        value={progressValue}
        valueBuffer={buffer}
        sx={{ height }}
        {...props}
      />
    )
  }
)

LinearProgress.displayName = 'LinearProgress'

export const Progress = React.forwardRef<HTMLSpanElement, ProgressProps>(
  ({ variant = 'circular', ...props }, ref) => {
    if (variant === 'linear') {
      return <LinearProgress ref={ref} {...(props as LinearProgressProps)} />
    }
    return <CircularProgress ref={ref} {...(props as CircularProgressProps)} />
  }
)

Progress.displayName = 'Progress'