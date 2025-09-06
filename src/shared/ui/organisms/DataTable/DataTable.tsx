import React, { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  flexRender,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  PaginationState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Checkbox,
  IconButton,
  TextField,
  Box,
  Toolbar,
  Typography,
  Tooltip,
  CircularProgress,
  Alert,
  InputAdornment,
  TableSortLabel,
  Menu,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  SxProps,
  Theme,
  Button,
} from '@mui/material'
import {
  Download as DownloadIcon,
  ViewColumn as ViewColumnIcon,
  Search as SearchIcon,
  KeyboardArrowUp,
  KeyboardArrowDown,
} from '@mui/icons-material'
import { visuallyHidden } from '@mui/utils'

export interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  
  loading?: boolean
  error?: string | null
  
  // Features
  enableSorting?: boolean
  enableFiltering?: boolean
  enableColumnFilters?: boolean
  enableGlobalFilter?: boolean
  enableRowSelection?: boolean
  enableMultiRowSelection?: boolean
  enableColumnVisibility?: boolean
  enablePagination?: boolean
  enableDensePadding?: boolean
  
  // Server-side options
  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  
  // Pagination
  pageCount?: number
  
  // Initial states
  initialSorting?: SortingState
  initialColumnFilters?: ColumnFiltersState
  initialGlobalFilter?: string
  initialColumnVisibility?: VisibilityState
  initialRowSelection?: RowSelectionState
  initialPagination?: PaginationState
  
  // Callbacks
  onSortingChange?: (sorting: SortingState) => void
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void
  onGlobalFilterChange?: (filter: string) => void
  onColumnVisibilityChange?: (visibility: VisibilityState) => void
  onRowSelectionChange?: (selection: RowSelectionState) => void
  onPaginationChange?: (pagination: PaginationState) => void
  
  // UI Options
  title?: string
  dense?: boolean
  stickyHeader?: boolean
  maxHeight?: number | string
  showToolbar?: boolean
  showColumnToggle?: boolean
  showExport?: boolean
  exportFileName?: string
  onExport?: (format: 'csv' | 'json', data: TData[]) => void
  
  // Empty state
  emptyMessage?: string
  
  // Custom components
  customToolbar?: React.ReactNode
  customActions?: React.ReactNode
  
  sx?: SxProps<Theme>
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.ComponentProps<typeof TextField>, 'onChange'>) {
  const [value, setValue] = useState(initialValue)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return (
    <TextField
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

export function DataTable<TData extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  error = null,
  
  enableSorting = true,
  enableFiltering = true,
  enableColumnFilters = true,
  enableGlobalFilter = true,
  enableRowSelection = false,
  enableMultiRowSelection = true,
  enableColumnVisibility = true,
  enablePagination = true,
  enableDensePadding = true,
  
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  
  pageCount,
  
  initialSorting = [],
  initialColumnFilters = [],
  initialGlobalFilter = '',
  initialColumnVisibility = {},
  initialRowSelection = {},
  initialPagination = { pageIndex: 0, pageSize: 10 },
  
  onSortingChange: onSortingChangeProp,
  onColumnFiltersChange: onColumnFiltersChangeProp,
  onGlobalFilterChange: onGlobalFilterChangeProp,
  onColumnVisibilityChange: onColumnVisibilityChangeProp,
  onSelectionChange: onSelectionChangeProp,
  onPaginationChange: onPaginationChangeProp,
  
  title,
  dense = false,
  stickyHeader = false,
  maxHeight,
  showToolbar = true,
  showColumnToggle = true,
  showExport = true,
  exportFileName = 'data-export',
  onExport,
  onRowClick,
  
  emptyMessage = 'No data available',
  
  actions,
  customToolbar,
  customActions,
  
  sx,
}: DataTableProps<TData>) {
  // State
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters)
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialRowSelection)
  const [pagination, setPagination] = useState<PaginationState>(initialPagination)
  const [isDense, setIsDense] = useState(dense)
  
  // Menu anchors
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null)
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null)
  
  // Enhanced columns with selection
  const enhancedColumns = useMemo<ColumnDef<TData>[]>(() => {
    const cols: ColumnDef<TData>[] = [...columns]
    
    if (enableRowSelection) {
      cols.unshift({
        id: 'select',
        size: 40,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      })
    }
    
    return cols
  }, [columns, enableRowSelection])
  
  // Table instance
  const table = useReactTable({
    data,
    columns: enhancedColumns,
    pageCount,
    
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
      pagination,
    },
    
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(newSorting)
      onSortingChangeProp?.(newSorting)
    },
    onColumnFiltersChange: (updater) => {
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater
      setColumnFilters(newFilters)
      onColumnFiltersChangeProp?.(newFilters)
    },
    onGlobalFilterChange: (updater) => {
      const newFilter = typeof updater === 'function' ? updater(globalFilter) : updater
      setGlobalFilter(newFilter)
      onGlobalFilterChangeProp?.(newFilter)
    },
    onColumnVisibilityChange: (updater) => {
      const newVisibility = typeof updater === 'function' ? updater(columnVisibility) : updater
      setColumnVisibility(newVisibility)
      onColumnVisibilityChangeProp?.(newVisibility)
    },
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater
      setRowSelection(newSelection)
      onSelectionChangeProp?.(newSelection)
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater
      setPagination(newPagination)
      onPaginationChangeProp?.(newPagination)
    },
    
    enableSorting,
    enableFilters: enableFiltering,
    enableColumnFilters,
    enableGlobalFilter,
    enableRowSelection,
    enableMultiRowSelection,
    enableColumnVisibility,
    
    manualPagination,
    manualSorting,
    manualFiltering,
    
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: !manualFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: !manualPagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: !manualSorting ? getSortedRowModel() : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  })
  
  // Export handlers
  const handleExport = (format: 'csv' | 'json') => {
    const dataToExport = table.getFilteredSelectedRowModel().rows.length > 0
      ? table.getFilteredSelectedRowModel().rows.map(row => row.original)
      : table.getFilteredRowModel().rows.map(row => row.original)
    
    if (onExport) {
      onExport(format, dataToExport)
      return
    }
    
    // Default export implementation
    if (format === 'csv') {
      const headers = table.getAllColumns()
        .filter(col => col.getIsVisible() && col.id !== 'select')
        .map(col => col.id)
        .join(',')
      
      const rows = dataToExport.map(row => 
        table.getAllColumns()
          .filter(col => col.getIsVisible() && col.id !== 'select')
          .map(col => {
            const value = (row as Record<string, unknown>)[col.id]
            return JSON.stringify(value ?? '')
          })
          .join(',')
      ).join('\n')
      
      const csv = `${headers}\n${rows}`
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${exportFileName}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'json') {
      const json = JSON.stringify(dataToExport, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${exportFileName}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }
  
  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    )
  }
  
  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }
  
  // Empty state
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', ...sx }}>
        <Typography variant="h6" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Paper>
    )
  }
  
  const selectedCount = Object.keys(rowSelection).length
  
  return (
    <Paper sx={sx}>
      {/* Toolbar */}
      {showToolbar && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(selectedCount > 0 && {
              bgcolor: (theme) =>
                theme.palette.mode === 'light'
                  ? 'rgba(25, 118, 210, 0.08)'
                  : 'rgba(144, 202, 249, 0.08)',
            }),
          }}
        >
          {customToolbar || (
            <>
              <Box sx={{ flex: '1 1 100%' }}>
                {selectedCount > 0 ? (
                  <Typography color="inherit" variant="subtitle1">
                    {selectedCount} selected
                  </Typography>
                ) : (
                  <Typography variant="h6" component="div">
                    {title || 'Data Table'}
                  </Typography>
                )}
              </Box>
              
              <Stack direction="row" spacing={1}>
                {/* Global Filter */}
                {enableGlobalFilter && (
                  <DebouncedInput
                    value={globalFilter ?? ''}
                    onChange={value => table.setGlobalFilter(String(value))}
                    placeholder="Search..."
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                
                {/* Column Visibility */}
                {showColumnToggle && enableColumnVisibility && (
                  <Tooltip title="Toggle Columns">
                    <IconButton onClick={(e) => setColumnMenuAnchor(e.currentTarget)}>
                      <ViewColumnIcon />
                    </IconButton>
                  </Tooltip>
                )}
                
                {/* Export */}
                {showExport && (
                  <Tooltip title="Export">
                    <IconButton onClick={(e) => setExportMenuAnchor(e.currentTarget)}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                )}
                
                {/* Dense Padding */}
                {enableDensePadding && (
                  <Tooltip title="Toggle Dense">
                    <IconButton onClick={() => setIsDense(!isDense)}>
                      {isDense ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                  </Tooltip>
                )}
                
                {/* Actions */}
                {actions?.map((action, index) => (
                  <Button
                    key={index}
                    size="small"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    color={action.color}
                    startIcon={action.startIcon}
                    sx={{ ml: 1 }}
                  >
                    {action.label}
                  </Button>
                ))}
                
                {customActions}
              </Stack>
            </>
          )}
        </Toolbar>
      )}
      
      {/* Column Visibility Menu */}
      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={() => setColumnMenuAnchor(null)}
        PaperProps={{ sx: { p: 2, minWidth: 200 } }}
      >
        <Typography variant="subtitle1" sx={{ px: 1, pb: 1 }}>
          Toggle Columns
        </Typography>
        {table.getAllLeafColumns()
          .filter(column => column.id !== 'select')
          .map(column => (
            <FormControlLabel
              key={column.id}
              control={
                <Switch
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                  size="small"
                />
              }
              label={column.id}
              sx={{ display: 'block', px: 1 }}
            />
          ))}
      </Menu>
      
      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={() => { handleExport('csv'); setExportMenuAnchor(null); }}>
          Export as CSV
        </MenuItem>
        <MenuItem onClick={() => { handleExport('json'); setExportMenuAnchor(null); }}>
          Export as JSON
        </MenuItem>
      </Menu>
      
      {/* Table */}
      <TableContainer sx={{ maxHeight }}>
        <Table
          sx={{ minWidth: 650 }}
          size={isDense ? 'small' : 'medium'}
          stickyHeader={stickyHeader}
        >
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell
                    key={header.id}
                    align={'left'}
                    style={{ width: header.getSize() }}
                    sortDirection={
                      header.column.getIsSorted() === 'asc'
                        ? 'asc'
                        : header.column.getIsSorted() === 'desc'
                        ? 'desc'
                        : false
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {header.column.getCanSort() && enableSorting ? (
                          <TableSortLabel
                            active={!!header.column.getIsSorted()}
                            direction={header.column.getIsSorted() || 'asc'}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getIsSorted() ? (
                              <Box component="span" sx={visuallyHidden}>
                                {header.column.getIsSorted() === 'desc'
                                  ? 'sorted descending'
                                  : 'sorted ascending'}
                              </Box>
                            ) : null}
                          </TableSortLabel>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                        
                        {/* Column Filter */}
                        {header.column.getCanFilter() && enableColumnFilters && (
                          <DebouncedInput
                            value={(header.column.getFilterValue() ?? '') as string}
                            onChange={value => header.column.setFilterValue(value)}
                            placeholder="Filter..."
                            size="small"
                            sx={{ maxWidth: 100 }}
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          />
                        )}
                      </Box>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                hover
                selected={row.getIsSelected()}
                onClick={() => onRowClick?.(row.original)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    align={'left'}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      {enablePagination && (
        <TablePagination
          component="div"
          count={table.getFilteredRowModel().rows.length}
          page={pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          rowsPerPage={pagination.pageSize}
          onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
      )}
    </Paper>
  )
}