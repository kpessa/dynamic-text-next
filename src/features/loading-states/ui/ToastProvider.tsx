'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Slide,
  Stack,
  Button,
  Box,
  Typography
} from '@mui/material'
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Undo as UndoIcon
} from '@mui/icons-material'
import { TransitionProps } from '@mui/material/transitions'

// Types
export type ToastSeverity = 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  message: string
  title?: string
  severity?: ToastSeverity
  duration?: number
  action?: ToastAction
  undoAction?: () => void
  persistent?: boolean
  icon?: React.ReactNode
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => string
  hideToast: (id: string) => void
  clearAllToasts: () => void
}

// Context
const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

// Slide transition
function SlideTransition(props: TransitionProps & { children: React.ReactElement }) {
  return <Slide {...props} direction="up" />
}

// Individual Toast Component
interface ToastItemProps {
  toast: Toast
  onClose: (id: string) => void
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const [open, setOpen] = useState(true)

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
    setTimeout(() => onClose(toast.id), 300)
  }

  const handleAction = () => {
    if (toast.action) {
      toast.action.onClick()
    }
    handleClose()
  }

  const handleUndo = () => {
    if (toast.undoAction) {
      toast.undoAction()
    }
    handleClose()
  }

  const getIcon = () => {
    if (toast.icon) return toast.icon
    
    switch (toast.severity) {
      case 'success':
        return <SuccessIcon />
      case 'error':
        return <ErrorIcon />
      case 'warning':
        return <WarningIcon />
      case 'info':
        return <InfoIcon />
      default:
        return null
    }
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={toast.persistent ? null : (toast.duration || 5000)}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      sx={{ position: 'relative' }}
    >
      <Alert
        severity={toast.severity || 'info'}
        icon={getIcon()}
        onClose={handleClose}
        action={
          <Stack direction="row" spacing={1}>
            {toast.undoAction && (
              <Button
                size="small"
                color="inherit"
                startIcon={<UndoIcon />}
                onClick={handleUndo}
              >
                Undo
              </Button>
            )}
            {toast.action && (
              <Button
                size="small"
                color="inherit"
                onClick={handleAction}
              >
                {toast.action.label}
              </Button>
            )}
            {!toast.persistent && (
              <IconButton
                size="small"
                color="inherit"
                onClick={handleClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        }
        sx={{ minWidth: 300, maxWidth: 500 }}
      >
        {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
        {toast.message}
      </Alert>
    </Snackbar>
  )
}

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    return id
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearAllToasts }}>
      {children}
      <Box sx={{ position: 'fixed', bottom: 16, left: 16, zIndex: 1400 }}>
        <Stack spacing={1}>
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onClose={hideToast} />
          ))}
        </Stack>
      </Box>
    </ToastContext.Provider>
  )
}

// Preset toast functions
export const toast = {
  success: (message: string, options?: Partial<Toast>) => {
    const context = useContext(ToastContext)
    if (context) {
      return context.showToast({
        message,
        severity: 'success',
        ...options
      })
    }
    return ''
  },
  
  error: (message: string, options?: Partial<Toast>) => {
    const context = useContext(ToastContext)
    if (context) {
      return context.showToast({
        message,
        severity: 'error',
        duration: 7000, // Longer duration for errors
        ...options
      })
    }
    return ''
  },
  
  warning: (message: string, options?: Partial<Toast>) => {
    const context = useContext(ToastContext)
    if (context) {
      return context.showToast({
        message,
        severity: 'warning',
        ...options
      })
    }
    return ''
  },
  
  info: (message: string, options?: Partial<Toast>) => {
    const context = useContext(ToastContext)
    if (context) {
      return context.showToast({
        message,
        severity: 'info',
        ...options
      })
    }
    return ''
  },
  
  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ): Promise<T> => {
    const context = useContext(ToastContext)
    if (!context) throw new Error('Toast context not found')
    
    const loadingId = context.showToast({
      message: messages.loading,
      severity: 'info',
      persistent: true
    })
    
    try {
      const result = await promise
      context.hideToast(loadingId)
      context.showToast({
        message: typeof messages.success === 'function' 
          ? messages.success(result) 
          : messages.success,
        severity: 'success'
      })
      return result
    } catch (error) {
      context.hideToast(loadingId)
      context.showToast({
        message: typeof messages.error === 'function'
          ? messages.error(error)
          : messages.error,
        severity: 'error',
        duration: 7000
      })
      throw error
    }
  }
}

// Hook for common toast patterns
export const useToastPatterns = () => {
  const { showToast } = useToast()

  const showSuccessWithUndo = (message: string, undoAction: () => void) => {
    return showToast({
      message,
      severity: 'success',
      undoAction,
      duration: 7000
    })
  }

  const showConfirmAction = (
    message: string,
    action: { label: string; onClick: () => void }
  ) => {
    return showToast({
      message,
      severity: 'info',
      action,
      persistent: true
    })
  }

  const showProgress = (message: string) => {
    return showToast({
      message,
      severity: 'info',
      persistent: true,
      icon: <CircularProgress size={20} />
    })
  }

  const showNetworkError = (retry?: () => void) => {
    return showToast({
      message: 'Network error. Please check your connection.',
      severity: 'error',
      action: retry ? { label: 'Retry', onClick: retry } : undefined,
      duration: 10000
    })
  }

  return {
    showSuccessWithUndo,
    showConfirmAction,
    showProgress,
    showNetworkError
  }
}

// For missing import
import { CircularProgress } from '@mui/material'