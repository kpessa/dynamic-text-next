import React, { useState, useMemo } from 'react'
import MuiSelect from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import FormHelperText from '@mui/material/FormHelperText'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { Search } from '@mui/icons-material'
import ListSubheader from '@mui/material/ListSubheader'
import { SelectProps, SelectOption } from './Select.types'

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      variant = 'single',
      placeholder,
      searchable = false,
      showCheckboxes = false,
      groupBy,
      helperText,
      validationState = 'default',
      label,
      value,
      multiple,
      fullWidth,
      disabled,
      required,
      error,
      size,
      ...props
    },
    ref
  ) => {
    const [searchQuery, setSearchQuery] = useState('')
    const isMulti = variant === 'multi' || multiple
    const isSearchable = variant === 'searchable' || searchable

    const filteredOptions = useMemo(() => {
      if (!isSearchable || !searchQuery) return options
      
      return options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }, [options, searchQuery, isSearchable])

    const groupedOptions = useMemo(() => {
      if (!groupBy) return { '': filteredOptions }
      
      return filteredOptions.reduce((groups, option) => {
        const group = groupBy(option)
        if (!groups[group]) groups[group] = []
        groups[group].push(option)
        return groups
      }, {} as Record<string, SelectOption[]>)
    }, [filteredOptions, groupBy])

    const getColor = () => {
      switch (validationState) {
        case 'success':
          return 'success'
        case 'warning':
          return 'warning'
        case 'error':
          return 'error'
        default:
          return undefined
      }
    }

    const renderValue = (selected: any) => {
      if (!selected || (Array.isArray(selected) && selected.length === 0)) {
        if (placeholder && !label) {
          return <span style={{ color: 'rgba(0, 0, 0, 0.38)' }}>{placeholder}</span>
        }
        if (placeholder && label) {
          // When we have both label and placeholder, return empty string
          // The label will be shown in the notched outline
          return ''
        }
        return <span style={{ color: 'rgba(0, 0, 0, 0.38)' }}>Select...</span>
      }

      if (isMulti && Array.isArray(selected)) {
        const selectedLabels = selected.map(val => {
          const option = options.find(opt => opt.value === val)
          return option ? option.label : val
        })
        return selectedLabels.join(', ')
      }

      const option = options.find(opt => opt.value === selected)
      return option ? option.label : selected
    }

    const renderMenuItems = () => {
      const items: React.ReactNode[] = []

      if (isSearchable) {
        items.push(
          <ListSubheader key="search" disableSticky>
            <TextField
              size="small"
              fullWidth
              placeholder="Search options..."
              value={searchQuery}
              onChange={(e) => {
                e.stopPropagation()
                setSearchQuery(e.target.value)
              }}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </ListSubheader>
        )
      }

      if (filteredOptions.length === 0) {
        items.push(
          <MenuItem key="no-options" disabled>
            No options available
          </MenuItem>
        )
        return items
      }

      Object.entries(groupedOptions).forEach(([groupName, groupOptions]) => {
        if (groupBy && groupName) {
          items.push(
            <ListSubheader key={`group-${groupName}`}>
              {groupName}
            </ListSubheader>
          )
        }

        groupOptions.forEach((option) => {
          if (isMulti && showCheckboxes) {
            items.push(
              <MenuItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                <Checkbox
                  checked={Array.isArray(value) ? value.includes(option.value) : false}
                />
                {option.icon && <span style={{ marginRight: 8 }}>{option.icon}</span>}
                <ListItemText primary={option.label} />
              </MenuItem>
            )
          } else {
            items.push(
              <MenuItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.icon && <span style={{ marginRight: 8 }}>{option.icon}</span>}
                {option.label}
              </MenuItem>
            )
          }
        })
      })

      return items
    }

    return (
      <FormControl
        ref={ref}
        fullWidth={fullWidth}
        disabled={disabled}
        required={required}
        error={error || validationState === 'error'}
        size={size}
        color={getColor()}
      >
        {label && <InputLabel id={`${label}-label`}>{label}</InputLabel>}
        <MuiSelect
          {...props}
          labelId={label ? `${label}-label` : undefined}
          value={value || (isMulti ? [] : '')}
          multiple={isMulti}
          label={label ? label : undefined}
          displayEmpty={!!placeholder || !label}
          renderValue={renderValue}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300
              }
            },
            autoFocus: false
          }}
        >
          {renderMenuItems()}
        </MuiSelect>
        {helperText && (
          <FormHelperText>{helperText}</FormHelperText>
        )}
      </FormControl>
    )
  }
)

Select.displayName = 'Select'