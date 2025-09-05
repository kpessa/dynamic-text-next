import { ReactNode } from 'react'
import { SxProps, Theme } from '@mui/material'
import { ColumnDef, SortingState, ColumnFiltersState, RowSelectionState, VisibilityState } from '@tanstack/react-table'

// TanStack Table types for new implementation
export interface DataTableColumn<T = any> extends ColumnDef<T> {
  id: string
  accessorKey?: string
  header?: any
  cell?: any
  enableSorting?: boolean
  enableColumnFilter?: boolean
  filterFn?: any
  minSize?: number
  maxSize?: number
}

export interface DataTableAction {
  label: string
  onClick: () => void
  disabled?: boolean
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
  startIcon?: ReactNode
}

export interface DataTableProps<T = any> {
  data: T[]
  columns: DataTableColumn<T>[]
  
  // Core features
  loading?: boolean
  error?: string | null
  title?: string
  
  // Sorting
  enableSorting?: boolean
  manualSorting?: boolean
  initialSorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  
  // Filtering
  enableGlobalFilter?: boolean
  enableColumnFilters?: boolean
  manualFiltering?: boolean
  globalFilterPlaceholder?: string
  onGlobalFilterChange?: (value: string) => void
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  
  // Pagination
  enablePagination?: boolean
  manualPagination?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  pageCount?: number
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void
  
  // Row Selection
  enableRowSelection?: boolean
  enableMultiRowSelection?: boolean
  onSelectionChange?: (selection: RowSelectionState) => void
  
  // Column Visibility
  enableColumnVisibility?: boolean
  initialColumnVisibility?: VisibilityState
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
  
  // Export
  enableExport?: boolean
  exportColumns?: string[]
  onExport?: (format: 'csv' | 'json', data: any[]) => void
  
  // Actions
  actions?: DataTableAction[]
  onRowClick?: (row: T) => void
  
  // Styling
  size?: 'small' | 'medium'
  striped?: boolean
  bordered?: boolean
  stickyHeader?: boolean
  maxHeight?: number | string
  sx?: SxProps<Theme>
  
  // Empty State
  emptyMessage?: string
  emptyState?: ReactNode
}

// Legacy types for backward compatibility (deprecated)
export type SortDirection = 'asc' | 'desc' | false

export interface Column<T = any> {
  id: string
  label: string
  field?: keyof T | ((row: T) => any)
  sortable?: boolean
  filterable?: boolean
  visible?: boolean
  width?: number | string
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  format?: (value: any, row: T) => ReactNode
  filterType?: 'text' | 'select' | 'number' | 'date' | 'boolean'
  filterOptions?: Array<{ label: string; value: any }>
  exportValue?: (value: any, row: T) => string
}

export interface FilterValue {
  columnId: string
  value: any
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in'
}

export interface SortState {
  columnId: string
  direction: SortDirection
}

export interface DataTableState {
  sortState: SortState | null
  filterValues: Record<string, any>
  selectedRows: Set<any>
  visibleColumns: Set<string>
  page: number
  rowsPerPage: number
}