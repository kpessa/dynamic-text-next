import React from 'react'
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Switch
} from '@mui/material'
import {
  Clear as ClearIcon,
  FilterList as FilterIcon
} from '@mui/icons-material'

interface IngredientFilterPanelProps {
  filters: Record<string, any>
  onChange: (filters: Record<string, any>) => void
  onClear: () => void
}

const CATEGORIES = [
  { value: 'electrolyte', label: 'Electrolytes' },
  { value: 'macro', label: 'Macronutrients' },
  { value: 'micro', label: 'Micronutrients' },
  { value: 'vitamin', label: 'Vitamins' },
  { value: 'trace', label: 'Trace Elements' },
  { value: 'other', label: 'Other' }
]

const POPULATIONS = [
  { value: 'NEO', label: 'Neonatal' },
  { value: 'CHILD', label: 'Pediatric' },
  { value: 'ADOLESCENT', label: 'Adolescent' },
  { value: 'ADULT', label: 'Adult' }
]

export const IngredientFilterPanel: React.FC<IngredientFilterPanelProps> = ({
  filters,
  onChange,
  onClear
}) => {
  const handleCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = filters.categories || []
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter((c: string) => c !== category)
    
    onChange({
      ...filters,
      categories: newCategories.length > 0 ? newCategories : undefined
    })
  }

  const handlePopulationChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value
    onChange({
      ...filters,
      population: value || undefined
    })
  }

  const handleToggleChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target
    onChange({
      ...filters,
      [key]: checked || undefined
    })
  }

  const activeFilterCount = Object.keys(filters).filter(key => 
    filters[key] !== undefined && 
    (Array.isArray(filters[key]) ? filters[key].length > 0 : true)
  ).length

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterIcon color="action" />
          <Typography variant="h6">Filters</Typography>
          {activeFilterCount > 0 && (
            <Chip
              label={activeFilterCount}
              size="small"
              color="primary"
            />
          )}
        </Stack>
        <Button
          size="small"
          startIcon={<ClearIcon />}
          onClick={onClear}
          disabled={activeFilterCount === 0}
        >
          Clear All
        </Button>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* Category Filters */}
      <Box mb={3}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          CATEGORIES
        </Typography>
        <FormGroup>
          {CATEGORIES.map((category) => (
            <FormControlLabel
              key={category.value}
              control={
                <Checkbox
                  checked={filters.categories?.includes(category.value) || false}
                  onChange={(e) => handleCategoryChange(category.value, e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2">{category.label}</Typography>
              }
            />
          ))}
        </FormGroup>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Population Filter */}
      <Box mb={3}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          POPULATION TYPE
        </Typography>
        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
          <InputLabel>Population</InputLabel>
          <Select
            value={filters.population || ''}
            label="Population"
            onChange={handlePopulationChange}
          >
            <MenuItem value="">All Populations</MenuItem>
            {POPULATIONS.map((pop) => (
              <MenuItem key={pop.value} value={pop.value}>
                {pop.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Status Filters */}
      <Box mb={3}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          STATUS
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={filters.showSharedOnly || false}
                onChange={handleToggleChange('showSharedOnly')}
                size="small"
              />
            }
            label={
              <Typography variant="body2">Shared Only</Typography>
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={filters.showPrivateOnly || false}
                onChange={handleToggleChange('showPrivateOnly')}
                size="small"
              />
            }
            label={
              <Typography variant="body2">Private Only</Typography>
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={filters.showWithFormula || false}
                onChange={handleToggleChange('showWithFormula')}
                size="small"
              />
            }
            label={
              <Typography variant="body2">Has Formula</Typography>
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={filters.showWithReferenceRanges || false}
                onChange={handleToggleChange('showWithReferenceRanges')}
                size="small"
              />
            }
            label={
              <Typography variant="body2">Has Reference Ranges</Typography>
            }
          />
        </FormGroup>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Special Filters */}
      <Box mb={3}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          SPECIAL
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.showDuplicatesOnly || false}
                onChange={(e) => onChange({
                  ...filters,
                  showDuplicatesOnly: e.target.checked || undefined
                })}
                size="small"
              />
            }
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2">Duplicates Only</Typography>
                <Chip label="New" size="small" color="warning" />
              </Stack>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.showRecentlyModified || false}
                onChange={(e) => onChange({
                  ...filters,
                  showRecentlyModified: e.target.checked || undefined
                })}
                size="small"
              />
            }
            label={
              <Typography variant="body2">Recently Modified</Typography>
            }
          />
        </FormGroup>
      </Box>

      {/* Apply Button */}
      <Box mt={3}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<FilterIcon />}
          disabled={activeFilterCount === 0}
        >
          Apply Filters ({activeFilterCount})
        </Button>
      </Box>
    </Box>
  )
}