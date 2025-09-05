import React from 'react'
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
  Chip,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import HomeIcon from '@mui/icons-material/Home'
import { cn } from '@/shared/lib/utils'
import type { BreadcrumbsProps, BreadcrumbItem } from './Breadcrumbs.types'

const StyledLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.primary,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
  '&.Mui-disabled': {
    color: theme.palette.text.disabled,
    cursor: 'default',
    '&:hover': {
      textDecoration: 'none',
    },
  },
}))

const BreadcrumbContent: React.FC<{
  item: BreadcrumbItem
  isLast?: boolean
}> = ({ item, isLast = false }) => {
  const content = (
    <Box display="flex" alignItems="center" gap={0.5}>
      {item.icon && item.icon}
      <span>{item.label}</span>
    </Box>
  )

  if (isLast) {
    return (
      <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
        {content}
      </Typography>
    )
  }

  if (item.href) {
    return (
      <StyledLink
        href={item.href}
        onClick={(e: React.MouseEvent) => {
          if (item.onClick) {
            e.preventDefault()
            item.onClick()
          }
        }}
        className={item.disabled ? 'Mui-disabled' : ''}
      >
        {content}
      </StyledLink>
    )
  }

  if (item.onClick && !item.disabled) {
    return (
      <StyledLink
        component="button"
        onClick={item.onClick}
        className={item.disabled ? 'Mui-disabled' : ''}
      >
        {content}
      </StyledLink>
    )
  }

  return content
}

export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  (
    {
      items,
      separator = <NavigateNextIcon fontSize="small" />,
      maxItems,
      itemsBeforeCollapse = 1,
      itemsAfterCollapse = 1,
      showHome = false,
      homeIcon = <HomeIcon fontSize="small" />,
      homeLabel = 'Home',
      className,
      ...props
    },
    ref
  ) => {
    const allItems = showHome
      ? [{ label: homeLabel, icon: homeIcon, href: '/' }, ...items]
      : items

    return (
      <MuiBreadcrumbs
        ref={ref}
        separator={separator}
        maxItems={maxItems}
        itemsBeforeCollapse={itemsBeforeCollapse}
        itemsAfterCollapse={itemsAfterCollapse}
        className={className}
        aria-label="breadcrumb"
        {...props}
      >
        {allItems.map((item, index) => (
          <BreadcrumbContent
            key={index}
            item={item}
            isLast={index === allItems.length - 1}
          />
        ))}
      </MuiBreadcrumbs>
    )
  }
)

Breadcrumbs.displayName = 'Breadcrumbs'

export const CollapsibleBreadcrumbs: React.FC<
  BreadcrumbsProps & {
    collapseThreshold?: number
  }
> = ({ collapseThreshold = 4, ...props }) => {
  return (
    <Breadcrumbs
      {...props}
      maxItems={collapseThreshold}
      itemsBeforeCollapse={1}
      itemsAfterCollapse={2}
    />
  )
}

export const IconBreadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  ...props
}) => {
  const enhancedItems = items.map((item, index) => ({
    ...item,
    icon: item.icon || (index === 0 ? <HomeIcon fontSize="small" /> : null),
  }))

  return <Breadcrumbs items={enhancedItems} {...props} />
}

export const ChipBreadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  ...props
}) => {
  const chipItems = items.map((item, index) => ({
    ...item,
    label: (
      <Chip
        label={item.label}
        size="small"
        clickable={!!item.onClick && !item.disabled}
        onClick={item.onClick}
        disabled={item.disabled}
        color={index === items.length - 1 ? 'primary' : 'default'}
      />
    ),
  }))

  return (
    <MuiBreadcrumbs separator="›" {...props}>
      {chipItems.map((item, index) => (
        <span key={index}>{item.label}</span>
      ))}
    </MuiBreadcrumbs>
  )
}

export const CustomSeparatorBreadcrumbs: React.FC<
  BreadcrumbsProps & {
    customSeparator?: ReactNode
  }
> = ({ customSeparator = '/', ...props }) => {
  return <Breadcrumbs separator={customSeparator} {...props} />
}