import { ReactNode } from 'react'
import { SxProps, Theme } from '@mui/material'

export type EmptyStateVariant = 'default' | 'error' | 'no-results' | 'no-data' | 'no-permission' | 'coming-soon'

export interface EmptyStateProps {
  // Content
  title?: string
  description?: string
  icon?: ReactNode
  image?: string
  imageAlt?: string
  
  // Variant
  variant?: EmptyStateVariant
  
  // Actions
  primaryAction?: {
    label: string
    onClick: () => void
    startIcon?: ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    startIcon?: ReactNode
  }
  customActions?: ReactNode
  
  // Layout
  orientation?: 'vertical' | 'horizontal'
  size?: 'small' | 'medium' | 'large'
  fullHeight?: boolean
  minHeight?: number | string
  
  // Styling
  sx?: SxProps<Theme>
  iconColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'inherit' | 'disabled'
  backgroundColor?: string
  bordered?: boolean
  rounded?: boolean
  elevation?: number
  
  // Additional content
  children?: ReactNode
  footer?: ReactNode
}