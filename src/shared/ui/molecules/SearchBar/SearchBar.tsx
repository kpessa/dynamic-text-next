import React, { useState, useRef, useEffect } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import HistoryIcon from '@mui/icons-material/History'
import { SearchBarProps } from './SearchBar.types'

export const SearchBar = React.forwardRef<HTMLDivElement, SearchBarProps>(
  (
    {
      placeholder = 'Search...',
      value: controlledValue,
      onChange,
      onSearch,
      onClear,
      suggestions = [],
      recentSearches = [],
      onSuggestionClick,
      onRecentSearchClick,
      showClearButton = true,
      showSearchButton = true,
      autoFocus = false,
      disabled = false,
      fullWidth = true,
      size = 'medium',
      variant = 'outlined',
      loading = false,
      sx,
      className
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [focusedIndex, setFocusedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const value = controlledValue !== undefined ? controlledValue : internalValue

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value
      setInternalValue(newValue)
      setShowDropdown(true)
      setFocusedIndex(-1)
      
      if (onChange) {
        onChange(newValue)
      }
    }

    const handleSearch = () => {
      if (onSearch) {
        onSearch(value)
      }
      setShowDropdown(false)
    }

    const handleClear = () => {
      setInternalValue('')
      setShowDropdown(false)
      
      if (onChange) {
        onChange('')
      }
      
      if (onClear) {
        onClear()
      }
      
      inputRef.current?.focus()
    }

    const handleSuggestionClick = (suggestion: string) => {
      setInternalValue(suggestion)
      setShowDropdown(false)
      
      if (onChange) {
        onChange(suggestion)
      }
      
      if (onSuggestionClick) {
        onSuggestionClick(suggestion)
      }
      
      if (onSearch) {
        onSearch(suggestion)
      }
    }

    const handleRecentSearchClick = (search: string) => {
      setInternalValue(search)
      setShowDropdown(false)
      
      if (onChange) {
        onChange(search)
      }
      
      if (onRecentSearchClick) {
        onRecentSearchClick(search)
      }
      
      if (onSearch) {
        onSearch(search)
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      const allItems = [...suggestions, ...recentSearches]
      
      if (event.key === 'Enter') {
        event.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < allItems.length) {
          if (focusedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[focusedIndex])
          } else {
            handleRecentSearchClick(recentSearches[focusedIndex - suggestions.length])
          }
        } else {
          handleSearch()
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        setFocusedIndex(prev => Math.min(prev + 1, allItems.length - 1))
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setFocusedIndex(prev => Math.max(prev - 1, -1))
      } else if (event.key === 'Escape') {
        setShowDropdown(false)
        setFocusedIndex(-1)
      }
    }

    const handleFocus = () => {
      if (suggestions.length > 0 || recentSearches.length > 0) {
        setShowDropdown(true)
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

    const hasDropdownContent = (suggestions.length > 0 || recentSearches.length > 0) && !disabled

    return (
      <Box ref={ref} sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto', ...sx }} className={className}>
        <TextField
          inputRef={inputRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          fullWidth={fullWidth}
          size={size}
          variant={variant}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <SearchIcon color={disabled ? 'disabled' : 'action'} />
                )}
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {showClearButton && value && !disabled && (
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    edge="end"
                    aria-label="clear search"
                  >
                    <ClearIcon />
                  </IconButton>
                )}
                {showSearchButton && !disabled && (
                  <IconButton
                    size="small"
                    onClick={handleSearch}
                    edge="end"
                    aria-label="search"
                  >
                    <SearchIcon />
                  </IconButton>
                )}
              </InputAdornment>
            )
          }}
        />
        
        {showDropdown && hasDropdownContent && (
          <Paper
            ref={dropdownRef}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 0.5,
              maxHeight: 400,
              overflow: 'auto',
              zIndex: 1300
            }}
            elevation={8}
          >
            {suggestions.length > 0 && (
              <>
                <List dense>
                  {suggestions.map((suggestion, index) => (
                    <ListItemButton
                      key={`suggestion-${index}`}
                      selected={focusedIndex === index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{
                        backgroundColor: focusedIndex === index ? 'action.hover' : 'transparent'
                      }}
                    >
                      <ListItemIcon>
                        <SearchIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={suggestion} />
                    </ListItemButton>
                  ))}
                </List>
                {recentSearches.length > 0 && <Divider />}
              </>
            )}
            
            {recentSearches.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Recent Searches
                  </Typography>
                </Box>
                <List dense>
                  {recentSearches.map((search, index) => {
                    const actualIndex = suggestions.length + index
                    return (
                      <ListItemButton
                        key={`recent-${index}`}
                        selected={focusedIndex === actualIndex}
                        onClick={() => handleRecentSearchClick(search)}
                        sx={{
                          backgroundColor: focusedIndex === actualIndex ? 'action.hover' : 'transparent'
                        }}
                      >
                        <ListItemIcon>
                          <HistoryIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={search} />
                      </ListItemButton>
                    )
                  })}
                </List>
              </>
            )}
          </Paper>
        )}
      </Box>
    )
  }
)

SearchBar.displayName = 'SearchBar'