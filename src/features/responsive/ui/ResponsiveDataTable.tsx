import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Collapse,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  TablePagination,
  Checkbox
} from '@mui/material'
import {
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material'

interface Column {
  id: string
  label: string
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  format?: (value: any) => string
  priority?: 'high' | 'medium' | 'low' // For responsive hiding
}

interface ResponsiveDataTableProps {
  columns: Column[]
  rows: any[]
  selectable?: boolean
  onRowClick?: (row: any) => void
  onSelectionChange?: (selected: any[]) => void
  mobileCardRenderer?: (row: any) => React.ReactNode
}

export const ResponsiveDataTable: React.FC<ResponsiveDataTableProps> = ({
  columns,
  rows,
  selectable = false,
  onRowClick,
  onSelectionChange,
  mobileCardRenderer
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selected, setSelected] = useState<any[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<any>>(new Set())

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id)
      setSelected(newSelected)
      onSelectionChange?.(newSelected)
      return
    }
    setSelected([])
    onSelectionChange?.([])
  }

  const handleClick = (event: React.MouseEvent<unknown>, id: any) => {
    const selectedIndex = selected.indexOf(id)
    let newSelected: any[] = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
    }

    setSelected(newSelected)
    onSelectionChange?.(newSelected)
  }

  const isSelected = (id: any) => selected.indexOf(id) !== -1

  const toggleRowExpansion = (rowId: any) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId)
    } else {
      newExpanded.add(rowId)
    }
    setExpandedRows(newExpanded)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  // Filter columns based on priority and screen size
  const visibleColumns = columns.filter(col => {
    if (isMobile) {
      return col.priority === 'high'
    }
    if (isTablet) {
      return col.priority === 'high' || col.priority === 'medium'
    }
    return true
  })

  // Mobile Card View
  if (isMobile && mobileCardRenderer) {
    return (
      <Box>
        <Stack spacing={2}>
          {rows
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, index) => (
              <Card 
                key={row.id || index}
                onClick={() => onRowClick?.(row)}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:active': {
                    transform: 'scale(0.98)',
                    transition: 'transform 0.1s'
                  }
                }}
              >
                <CardContent>
                  {selectable && (
                    <Checkbox
                      checked={isSelected(row.id)}
                      onChange={(event) => handleClick(event, row.id)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  )}
                  {mobileCardRenderer(row)}
                </CardContent>
              </Card>
            ))}
        </Stack>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    )
  }

  // Responsive Table View
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="responsive table">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < rows.length}
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {isMobile && <TableCell />}
              {visibleColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
              {(isMobile || isTablet) && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                const isItemSelected = isSelected(row.id)
                const isExpanded = expandedRows.has(row.id)

                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      hover
                      onClick={(event) => onRowClick ? onRowClick(row) : handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      selected={isItemSelected}
                      sx={{
                        cursor: 'pointer',
                        '& > td': {
                          borderBottom: isExpanded ? 'none' : undefined
                        }
                      }}
                    >
                      {selectable && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            onClick={(event) => {
                              event.stopPropagation()
                              handleClick(event, row.id)
                            }}
                          />
                        </TableCell>
                      )}
                      {isMobile && (
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleRowExpansion(row.id)
                            }}
                          >
                            {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                          </IconButton>
                        </TableCell>
                      )}
                      {visibleColumns.map((column) => {
                        const value = row[column.id]
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format ? column.format(value) : value}
                          </TableCell>
                        )
                      })}
                      {(isMobile || isTablet) && (
                        <TableCell align="right">
                          <IconButton size="small">
                            <MoreIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                    {isMobile && isExpanded && (
                      <TableRow>
                        <TableCell colSpan={visibleColumns.length + 3}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Additional Details
                              </Typography>
                              <Stack spacing={1}>
                                {columns
                                  .filter(col => col.priority !== 'high')
                                  .map(col => (
                                    <Box key={col.id} sx={{ display: 'flex', gap: 1 }}>
                                      <Typography variant="caption" color="text.secondary">
                                        {col.label}:
                                      </Typography>
                                      <Typography variant="caption">
                                        {col.format ? col.format(row[col.id]) : row[col.id]}
                                      </Typography>
                                    </Box>
                                  ))}
                              </Stack>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}