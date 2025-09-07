export interface LoadingOverlayProps {
  open: boolean
  message?: string
  variant?: 'circular' | 'linear'
  size?: number | string
  thickness?: number
  disableBackdropClick?: boolean
  zIndex?: number
  className?: string
}