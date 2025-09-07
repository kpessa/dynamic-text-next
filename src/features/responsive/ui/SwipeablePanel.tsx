import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  SwipeableDrawer,
  IconButton,
  Typography,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  DragHandle as DragHandleIcon,
  Close as CloseIcon
} from '@mui/icons-material'

interface SwipeablePanelProps {
  children: React.ReactNode
  title?: string
  open: boolean
  onOpen: () => void
  onClose: () => void
  anchor?: 'left' | 'right' | 'top' | 'bottom'
  width?: string | number
  showHandle?: boolean
  persistent?: boolean
}

export const SwipeablePanel: React.FC<SwipeablePanelProps> = ({
  children,
  title,
  open,
  onOpen,
  onClose,
  anchor = 'left',
  width = 280,
  showHandle = true,
  persistent = false
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setCurrentX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const diff = currentX - startX
    const threshold = 100 // Minimum swipe distance

    if (anchor === 'left' && diff < -threshold) {
      onClose()
    } else if (anchor === 'right' && diff > threshold) {
      onClose()
    }
  }

  // Gesture-based edge swipe to open
  useEffect(() => {
    if (isMobile && !open) {
      const handleEdgeSwipe = (e: TouchEvent) => {
        const touch = e.touches[0]
        const edgeThreshold = 20 // pixels from edge

        if (anchor === 'left' && touch.clientX < edgeThreshold) {
          onOpen()
        } else if (anchor === 'right' && window.innerWidth - touch.clientX < edgeThreshold) {
          onOpen()
        }
      }

      window.addEventListener('touchstart', handleEdgeSwipe)
      return () => window.removeEventListener('touchstart', handleEdgeSwipe)
    }
  }, [isMobile, open, anchor, onOpen])

  const drawerContent = (
    <Box
      ref={panelRef}
      sx={{
        width: anchor === 'top' || anchor === 'bottom' ? 'auto' : width,
        height: anchor === 'left' || anchor === 'right' ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Handle for dragging */}
      {showHandle && isMobile && (anchor === 'bottom' || anchor === 'top') && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 1,
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' }
          }}
        >
          <DragHandleIcon color="action" />
        </Box>
      )}

      {/* Header */}
      {title && (
        <>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 56
            }}
          >
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
            {!persistent && (
              <IconButton
                edge="end"
                onClick={onClose}
                sx={{ ml: 1 }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
          <Divider />
        </>
      )}

      {/* Content */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2
        }}
      >
        {children}
      </Box>

      {/* Visual swipe indicator */}
      {isMobile && showHandle && (anchor === 'left' || anchor === 'right') && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            [anchor === 'left' ? 'right' : 'left']: 8,
            transform: 'translateY(-50%)',
            opacity: 0.3,
            transition: 'opacity 0.2s',
            '&:hover': { opacity: 0.7 }
          }}
        >
          {anchor === 'left' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </Box>
      )}
    </Box>
  )

  return (
    <SwipeableDrawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableBackdropTransition={!isMobile}
      disableDiscovery={!isMobile}
      swipeAreaWidth={isMobile ? 20 : 0}
      ModalProps={{
        keepMounted: isMobile // Better performance on mobile
      }}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          // Add safe area insets for mobile devices
          paddingTop: isMobile ? 'env(safe-area-inset-top)' : 0,
          paddingBottom: isMobile && anchor === 'bottom' ? 'env(safe-area-inset-bottom)' : 0
        }
      }}
    >
      {drawerContent}
    </SwipeableDrawer>
  )
}

// Floating action button to open panel on mobile
interface SwipeablePanelTriggerProps {
  onClick: () => void
  icon: React.ReactNode
  label?: string
}

export const SwipeablePanelTrigger: React.FC<SwipeablePanelTriggerProps> = ({
  onClick,
  icon,
  label
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (!isMobile) return null

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        bottom: 72, // Above bottom navigation
        right: 16,
        borderRadius: '28px',
        overflow: 'hidden'
      }}
    >
      <IconButton
        onClick={onClick}
        sx={{
          width: 56,
          height: 56,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': {
            bgcolor: 'primary.dark'
          }
        }}
      >
        {icon}
      </IconButton>
      {label && (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            bgcolor: 'background.paper',
            px: 1,
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          {label}
        </Typography>
      )}
    </Paper>
  )
}