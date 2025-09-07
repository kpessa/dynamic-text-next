'use client'

import React from 'react'
import {
  Backdrop,
  CircularProgress,
  LinearProgress,
  Typography,
  Box,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import type { LoadingOverlayProps } from './LoadingOverlay.types'

const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
}))

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
}))

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message,
  variant = 'circular',
  size = 40,
  thickness = 3.6,
  disableBackdropClick = true,
  zIndex,
  className,
}) => {
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (disableBackdropClick) {
      event.stopPropagation()
    }
  }

  return (
    <StyledBackdrop
      open={open}
      onClick={handleBackdropClick}
      className={className}
      sx={{ zIndex: (theme) => zIndex || theme.zIndex.drawer + 2 }}
    >
      <LoadingContainer>
        {variant === 'circular' ? (
          <CircularProgress
            color="inherit"
            size={size}
            thickness={thickness}
          />
        ) : (
          <Box sx={{ width: '200px' }}>
            <LinearProgress color="inherit" />
          </Box>
        )}
        {message && (
          <Typography variant="body1" sx={{ mt: 1 }}>
            {message}
          </Typography>
        )}
      </LoadingContainer>
    </StyledBackdrop>
  )
}