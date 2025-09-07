import { ReactNode } from 'react'

export interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  loading?: boolean
  onClick?: () => void
  className?: string
}