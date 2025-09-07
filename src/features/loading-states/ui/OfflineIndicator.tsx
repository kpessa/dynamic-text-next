import React, { useState, useEffect } from 'react'
import {
  Alert,
  Snackbar,
  Box,
  Typography,
  IconButton,
  Slide,
  Paper,
  Stack,
  Button,
  Collapse,
  LinearProgress
} from '@mui/material'
import {
  WifiOff as OfflineIcon,
  Wifi as OnlineIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  CloudOff as CloudOffIcon,
  Sync as SyncIcon,
  SyncDisabled as SyncDisabledIcon
} from '@mui/icons-material'
import { TransitionProps } from '@mui/material/transitions'

function SlideTransition(props: TransitionProps & { children: React.ReactElement }) {
  return <Slide {...props} direction="up" />
}

// Main Offline Indicator Component
export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [showNotification, setShowNotification] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      
      if (!online && isOnline) {
        // Just went offline
        setWasOffline(true)
        setShowNotification(true)
        setRetryCount(0)
      } else if (online && !isOnline && wasOffline) {
        // Just came back online
        setShowNotification(true)
        // Auto-hide success notification after 3 seconds
        setTimeout(() => {
          setShowNotification(false)
          setWasOffline(false)
        }, 3000)
      }
      
      setIsOnline(online)
    }

    // Check initial status
    updateOnlineStatus()

    // Add event listeners
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Periodic check (every 10 seconds)
    const interval = setInterval(updateOnlineStatus, 10000)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      clearInterval(interval)
    }
  }, [isOnline, wasOffline])

  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    // Simulate retry attempt
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Check connection
    if (navigator.onLine) {
      setIsOnline(true)
      setWasOffline(false)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    }
    
    setIsRetrying(false)
  }

  const handleClose = () => {
    setShowNotification(false)
  }

  if (isOnline && !wasOffline) {
    return null
  }

  return (
    <Snackbar
      open={showNotification}
      autoHideDuration={isOnline ? 3000 : null}
      onClose={handleClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity={isOnline ? 'success' : 'error'}
        icon={isOnline ? <OnlineIcon /> : <OfflineIcon />}
        action={
          !isOnline && (
            <Stack direction="row" spacing={1}>
              {retryCount > 0 && (
                <Typography variant="caption" sx={{ alignSelf: 'center' }}>
                  Retry {retryCount}
                </Typography>
              )}
              <IconButton
                size="small"
                onClick={handleRetry}
                disabled={isRetrying}
                color="inherit"
              >
                <RefreshIcon />
              </IconButton>
              <IconButton size="small" onClick={handleClose} color="inherit">
                <CloseIcon />
              </IconButton>
            </Stack>
          )
        }
        sx={{ minWidth: 300 }}
      >
        {isOnline ? (
          'Connection restored! Your data will sync automatically.'
        ) : (
          <Box>
            <Typography variant="body2" fontWeight="bold">
              You're offline
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              Some features may be limited. Data will sync when reconnected.
            </Typography>
            {isRetrying && <LinearProgress sx={{ mt: 1 }} />}
          </Box>
        )}
      </Alert>
    </Snackbar>
  )
}

// Persistent Offline Banner
interface OfflineBannerProps {
  onRetry?: () => void
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onRetry }) => {
  const [isOnline, setIsOnline] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [pendingChanges, setPendingChanges] = useState(0)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    updateOnlineStatus()
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Simulate pending changes (in real app, get from state/storage)
    if (!navigator.onLine) {
      setPendingChanges(Math.floor(Math.random() * 5) + 1)
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1200,
        borderRadius: 0,
        bgcolor: 'error.main',
        color: 'error.contrastText'
      }}
    >
      <Box sx={{ px: 2, py: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{ cursor: 'pointer' }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <CloudOffIcon />
            <Typography variant="body2" fontWeight="medium">
              Working Offline
            </Typography>
            {pendingChanges > 0 && (
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                ({pendingChanges} pending {pendingChanges === 1 ? 'change' : 'changes'})
              </Typography>
            )}
          </Stack>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation()
              onRetry?.()
            }}
            sx={{
              borderColor: 'error.contrastText',
              color: 'error.contrastText',
              '&:hover': {
                borderColor: 'error.contrastText',
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Retry
          </Button>
        </Stack>

        <Collapse in={isExpanded}>
          <Box sx={{ mt: 1, pb: 1 }}>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              You can continue working offline. Your changes will be saved locally and synchronized when connection is restored.
            </Typography>
          </Box>
        </Collapse>
      </Box>
    </Paper>
  )
}

// Hook for offline detection
export const useOfflineDetection = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [lastOnline, setLastOnline] = useState<Date | null>(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setLastOnline(new Date())
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    // Set initial state
    setIsOnline(navigator.onLine)
    if (navigator.onLine) {
      setLastOnline(new Date())
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, lastOnline }
}

// Offline Status Chip
export const OfflineStatusChip: React.FC = () => {
  const { isOnline } = useOfflineDetection()

  if (isOnline) {
    return null
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderRadius: 1,
        bgcolor: 'error.main',
        color: 'error.contrastText',
        fontSize: '0.75rem'
      }}
    >
      <SyncDisabledIcon sx={{ fontSize: 16 }} />
      <Typography variant="caption">Offline</Typography>
    </Box>
  )
}

// Sync Status Indicator
interface SyncStatusProps {
  status: 'synced' | 'syncing' | 'pending' | 'error'
  pendingCount?: number
  onRetry?: () => void
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  status,
  pendingCount = 0,
  onRetry
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: <SyncIcon />,
          color: 'success.main',
          text: 'All changes saved'
        }
      case 'syncing':
        return {
          icon: <SyncIcon sx={{ animation: 'spin 1s linear infinite' }} />,
          color: 'info.main',
          text: 'Syncing...'
        }
      case 'pending':
        return {
          icon: <SyncDisabledIcon />,
          color: 'warning.main',
          text: `${pendingCount} pending ${pendingCount === 1 ? 'change' : 'changes'}`
        }
      case 'error':
        return {
          icon: <SyncDisabledIcon />,
          color: 'error.main',
          text: 'Sync failed'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{ color: config.color, display: 'flex', alignItems: 'center' }}>
        {config.icon}
      </Box>
      <Typography variant="caption" color="text.secondary">
        {config.text}
      </Typography>
      {status === 'error' && onRetry && (
        <IconButton size="small" onClick={onRetry}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      )}
    </Stack>
  )
}