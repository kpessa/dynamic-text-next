export interface PaginationProps {
  count: number
  page: number
  onPageChange: (page: number) => void
  rowsPerPage?: number
  onRowsPerPageChange?: (rowsPerPage: number) => void
  rowsPerPageOptions?: number[]
  showFirstButton?: boolean
  showLastButton?: boolean
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'text' | 'outlined'
  shape?: 'circular' | 'rounded'
  color?: 'primary' | 'secondary' | 'standard'
  boundaryCount?: number
  siblingCount?: number
  showPageInfo?: boolean
  showJumpToPage?: boolean
  sx?: any
  className?: string
}