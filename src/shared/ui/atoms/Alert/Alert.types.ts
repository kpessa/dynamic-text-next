import { AlertProps as MuiAlertProps } from '@mui/material/Alert'
import { ReactNode } from 'react'

export type AlertSeverity = 'success' | 'info' | 'warning' | 'error'
export type AlertVariant = 'standard' | 'filled' | 'outlined'

export interface AlertProps extends Omit<MuiAlertProps, 'severity' | 'variant'> {
  severity?: AlertSeverity
  variant?: AlertVariant
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
  actionButton?: {
    label: string
    onClick: () => void
  }
  icon?: ReactNode | false
  autoHideDuration?: number
}