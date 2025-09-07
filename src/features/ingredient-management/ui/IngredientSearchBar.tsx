import React, { useState, useCallback } from 'react'
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Autocomplete,
  Chip,
  Paper,
  Typography
} from '@mui/material'
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon
} from '@mui/icons-material'
import { debounce } from 'lodash'

interface IngredientSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  suggestions?: string[]
  recentSearches?: string[]
  onFilterClick?: () => void
}

export const IngredientSearchBar: React.FC<IngredientSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search ingredients...',
  suggestions = [],
  recentSearches = [],
  onFilterClick
}) => {
  const [inputValue, setInputValue] = useState(value)
  const [focused, setFocused] = useState(false)

  // Debounce the onChange callback
  const debouncedOnChange = useCallback(
    debounce((newValue: string) => {
      onChange(newValue)
    }, 300),
    [onChange]
  )

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setInputValue(newValue)
    debouncedOnChange(newValue)
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    onChange(suggestion)
  }

  // Combine recent searches and suggestions for autocomplete
  const options = [
    ...recentSearches.map(search => ({ label: search, type: 'recent' })),
    ...suggestions.map(suggestion => ({ label: suggestion, type: 'suggestion' }))
  ]

  return (
    <Box position="relative">
      <TextField
        fullWidth
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        placeholder={placeholder}
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {inputValue && (
                <IconButton
                  size="small"
                  onClick={handleClear}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              )}
              {onFilterClick && (
                <IconButton
                  size="small"
                  onClick={onFilterClick}
                  edge="end"
                >
                  <FilterIcon />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
          },
        }}
      />

      {/* Quick Search Suggestions */}
      {focused && options.length > 0 && !inputValue && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            p: 2,
            zIndex: 1000,
            maxHeight: 300,
            overflow: 'auto'
          }}
        >
          {recentSearches.length > 0 && (
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                RECENT SEARCHES
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {recentSearches.slice(0, 5).map((search, index) => (
                  <Chip
                    key={index}
                    label={search}
                    size="small"
                    onClick={() => handleSuggestionClick(search)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {suggestions.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                SUGGESTIONS
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    size="small"
                    variant="outlined"
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  )
}