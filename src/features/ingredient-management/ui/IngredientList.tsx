import React from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Block as BlockIcon
} from '@mui/icons-material'
import type { Ingredient } from '@/entities/ingredient/types'

interface IngredientListProps {
  ingredients: Ingredient[]
  loading?: boolean
  error?: string | null
  selectedIds?: string[]
  onSelect?: (id: string) => void
  onSelectAll?: (selected: boolean) => void
  onEdit?: (ingredient: Ingredient) => void
  onDelete?: (id: string) => void
  onClone?: (id: string) => void
  onToggleShare?: (id: string, shared: boolean) => void
  page?: number
  rowsPerPage?: number
  totalCount?: number
  onPageChange?: (page: number) => void
  onRowsPerPageChange?: (rowsPerPage: number) => void
}

export const IngredientList: React.FC<IngredientListProps> = ({
  ingredients,
  loading = false,
  error = null,
  selectedIds = [],
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onClone,
  onToggleShare,
  page = 0,
  rowsPerPage = 25,
  totalCount,
  onPageChange,
  onRowsPerPageChange
}) => {
  const isSelected = (id: string) => selectedIds.includes(id)
  const isAllSelected = ingredients.length > 0 && selectedIds.length === ingredients.length

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll?.(event.target.checked)
  }

  const handlePageChange = (_event: unknown, newPage: number) => {
    onPageChange?.(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange?.(parseInt(event.target.value, 10))
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
      macro: 'primary',
      micro: 'secondary',
      electrolyte: 'success',
      vitamin: 'info',
      other: 'default' as any
    }
    return colors[category] || 'default'
  }

  const getTypeLabel = (type?: string) => {
    if (!type) return '-'
    return type.replace(/([A-Z])/g, ' $1').trim()
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  if (ingredients.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No ingredients found
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  indeterminate={selectedIds.length > 0 && selectedIds.length < ingredients.length}
                />
              </TableCell>
              <TableCell>Keyname</TableCell>
              <TableCell>Display Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell align="center">Shared</TableCell>
              <TableCell align="center">Ranges</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingredients.map((ingredient) => {
              const selected = isSelected(ingredient.id)
              
              return (
                <TableRow
                  key={ingredient.id}
                  hover
                  selected={selected}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected}
                      onChange={() => onSelect?.(ingredient.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {ingredient.keyname}
                    </Typography>
                    {ingredient.mnemonic && (
                      <Typography variant="caption" color="text.secondary">
                        {ingredient.mnemonic}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{ingredient.displayName}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getTypeLabel(ingredient.type)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ingredient.category}
                      size="small"
                      color={getCategoryColor(ingredient.category)}
                    />
                  </TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleShare?.(ingredient.id, !ingredient.isShared)
                      }}
                    >
                      {ingredient.isShared ? (
                        <Tooltip title="Shared">
                          <ShareIcon fontSize="small" color="primary" />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Not shared">
                          <BlockIcon fontSize="small" />
                        </Tooltip>
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    {ingredient.referenceRanges.length > 0 ? (
                      <Chip
                        label={ingredient.referenceRanges.length}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={0.5} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.(ingredient)
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Clone">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            onClone?.(ingredient.id)
                          }}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete?.(ingredient.id)
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {totalCount !== undefined && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      )}
    </Paper>
  )
}