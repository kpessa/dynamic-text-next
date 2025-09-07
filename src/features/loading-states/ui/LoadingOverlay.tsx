import React from 'react'
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Backdrop,
  Paper,
  Stack,
  Fade,
  Button,
  IconButton
} from '@mui/material'
import {
  Close as CloseIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'

// Full Page Loading Overlay
interface LoadingOverlayProps {
  open: boolean
  message?: string
  subMessage?: string
  progress?: number
  showProgress?: boolean
  cancellable?: boolean
  onCancel?: () => void
  transparent?: boolean
  blur?: boolean
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message = 'Loading...',
  subMessage,
  progress,
  showProgress = false,
  cancellable = false,
  onCancel,
  transparent = false,
  blur = true
}) => {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 1,
        bgcolor: transparent ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: blur ? 'blur(4px)' : 'none'
      }}
    >
      <Fade in={open}>
        <Paper
          elevation={8}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 280,
            maxWidth: 400,
            position: 'relative'
          }}
        >
          {cancellable && onCancel && (
            <IconButton
              onClick={onCancel}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8
              }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}

          <Stack spacing={3} alignItems="center">
            {showProgress && progress !== undefined ? (
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                  variant="determinate"
                  value={progress}
                  size={60}
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
                  <Typography variant="caption" component="div" color="text.secondary">
                    {`${Math.round(progress)}%`}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <CircularProgress size={60} />
            )}

            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                {message}
              </Typography>
              {subMessage && (
                <Typography variant="body2" color="text.secondary">
                  {subMessage}
                </Typography>
              )}
            </Box>

            {showProgress && progress !== undefined && (
              <Box sx={{ width: '100%' }}>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            )}

            {cancellable && onCancel && (
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={onCancel}
                size="small"
              >
                Cancel Operation
              </Button>
            )}
          </Stack>
        </Paper>
      </Fade>
    </Backdrop>
  )
}

// Inline Loading Component
interface InlineLoaderProps {
  loading: boolean
  size?: 'small' | 'medium' | 'large'
  message?: string
  fullWidth?: boolean
  minHeight?: number
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({
  loading,
  size = 'medium',
  message,
  fullWidth = false,
  minHeight = 100
}) => {
  if (!loading) return null

  const sizes = {
    small: 20,
    medium: 40,
    large: 60
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: fullWidth ? '100%' : 'auto',
        minHeight,
        py: 3
      }}
    >
      <CircularProgress size={sizes[size]} />
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  )
}

// Progress Bar with stages
interface StageProgressProps {
  stages: {
    id: string
    label: string
    status: 'pending' | 'active' | 'completed' | 'error'
  }[]
  currentStage?: string
}

export const StageProgress: React.FC<StageProgressProps> = ({
  stages,
  currentStage
}) => {
  const activeIndex = stages.findIndex(s => s.id === currentStage)
  const progress = ((activeIndex + 1) / stages.length) * 100

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>
      <Stack spacing={1}>
        {stages.map((stage, index) => {
          const isActive = stage.id === currentStage
          const isCompleted = stage.status === 'completed'
          const isError = stage.status === 'error'

          return (
            <Box
              key={stage.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                opacity: isActive ? 1 : isCompleted ? 0.7 : 0.5
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: isError 
                    ? 'error.main' 
                    : isCompleted 
                    ? 'success.main' 
                    : isActive 
                    ? 'primary.main' 
                    : 'grey.400',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}
              >
                {isCompleted && (
                  <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                    ✓
                  </Typography>
                )}
                {isActive && (
                  <CircularProgress size={12} sx={{ color: 'white' }} />
                )}
              </Box>
              <Typography
                variant="body2"
                fontWeight={isActive ? 'medium' : 'normal'}
                color={isError ? 'error.main' : 'text.primary'}
              >
                {stage.label}
              </Typography>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

// Button with loading state
interface LoadingButtonProps {
  loading: boolean
  children: React.ReactNode
  onClick?: () => void
  variant?: 'text' | 'outlined' | 'contained'
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  fullWidth?: boolean
  disabled?: boolean
  loadingPosition?: 'start' | 'center' | 'end'
  loadingText?: string
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  onClick,
  variant = 'contained',
  color = 'primary',
  fullWidth = false,
  disabled = false,
  loadingPosition = 'center',
  loadingText
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      onClick={onClick}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      startIcon={loading && loadingPosition === 'start' ? <CircularProgress size={20} /> : undefined}
      endIcon={loading && loadingPosition === 'end' ? <CircularProgress size={20} /> : undefined}
    >
      {loading && loadingPosition === 'center' ? (
        <Stack direction="row" alignItems="center" spacing={1}>
          <CircularProgress size={20} />
          {loadingText && <span>{loadingText}</span>}
        </Stack>
      ) : (
        children
      )}
    </Button>
  )
}

// Suspense fallback component
export const SuspenseFallback: React.FC<{ message?: string }> = ({ 
  message = 'Loading component...' 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        width: '100%'
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Stack>
    </Box>
  )
}

// Hook for managing loading states
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState)
  const [loadingMessage, setLoadingMessage] = React.useState('')
  const [progress, setProgress] = React.useState(0)

  const startLoading = (message?: string) => {
    setIsLoading(true)
    if (message) setLoadingMessage(message)
    setProgress(0)
  }

  const stopLoading = () => {
    setIsLoading(false)
    setLoadingMessage('')
    setProgress(0)
  }

  const updateProgress = (value: number, message?: string) => {
    setProgress(Math.min(100, Math.max(0, value)))
    if (message) setLoadingMessage(message)
  }

  return {
    isLoading,
    loadingMessage,
    progress,
    startLoading,
    stopLoading,
    updateProgress
  }
}