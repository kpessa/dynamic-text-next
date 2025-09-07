'use client'

import React from 'react'
import {
  Container,
  Typography,
  Button,
  Box,
  Stack,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Home as HomeIcon,
  ArrowBack as BackIcon,
  Search as SearchIcon
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleGoHome = () => {
    router.push('/dashboard')
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          textAlign: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Stack spacing={4} alignItems="center">
          {/* 404 Illustration */}
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block'
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '6rem', md: '10rem' },
                fontWeight: 900,
                color: 'primary.main',
                opacity: 0.2,
                lineHeight: 1
              }}
            >
              404
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <SearchIcon
                sx={{
                  fontSize: { xs: 60, md: 80 },
                  color: 'primary.main'
                }}
              />
            </Box>
          </Box>

          {/* Error Message */}
          <Box>
            <Typography variant="h4" gutterBottom>
              Page Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
              The page you're looking for doesn't exist or has been moved. 
              Please check the URL or navigate back to the dashboard.
            </Typography>
          </Box>

          {/* Suggestions */}
          <Paper variant="outlined" sx={{ p: 2, width: '100%', maxWidth: 400 }}>
            <Typography variant="subtitle2" gutterBottom>
              You might want to try:
            </Typography>
            <Stack spacing={1} alignItems="flex-start" sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                • Check if the URL is typed correctly
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Go back to the previous page
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Start over from the dashboard
              </Typography>
            </Stack>
          </Paper>

          {/* Action Buttons */}
          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={2}
            sx={{ width: isMobile ? '100%' : 'auto' }}
          >
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={handleGoBack}
              size="large"
              fullWidth={isMobile}
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              size="large"
              fullWidth={isMobile}
            >
              Go to Dashboard
            </Button>
          </Stack>

          {/* Help Text */}
          <Typography variant="caption" color="text.secondary">
            Error Code: 404 | If you believe this is a mistake, please contact support
          </Typography>
        </Stack>
      </Paper>
    </Container>
  )
}