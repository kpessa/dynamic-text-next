import React, { useState, useCallback } from 'react'
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Autocomplete,
  Chip
} from '@mui/material'
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material'
import { debounce } from '@/shared/lib/utils'

interface IngredientSearchProps {
  value?: string
  suggestions?: string[]
  recentSearches?: string[]
  onSearch: (query: string) => void
  onClear?: () => void
  placeholder?: string
  fullWidth?: boolean
  size?: 'small' | 'medium'
  showSuggestions?: boolean
}

export const IngredientSearch: React.FC<IngredientSearchProps> = ({
  value = '',
  suggestions = [],
  recentSearches = [],
  onSearch,
  onClear,
  placeholder = 'Search ingredients...',
  fullWidth = true,
  size = 'medium',
  showSuggestions = true
}) => {
  const [searchValue, setSearchValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearch(query)
    }, 300),
    [onSearch]
  )

  const handleInputChange = (_event: any, newValue: string) => {
    setSearchValue(newValue)
    debouncedSearch(newValue)
  }

  const handleClear = () => {
    setSearchValue('')
    onSearch('')
    onClear?.()
  }

  const handleSelect = (_event: any, value: string | null) => {
    if (value) {
      setSearchValue(value)
      onSearch(value)
    }
  }

  // Combine suggestions and recent searches for autocomplete options
  const options = [
    ...(recentSearches.length > 0 ? [
      { type: 'recent', label: 'Recent Searches', options: recentSearches }
    ] : []),
    ...(suggestions.length > 0 ? [
      { type: 'suggestions', label: 'Suggestions', options: suggestions }
    ] : [])
  ]

  if (!showSuggestions) {
    return (
      <TextField
        fullWidth={fullWidth}
        size={size}
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value)
          debouncedSearch(e.target.value)
        }}
        placeholder={placeholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    )
  }

  return (
    <Autocomplete
      freeSolo
      fullWidth={fullWidth}
      size={size}
      value={searchValue}
      inputValue={searchValue}
      onInputChange={handleInputChange}
      onChange={handleSelect}
      open={isOpen && (suggestions.length > 0 || recentSearches.length > 0)}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      options={options.flatMap(group => group.options)}
      groupBy={(option) => {
        const group = options.find(g => g.options.includes(option))
        return group?.label || ''
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {searchValue && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClear}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderOption={(props, option) => {
        const isRecent = recentSearches.includes(option)
        return (
          <Box component="li" {...props}>
            {isRecent && (
              <Chip
                label="Recent"
                size="small"
                sx={{ mr: 1 }}
                variant="outlined"
              />
            )}
            {option}
          </Box>
        )
      }}
    />
  )
}