import { SkeletonProps as MuiSkeletonProps } from '@mui/material/Skeleton'

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded'
export type SkeletonAnimation = 'pulse' | 'wave' | false

export interface SkeletonProps extends Omit<MuiSkeletonProps, 'variant' | 'animation'> {
  variant?: SkeletonVariant
  animation?: SkeletonAnimation
  width?: number | string
  height?: number | string
  rows?: number
  spacing?: number
}