import { ChipProps as MuiChipProps } from '@mui/material/Chip'
import { ReactNode } from 'react'

export type ChipVariant = 'filled' | 'outlined'
export type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
export type ChipSize = 'small' | 'medium'

export interface ChipProps extends Omit<MuiChipProps, 'variant' | 'color' | 'size'> {
  variant?: ChipVariant
  color?: ChipColor
  size?: ChipSize
  clickable?: boolean
  deletable?: boolean
  onDelete?: () => void
  avatar?: ReactNode
  icon?: ReactNode
  deleteIcon?: ReactNode
}