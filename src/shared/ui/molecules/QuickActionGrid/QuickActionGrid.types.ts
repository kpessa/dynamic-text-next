import { ReactNode } from 'react'

export interface QuickAction {
  id: string
  label: string
  icon: ReactNode
  path?: string
  onClick?: () => void
  variant?: 'contained' | 'outlined' | 'text'
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  disabled?: boolean
}

export interface QuickActionGridProps {
  actions: QuickAction[]
  columns?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
  }
  spacing?: number
  className?: string
}