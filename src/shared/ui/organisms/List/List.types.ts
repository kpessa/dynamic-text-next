import { ReactNode, MouseEvent } from 'react'
import { SxProps, Theme, TypographyProps } from '@mui/material'

export interface ListItemData<T = any> {
  id: string | number
  primary: ReactNode
  secondary?: ReactNode
  avatar?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  disabled?: boolean
  selected?: boolean
  divider?: boolean
  primaryTypographyProps?: TypographyProps
  secondaryTypographyProps?: TypographyProps
  data?: T
}

export interface ListProps<T = any> {
  // Data
  items: ListItemData<T>[]
  loading?: boolean
  error?: string | null
  
  // Display Options
  variant?: 'simple' | 'interactive' | 'nested'
  dense?: boolean
  disablePadding?: boolean
  divided?: boolean
  
  // Selection
  selectable?: boolean
  multiSelect?: boolean
  selectedItems?: (string | number)[]
  onSelectionChange?: (selectedIds: (string | number)[]) => void
  
  // Interaction
  onItemClick?: (item: ListItemData<T>, event: MouseEvent) => void
  onItemDoubleClick?: (item: ListItemData<T>, event: MouseEvent) => void
  
  // Nested Lists
  nestedItems?: Map<string | number, ListItemData<T>[]>
  defaultExpanded?: (string | number)[]
  onExpandChange?: (expandedIds: (string | number)[]) => void
  
  // Empty State
  emptyMessage?: string
  emptyIcon?: ReactNode
  emptyAction?: ReactNode
  
  // Styling
  sx?: SxProps<Theme>
  itemSx?: SxProps<Theme>
  subheader?: ReactNode
  
  // Search (only for interactive variant)
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  
  // Sorting (only for interactive variant)
  sortable?: boolean
  sortBy?: 'primary' | 'secondary'
  sortOrder?: 'asc' | 'desc'
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  
  // Grouping
  grouped?: boolean
  groupBy?: (item: ListItemData<T>) => string
  groupHeaders?: Map<string, ReactNode>
  
  // Infinite Scroll
  hasMore?: boolean
  onLoadMore?: () => void
  loadingMore?: boolean
  
  // Drag and Drop (only for interactive variant)
  draggable?: boolean
  onReorder?: (items: ListItemData<T>[]) => void
  
  // Custom Rendering
  renderItem?: (item: ListItemData<T>, index: number) => ReactNode
  renderEmpty?: ReactNode
  renderLoading?: ReactNode
}

// Type guards
export function isListItemData<T>(item: any): item is ListItemData<T> {
  return item && typeof item === 'object' && 'id' in item && 'primary' in item
}

// Common presets for ease of use
export interface SimpleListProps<T = any> extends Omit<ListProps<T>, 
  'variant' | 'searchable' | 'sortable' | 'draggable' | 'grouped'
> {
  variant?: 'simple'
}

export interface InteractiveListProps<T = any> extends ListProps<T> {
  variant: 'interactive'
  searchable?: boolean
  sortable?: boolean
  draggable?: boolean
}

export interface NestedListProps<T = any> extends Omit<ListProps<T>, 
  'variant' | 'nestedItems' | 'defaultExpanded'
> {
  variant: 'nested'
  nestedItems: Map<string | number, ListItemData<T>[]>
  defaultExpanded?: (string | number)[]
}