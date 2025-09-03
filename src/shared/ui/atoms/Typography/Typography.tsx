import React from 'react'
import MuiTypography from '@mui/material/Typography'
import { TypographyProps } from './Typography.types'

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      variant = 'body1',
      align,
      color,
      truncate = false,
      maxLines,
      gradient = false,
      gradientColors = ['#667eea', '#764ba2'],
      sx,
      style,
      ...props
    },
    ref
  ) => {
    const getTruncateStyles = () => {
      if (truncate && !maxLines) {
        return {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }

      if (maxLines) {
        return {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical'
        }
      }

      return {}
    }

    const getGradientStyles = () => {
      if (!gradient) return {}

      return {
        background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }
    }

    const combinedStyles = {
      ...getTruncateStyles(),
      ...getGradientStyles(),
      ...style
    }

    const combinedSx = {
      ...sx,
      ...(Object.keys(combinedStyles).length > 0 ? combinedStyles : {})
    }

    return (
      <MuiTypography
        ref={ref}
        variant={variant}
        align={align}
        color={gradient ? undefined : color}
        sx={combinedSx}
        {...props}
      />
    )
  }
)

Typography.displayName = 'Typography'