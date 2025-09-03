import React from 'react'
import MuiSkeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { SkeletonProps } from './Skeleton.types'

export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(
  (
    {
      variant = 'text',
      animation = 'pulse',
      width,
      height,
      rows = 1,
      spacing = 1,
      ...props
    },
    ref
  ) => {
    // Convert variant to MUI variant
    const muiVariant = variant === 'rounded' ? 'rectangular' : variant

    // If rows > 1, create multiple skeletons
    if (rows > 1 && variant === 'text') {
      return (
        <Stack spacing={spacing}>
          {Array.from({ length: rows }, (_, index) => (
            <MuiSkeleton
              key={index}
              ref={index === 0 ? ref : undefined}
              variant={muiVariant}
              animation={animation}
              width={width}
              height={height}
              sx={{
                ...(variant === 'rounded' && { borderRadius: 2 }),
                ...props.sx
              }}
              {...props}
            />
          ))}
        </Stack>
      )
    }

    return (
      <MuiSkeleton
        ref={ref}
        variant={muiVariant}
        animation={animation}
        width={width}
        height={height}
        sx={{
          ...(variant === 'rounded' && { borderRadius: 2 }),
          ...props.sx
        }}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'