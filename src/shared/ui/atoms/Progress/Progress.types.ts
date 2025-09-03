import { CircularProgressProps as MuiCircularProgressProps } from '@mui/material/CircularProgress'
import { LinearProgressProps as MuiLinearProgressProps } from '@mui/material/LinearProgress'

export type ProgressVariant = 'circular' | 'linear'
export type ProgressColor = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit'

export interface BaseProgressProps {
  variant?: ProgressVariant
  color?: ProgressColor
  value?: number
  determinate?: boolean
  size?: number | string
  thickness?: number
  label?: string
  showLabel?: boolean
}

export interface CircularProgressProps extends Omit<MuiCircularProgressProps, 'color' | 'variant'>, BaseProgressProps {
  variant?: 'circular'
}

export interface LinearProgressProps extends Omit<MuiLinearProgressProps, 'color' | 'variant'>, BaseProgressProps {
  variant?: 'linear'
  buffer?: number
  height?: number
}

export type ProgressProps = CircularProgressProps | LinearProgressProps