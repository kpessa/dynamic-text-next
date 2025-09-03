import { BadgeProps as MuiBadgeProps } from '@mui/material/Badge'

export type BadgeVariant = 'standard' | 'dot'
export type BadgeColor = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'default'
export type BadgeOverlap = 'rectangular' | 'circular'
export type BadgeAnchorOrigin = {
  vertical: 'top' | 'bottom'
  horizontal: 'left' | 'right'
}

export interface BadgeProps extends Omit<MuiBadgeProps, 'variant' | 'color'> {
  variant?: BadgeVariant
  color?: BadgeColor
  max?: number
  showZero?: boolean
  invisible?: boolean
  overlap?: BadgeOverlap
  anchorOrigin?: BadgeAnchorOrigin
  animated?: boolean
}