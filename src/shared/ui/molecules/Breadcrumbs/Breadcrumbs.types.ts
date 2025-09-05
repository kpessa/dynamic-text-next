import { ReactNode } from 'react'
import { BreadcrumbsProps as MuiBreadcrumbsProps } from '@mui/material/Breadcrumbs'

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
  icon?: ReactNode
  disabled?: boolean
}

export interface BreadcrumbsProps extends Omit<MuiBreadcrumbsProps, 'children'> {
  items: BreadcrumbItem[]
  separator?: ReactNode
  maxItems?: number
  itemsBeforeCollapse?: number
  itemsAfterCollapse?: number
  showHome?: boolean
  homeIcon?: ReactNode
  homeLabel?: string
  className?: string
}