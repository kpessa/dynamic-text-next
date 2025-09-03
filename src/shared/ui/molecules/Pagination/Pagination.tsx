import React, { useState } from 'react'
import MuiPagination from '@mui/material/Pagination'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { PaginationProps } from './Pagination.types'

export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      count,
      page,
      onPageChange,
      rowsPerPage = 10,
      onRowsPerPageChange,
      rowsPerPageOptions = [5, 10, 25, 50, 100],
      showFirstButton = true,
      showLastButton = true,
      disabled = false,
      size = 'medium',
      variant = 'outlined',
      shape = 'rounded',
      color = 'primary',
      boundaryCount = 1,
      siblingCount = 1,
      showPageInfo = true,
      showJumpToPage = false,
      sx,
      className
    },
    ref
  ) => {
    const [jumpValue, setJumpValue] = useState('')
    
    const totalPages = Math.ceil(count / rowsPerPage)
    const startItem = count === 0 ? 0 : (page - 1) * rowsPerPage + 1
    const endItem = Math.min(page * rowsPerPage, count)

    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
      onPageChange(value)
    }

    const handleRowsPerPageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
      const newRowsPerPage = parseInt(event.target.value as string, 10)
      if (onRowsPerPageChange) {
        onRowsPerPageChange(newRowsPerPage)
        // Reset to page 1 when changing rows per page
        onPageChange(1)
      }
    }

    const handleJumpToPage = () => {
      const pageNum = parseInt(jumpValue, 10)
      if (pageNum >= 1 && pageNum <= totalPages) {
        onPageChange(pageNum)
        setJumpValue('')
      }
    }

    const handleJumpInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      if (value === '' || /^[0-9]+$/.test(value)) {
        setJumpValue(value)
      }
    }

    const handleJumpKeyPress = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleJumpToPage()
      }
    }

    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 2,
          ...sx
        }}
        className={className}
      >
        {showPageInfo && (
          <Typography variant="body2" color="text.secondary">
            {count === 0 
              ? 'No items' 
              : `${startItem}-${endItem} of ${count} items`
            }
          </Typography>
        )}

        {onRowsPerPageChange && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Rows per page:
            </Typography>
            <Select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              size="small"
              disabled={disabled}
              variant="standard"
            >
              {rowsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        )}

        <MuiPagination
          count={totalPages}
          page={page}
          onChange={handleChange}
          disabled={disabled}
          size={size}
          variant={variant}
          shape={shape}
          color={color}
          boundaryCount={boundaryCount}
          siblingCount={siblingCount}
          showFirstButton={showFirstButton}
          showLastButton={showLastButton}
        />

        {showJumpToPage && totalPages > 10 && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Go to:
            </Typography>
            <TextField
              value={jumpValue}
              onChange={handleJumpInputChange}
              onKeyPress={handleJumpKeyPress}
              placeholder={`1-${totalPages}`}
              size="small"
              disabled={disabled}
              sx={{ width: 70 }}
              inputProps={{
                style: { textAlign: 'center' }
              }}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={handleJumpToPage}
              disabled={disabled || !jumpValue || parseInt(jumpValue) < 1 || parseInt(jumpValue) > totalPages}
            >
              Go
            </Button>
          </Stack>
        )}
      </Box>
    )
  }
)

Pagination.displayName = 'Pagination'