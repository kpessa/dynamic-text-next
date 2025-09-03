import { TypographyProps as MuiTypographyProps } from '@mui/material/Typography'

export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline'
  | 'button'

export type TypographyAlign = 'left' | 'center' | 'right' | 'justify'
export type TypographyColor = 
  | 'primary'
  | 'secondary'
  | 'textPrimary'
  | 'textSecondary'
  | 'textDisabled'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'

export interface TypographyProps extends Omit<MuiTypographyProps, 'variant' | 'align' | 'color'> {
  variant?: TypographyVariant
  align?: TypographyAlign
  color?: TypographyColor | string
  truncate?: boolean
  maxLines?: number
  gradient?: boolean
  gradientColors?: [string, string]
}