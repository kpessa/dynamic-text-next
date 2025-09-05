import { ReactNode } from 'react'
import { DialogProps } from '@mui/material/Dialog'

export interface ModalProps extends Omit<DialogProps, 'open' | 'onClose'> {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'
  variant?: 'standard' | 'confirmation' | 'form'
  actions?: ReactNode
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  loading?: boolean
  dividers?: boolean
  sticky?: {
    header?: boolean
    footer?: boolean
  }
  className?: string
}

export interface ConfirmationModalProps extends Omit<ModalProps, 'variant' | 'children'> {
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  confirmButtonColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  icon?: ReactNode
}