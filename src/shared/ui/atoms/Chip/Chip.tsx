import React from 'react'
import MuiChip from '@mui/material/Chip'
import { ChipProps } from './Chip.types'

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      variant = 'filled',
      color = 'default',
      size = 'medium',
      clickable = false,
      deletable = false,
      disabled = false,
      onDelete,
      avatar,
      icon,
      deleteIcon,
      label,
      onClick,
      ...props
    },
    ref
  ) => {
    // Determine if chip should be clickable
    const isClickable = clickable || !!onClick

    // Handle delete functionality
    const handleDelete = deletable || onDelete ? onDelete : undefined

    return (
      <MuiChip
        ref={ref}
        variant={variant}
        color={color}
        size={size}
        label={label}
        disabled={disabled}
        clickable={isClickable && !disabled}
        onClick={isClickable && !disabled ? onClick : undefined}
        onDelete={handleDelete}
        avatar={avatar as any}
        icon={icon as any}
        deleteIcon={deleteIcon as any}
        {...props}
      />
    )
  }
)

Chip.displayName = 'Chip'