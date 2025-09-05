import { ReactNode, MouseEvent } from 'react'
import { SxProps, Theme } from '@mui/material'

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
  data?: T
}

export interface ListProps<T = any> {
  items: ListItemData<T>[]
  loading?: boolean
  error?: string | null
  
  // Variants
  variant?: 'simple' | 'interactive' | 'nested'
  dense?: boolean
  disablePadding?: boolean
  
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
  
  // Virtual Scrolling
  virtualized?: boolean
  itemHeight?: number | ((index: number) => number)
  overscan?: number
  height?: number | string
  
  // Empty State
  emptyMessage?: string
  emptyIcon?: ReactNode
  emptyAction?: ReactNode
  
  // Styling
  sx?: SxProps<Theme>
  itemSx?: SxProps<Theme>
  subheader?: ReactNode
  
  // Search/Filter
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  filterMode?: 'local' | 'server'
  
  // Sorting
  sortable?: boolean
  sortBy?: 'primary' | 'secondary' | 'custom'
  sortOrder?: 'asc' | 'desc'
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  customSort?: (a: ListItemData<T>, b: ListItemData<T>) => number
  
  // Grouping
  grouped?: boolean
  groupBy?: (item: ListItemData<T>) => string
  groupHeaders?: Map<string, ReactNode>
  
  // Load More / Infinite Scroll
  hasMore?: boolean
  onLoadMore?: () => void
  loadingMore?: boolean
  
  // Swipe Actions (mobile)
  swipeActions?: {
    left?: (item: ListItemData<T>) => ReactNode
    right?: (item: ListItemData<T>) => ReactNode
  }
  
  // Drag and Drop
  draggable?: boolean
  onReorder?: (items: ListItemData<T>[]) => void
  
  // Custom Components
  customItemRenderer?: (item: ListItemData<T>, index: number) => ReactNode
  customEmptyState?: ReactNode
  customLoadingState?: ReactNode
}

export interface VirtualListProps<T = any> extends ListProps<T> {
  virtualized: true
  height: number | string
  itemHeight: number | ((index: number) => number)
}