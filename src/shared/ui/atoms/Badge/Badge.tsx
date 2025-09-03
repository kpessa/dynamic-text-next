import React from 'react'
import MuiBadge from '@mui/material/Badge'
import { styled, keyframes } from '@mui/material/styles'
import { BadgeProps } from './Badge.types'

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

const AnimatedBadge = styled(MuiBadge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    animation: `${pulse} 1.5s ease-in-out infinite`
  }
}))

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'standard',
      color = 'primary',
      max = 99,
      showZero = false,
      invisible = false,
      overlap = 'rectangular',
      anchorOrigin = {
        vertical: 'top',
        horizontal: 'right'
      },
      animated = false,
      badgeContent,
      children,
      ...props
    },
    ref
  ) => {
    const BadgeComponent = animated ? AnimatedBadge : MuiBadge

    return (
      <BadgeComponent
        ref={ref}
        variant={variant}
        color={color}
        max={max}
        showZero={showZero}
        invisible={invisible}
        overlap={overlap}
        anchorOrigin={anchorOrigin}
        badgeContent={badgeContent}
        {...props}
      >
        {children}
      </BadgeComponent>
    )
  }
)

Badge.displayName = 'Badge'