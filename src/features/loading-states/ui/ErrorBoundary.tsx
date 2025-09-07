'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  Collapse,
  IconButton,
  useTheme
} from '@mui/material'
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugReportIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
  isolate?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorCount: number
  showDetails: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null
  private previousResetKeys: Array<string | number> = []

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      showDetails: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report to error tracking service
    this.reportError(error, errorInfo)
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state
    
    // Reset on prop changes if enabled
    if (hasError && prevProps.children !== this.props.children && resetOnPropsChange) {
      this.resetErrorBoundary()
    }
    
    // Reset on resetKeys change
    if (
      hasError &&
      resetKeys &&
      this.previousResetKeys.length > 0 &&
      !this.arraysEqual(resetKeys, this.previousResetKeys)
    ) {
      this.resetErrorBoundary()
    }
    
    this.previousResetKeys = resetKeys || []
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  arraysEqual = (a: Array<string | number>, b: Array<string | number>) => {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In production, this would send to an error tracking service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    console.log('Error Report:', errorReport)
    // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    })
  }

  handleCopyError = () => {
    const { error, errorInfo } = this.state
    if (error && errorInfo) {
      const errorText = `
Error: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo.componentStack}
      `.trim()
      
      navigator.clipboard.writeText(errorText)
      // TODO: Show toast notification
    }
  }

  render() {
    const { hasError, error, errorInfo, errorCount, showDetails } = this.state
    const { children, fallback, isolate, showDetails: showDetailsProp } = this.props

    if (hasError && error) {
      // Custom fallback if provided
      if (fallback) {
        return <>{fallback}</>
      }

      // Default error UI
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          errorCount={errorCount}
          showDetails={showDetails || showDetailsProp || false}
          onToggleDetails={() => this.setState({ showDetails: !showDetails })}
          onReset={this.resetErrorBoundary}
          onCopyError={this.handleCopyError}
          isolate={isolate}
        />
      )
    }

    return children
  }
}

// Error Fallback Component
interface ErrorFallbackProps {
  error: Error
  errorInfo: ErrorInfo | null
  errorCount: number
  showDetails: boolean
  onToggleDetails: () => void
  onReset: () => void
  onCopyError: () => void
  isolate?: boolean
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  errorCount,
  showDetails,
  onToggleDetails,
  onReset,
  onCopyError,
  isolate
}) => {
  const isProduction = process.env.NODE_ENV === 'production'

  if (isolate) {
    // Minimal error UI for isolated components
    return (
      <Alert
        severity="error"
        action={
          <IconButton size="small" onClick={onReset}>
            <RefreshIcon />
          </IconButton>
        }
      >
        Something went wrong. Please try again.
      </Alert>
    )
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          {/* Error Icon */}
          <ErrorIcon sx={{ fontSize: 80, color: 'error.main' }} />

          {/* Error Title */}
          <Typography variant="h4" gutterBottom>
            Oops! Something went wrong
          </Typography>

          {/* Error Message */}
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
            {isProduction
              ? "We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists."
              : error.message}
          </Typography>

          {/* Error Count Warning */}
          {errorCount > 2 && (
            <Alert severity="warning" sx={{ width: '100%' }}>
              This error has occurred {errorCount} times. You may want to refresh the page or contact support.
            </Alert>
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onReset}
              size="large"
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              href="/dashboard"
              size="large"
            >
              Go to Dashboard
            </Button>
          </Stack>

          {/* Error Details (Development Only) */}
          {!isProduction && (
            <Box sx={{ width: '100%', mt: 3 }}>
              <Button
                startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={onToggleDetails}
                sx={{ mb: 2 }}
              >
                {showDetails ? 'Hide' : 'Show'} Error Details
              </Button>

              <Collapse in={showDetails}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: 'grey.100',
                    maxHeight: 400,
                    overflow: 'auto'
                  }}
                >
                  <Stack spacing={2}>
                    {/* Error Stack */}
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" gutterBottom>
                          Error Stack:
                        </Typography>
                        <IconButton size="small" onClick={onCopyError}>
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}
                      >
                        {error.stack}
                      </Typography>
                    </Box>

                    {/* Component Stack */}
                    {errorInfo && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Component Stack:
                        </Typography>
                        <Typography
                          variant="body2"
                          component="pre"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}
                        >
                          {errorInfo.componentStack}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Collapse>
            </Box>
          )}

          {/* Report Bug Link */}
          <Button
            startIcon={<BugReportIcon />}
            href="https://github.com/yourusername/yourrepo/issues"
            target="_blank"
            size="small"
            color="inherit"
          >
            Report this issue
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}

// Hook for error handling
export const useErrorHandler = () => {
  return (error: Error) => {
    console.error('Error caught by useErrorHandler:', error)
    // You can add custom error handling logic here
    throw error // Re-throw to be caught by ErrorBoundary
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}