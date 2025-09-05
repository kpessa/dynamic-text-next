import { ReactNode } from 'react'
import { DrawerProps as MuiDrawerProps } from '@mui/material/Drawer'

export interface DrawerProps extends Omit<MuiDrawerProps, 'open' | 'onClose'> {
  open: boolean
  onClose: () => void
  anchor?: 'left' | 'right' | 'top' | 'bottom'
  variant?: 'temporary' | 'persistent' | 'permanent' | 'mini'
  width?: number | string
  title?: string
  children: ReactNode
  showCloseButton?: boolean
  actions?: ReactNode
  className?: string
  disableBackdropClick?: boolean
  disableEscapeKeyDown?: boolean
  keepMounted?: boolean
}

export interface MiniDrawerProps extends Omit<DrawerProps, 'variant'> {
  miniWidth?: number | string
  expandedWidth?: number | string
  expanded?: boolean
  onExpand?: (expanded: boolean) => void
  expandOnHover?: boolean
}