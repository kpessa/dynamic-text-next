import React, { useState } from 'react'
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Divider,
  Chip,
  Stack,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  FilterList as FilterIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon
} from '@mui/icons-material'
import type { 
  IngredientFilter,
  IngredientType,
  IngredientCategory,
  PopulationType
} from '@/entities/ingredient/types'

interface IngredientFilterProps {
  filter: IngredientFilter
  onFilterChange: (filter: IngredientFilter) => void
  onClearFilters?: () => void
  activeFilterCount?: number
}

const ingredientTypes: IngredientType[] = [
  'Macronutrient',
  'Micronutrient',
  'Additive',
  'Salt',
  'Diluent',
  'Other'
]

const ingredientCategories: IngredientCategory[] = [
  'macro',
  'micro',
  'electrolyte',
  'vitamin',
  'other'
]

const populationTypes: PopulationType[] = [
  'NEO',
  'CHILD',
  'ADOLESCENT',
  'ADULT'
]

export const IngredientFilterPanel: React.FC<IngredientFilterProps> = ({
  filter,
  onFilterChange,
  onClearFilters,
  activeFilterCount = 0
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | false>('type')

  const handleAccordionChange = (panel: string) => (_: any, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  const handleTypeChange = (type: IngredientType) => {
    const currentTypes = filter.types || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    
    onFilterChange({
      ...filter,
      types: newTypes.length > 0 ? newTypes : undefined
    })
  }

  const handleCategoryChange = (category: IngredientCategory) => {
    const currentCategories = filter.categories || []
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category]
    
    onFilterChange({
      ...filter,
      categories: newCategories.length > 0 ? newCategories : undefined
    })
  }

  const handlePopulationChange = (population: PopulationType) => {
    const currentPopulations = filter.populations || []
    const newPopulations = currentPopulations.includes(population)
      ? currentPopulations.filter(p => p !== population)
      : [...currentPopulations, population]
    
    onFilterChange({
      ...filter,
      populations: newPopulations.length > 0 ? newPopulations : undefined
    })
  }

  const handleReferenceRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    onFilterChange({
      ...filter,
      hasReferenceRanges: value === 'all' ? undefined : value === 'yes'
    })
  }

  const handleSharedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    onFilterChange({
      ...filter,
      isShared: value === 'all' ? undefined : value === 'yes'
    })
  }

  const handleHealthSystemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      healthSystem: event.target.value || undefined
    })
  }

  const clearAll = () => {
    onClearFilters?.()
    setDrawerOpen(false)
  }

  const getActiveFilters = (): string[] => {
    const active: string[] = []
    
    if (filter.types?.length) {
      active.push(`${filter.types.length} type${filter.types.length > 1 ? 's' : ''}`)
    }
    if (filter.categories?.length) {
      active.push(`${filter.categories.length} categor${filter.categories.length > 1 ? 'ies' : 'y'}`)
    }
    if (filter.populations?.length) {
      active.push(`${filter.populations.length} population${filter.populations.length > 1 ? 's' : ''}`)
    }
    if (filter.hasReferenceRanges !== undefined) {
      active.push(filter.hasReferenceRanges ? 'Has ranges' : 'No ranges')
    }
    if (filter.isShared !== undefined) {
      active.push(filter.isShared ? 'Shared' : 'Not shared')
    }
    if (filter.healthSystem) {
      active.push(`System: ${filter.healthSystem}`)
    }
    
    return active
  }

  return (
    <>
      <Box display="flex" alignItems="center" gap={1}>
        <Badge badgeContent={activeFilterCount} color="primary">
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setDrawerOpen(true)}
            variant={activeFilterCount > 0 ? 'contained' : 'outlined'}
          >
            Filters
          </Button>
        </Badge>
        
        {activeFilterCount > 0 && (
          <Stack direction="row" spacing={1}>
            {getActiveFilters().map((filterLabel, index) => (
              <Chip
                key={index}
                label={filterLabel}
                size="small"
                onDelete={clearAll}
              />
            ))}
          </Stack>
        )}
      </Box>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 320 } }}
      >
        <Box p={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setDrawerOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Type Filter */}
          <Accordion expanded={expanded === 'type'} onChange={handleAccordionChange('type')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Type</Typography>
              {filter.types?.length ? (
                <Chip
                  label={filter.types.length}
                  size="small"
                  sx={{ ml: 'auto', mr: 1 }}
                />
              ) : null}
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {ingredientTypes.map(type => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={filter.types?.includes(type) || false}
                        onChange={() => handleTypeChange(type)}
                      />
                    }
                    label={type}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          {/* Category Filter */}
          <Accordion expanded={expanded === 'category'} onChange={handleAccordionChange('category')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Category</Typography>
              {filter.categories?.length ? (
                <Chip
                  label={filter.categories.length}
                  size="small"
                  sx={{ ml: 'auto', mr: 1 }}
                />
              ) : null}
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {ingredientCategories.map(category => (
                  <FormControlLabel
                    key={category}
                    control={
                      <Checkbox
                        checked={filter.categories?.includes(category) || false}
                        onChange={() => handleCategoryChange(category)}
                      />
                    }
                    label={category}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          {/* Population Filter */}
          <Accordion expanded={expanded === 'population'} onChange={handleAccordionChange('population')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Population</Typography>
              {filter.populations?.length ? (
                <Chip
                  label={filter.populations.length}
                  size="small"
                  sx={{ ml: 'auto', mr: 1 }}
                />
              ) : null}
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {populationTypes.map(population => (
                  <FormControlLabel
                    key={population}
                    control={
                      <Checkbox
                        checked={filter.populations?.includes(population) || false}
                        onChange={() => handlePopulationChange(population)}
                      />
                    }
                    label={population}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          {/* Reference Ranges Filter */}
          <Accordion expanded={expanded === 'ranges'} onChange={handleAccordionChange('ranges')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Reference Ranges</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl>
                <RadioGroup
                  value={
                    filter.hasReferenceRanges === undefined 
                      ? 'all' 
                      : filter.hasReferenceRanges 
                        ? 'yes' 
                        : 'no'
                  }
                  onChange={handleReferenceRangeChange}
                >
                  <FormControlLabel value="all" control={<Radio />} label="All" />
                  <FormControlLabel value="yes" control={<Radio />} label="Has Ranges" />
                  <FormControlLabel value="no" control={<Radio />} label="No Ranges" />
                </RadioGroup>
              </FormControl>
            </AccordionDetails>
          </Accordion>

          {/* Shared Filter */}
          <Accordion expanded={expanded === 'shared'} onChange={handleAccordionChange('shared')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Shared Status</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl>
                <RadioGroup
                  value={
                    filter.isShared === undefined 
                      ? 'all' 
                      : filter.isShared 
                        ? 'yes' 
                        : 'no'
                  }
                  onChange={handleSharedChange}
                >
                  <FormControlLabel value="all" control={<Radio />} label="All" />
                  <FormControlLabel value="yes" control={<Radio />} label="Shared" />
                  <FormControlLabel value="no" control={<Radio />} label="Not Shared" />
                </RadioGroup>
              </FormControl>
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" gap={1}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearAll}
              disabled={activeFilterCount === 0}
            >
              Clear All
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setDrawerOpen(false)}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}