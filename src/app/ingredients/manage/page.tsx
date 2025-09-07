'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Container,
  Box,
  Paper,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Badge,
  Chip,
  Stack,
  Drawer,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
  Fab,
  Alert,
  Snackbar
} from '@mui/material'
import {
  ViewList as ListIcon,
  ViewModule as GridIcon,
  Add as AddIcon,
  Upload as ImportIcon,
  Download as ExportIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as DuplicateIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { useBreadcrumbs } from '@/features/ui/hooks/useBreadcrumbs'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  selectIngredients,
  selectLoadedIngredients,
  selectSelectedIngredients,
  selectIngredientLoading,
  selectIngredientError,
  setIngredients,
  deleteIngredient,
  setSelectedIngredients,
  clearSelectedIngredients
} from '@/entities/ingredient/model/ingredientSlice'
import { IngredientList } from '@/features/ingredient-management/ui/IngredientList'
import { IngredientGrid } from '@/features/ingredient-management/ui/IngredientGrid'
import { IngredientDetailDrawer } from '@/features/ingredient-management/ui/IngredientDetailDrawer'
import { IngredientFilterPanel } from '@/features/ingredient-management/ui/IngredientFilterPanel'
import { IngredientBulkActions } from '@/features/ingredient-management/ui/IngredientBulkActions'
import { IngredientSearchBar } from '@/features/ingredient-management/ui/IngredientSearchBar'
import { IngredientImportDialog } from '@/features/ingredient-management/ui/IngredientImportDialog'
import { IngredientExportDialog } from '@/features/ingredient-management/ui/IngredientExportDialog'
import type { Ingredient } from '@/entities/ingredient/types'

type ViewMode = 'list' | 'grid'

export default function IngredientManagementPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useAppDispatch()
  
  // Redux state
  const ingredients = useAppSelector(selectIngredients)
  const selectedIngredients = useAppSelector(selectSelectedIngredients)
  const isLoading = useAppSelector(selectIngredientLoading)
  const error = useAppSelector(selectIngredientError)
  
  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [duplicates, setDuplicates] = useState<string[]>([])
  
  // Breadcrumbs
  useBreadcrumbs([
    { label: 'Dashboard', href: '/' },
    { label: 'Ingredients', href: '/ingredients' },
    { label: 'Manage', href: '/ingredients/manage' }
  ])

  // Load ingredients on mount
  useEffect(() => {
    // In real app, this would fetch from Firebase
    loadMockIngredients()
  }, [])

  const loadMockIngredients = () => {
    // Mock data for development
    const mockIngredients: Ingredient[] = [
      {
        id: '1',
        keyname: 'calcium_gluconate',
        displayName: 'Calcium Gluconate 10%',
        category: 'electrolyte',
        unit: 'mEq',
        isShared: false,
        referenceRanges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        keyname: 'magnesium_sulfate',
        displayName: 'Magnesium Sulfate',
        category: 'electrolyte',
        unit: 'mEq',
        isShared: true,
        referenceRanges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      // Add more mock ingredients...
    ]
    dispatch(setIngredients(mockIngredients))
  }

  // Filter ingredients based on search and filters
  const filteredIngredients = useMemo(() => {
    let filtered = [...ingredients]
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(ing => 
        ing.displayName.toLowerCase().includes(query) ||
        ing.keyname.toLowerCase().includes(query) ||
        ing.category?.toLowerCase().includes(query)
      )
    }
    
    // Apply category filter
    if (activeFilters.categories?.length > 0) {
      filtered = filtered.filter(ing => 
        activeFilters.categories.includes(ing.category)
      )
    }
    
    // Apply shared filter
    if (activeFilters.showSharedOnly) {
      filtered = filtered.filter(ing => ing.isShared)
    }
    
    return filtered
  }, [ingredients, searchQuery, activeFilters])

  // Detect duplicates
  useEffect(() => {
    const duplicateIds: string[] = []
    const seen = new Map<string, string>()
    
    ingredients.forEach(ing => {
      const key = ing.displayName.toLowerCase()
      if (seen.has(key)) {
        duplicateIds.push(ing.id)
        const firstId = seen.get(key)
        if (firstId && !duplicateIds.includes(firstId)) {
          duplicateIds.push(firstId)
        }
      } else {
        seen.set(key, ing.id)
      }
    })
    
    setDuplicates(duplicateIds)
  }, [ingredients])

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode)
    }
  }

  const handleIngredientClick = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient)
    setDetailDrawerOpen(true)
  }

  const handleIngredientSelect = (id: string, selected: boolean) => {
    const currentSelected = [...selectedIngredients]
    if (selected && !currentSelected.includes(id)) {
      dispatch(setSelectedIngredients([...currentSelected, id]))
    } else if (!selected) {
      dispatch(setSelectedIngredients(currentSelected.filter(sid => sid !== id)))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      dispatch(setSelectedIngredients(filteredIngredients.map(ing => ing.id)))
    } else {
      dispatch(clearSelectedIngredients())
    }
  }

  const handleDelete = (ids: string[]) => {
    ids.forEach(id => dispatch(deleteIngredient(id)))
    setSnackbarMessage(`Deleted ${ids.length} ingredient${ids.length > 1 ? 's' : ''}`)
    dispatch(clearSelectedIngredients())
  }

  const handleExport = () => {
    setExportDialogOpen(true)
  }

  const handleImport = () => {
    setImportDialogOpen(true)
  }

  const handleRefresh = () => {
    loadMockIngredients()
    setSnackbarMessage('Ingredients refreshed')
  }

  const getStatistics = () => {
    const stats = {
      total: ingredients.length,
      shared: ingredients.filter(i => i.isShared).length,
      categories: new Set(ingredients.map(i => i.category)).size,
      duplicates: duplicates.length
    }
    return stats
  }

  const stats = getStatistics()

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Page Header */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              Ingredient Management
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={`${stats.total} Total`} size="small" />
              <Chip label={`${stats.shared} Shared`} size="small" color="primary" />
              <Chip label={`${stats.categories} Categories`} size="small" />
              {stats.duplicates > 0 && (
                <Chip 
                  label={`${stats.duplicates} Duplicates`} 
                  size="small" 
                  color="warning"
                  icon={<WarningIcon />}
                />
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack 
              direction="row" 
              spacing={1} 
              justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
              flexWrap="wrap"
              useFlexGap
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {/* TODO: Open add dialog */}}
              >
                Add Ingredient
              </Button>
              <Button
                variant="outlined"
                startIcon={<ImportIcon />}
                onClick={handleImport}
              >
                Import
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExport}
                disabled={selectedIngredients.length === 0 && ingredients.length === 0}
              >
                Export
              </Button>
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Search and Filter Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <IngredientSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search ingredients by name, key, or category..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
              >
                <ToggleButton value="list">
                  <Tooltip title="List View">
                    <ListIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="grid">
                  <Tooltip title="Grid View">
                    <GridIcon />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setFilterDrawerOpen(true)}
                sx={{ ml: 1 }}
              >
                Filters
                {Object.keys(activeFilters).length > 0 && (
                  <Badge
                    badgeContent={Object.keys(activeFilters).length}
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Bulk Actions Toolbar */}
      {selectedIngredients.length > 0 && (
        <IngredientBulkActions
          selectedCount={selectedIngredients.length}
          onDelete={() => handleDelete(selectedIngredients)}
          onExport={handleExport}
          onClearSelection={() => dispatch(clearSelectedIngredients())}
        />
      )}

      {/* Main Content Area */}
      <Grid container spacing={3}>
        {/* Category Sidebar (Desktop only) */}
        {!isMobile && (
          <Grid item md={2}>
            <Paper elevation={1} sx={{ p: 2, position: 'sticky', top: 80 }}>
              <Typography variant="h6" gutterBottom>
                Categories
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {/* Category filter list would go here */}
              <Stack spacing={1}>
                <Button 
                  size="small" 
                  fullWidth 
                  sx={{ justifyContent: 'flex-start' }}
                >
                  All Categories
                </Button>
                <Button 
                  size="small" 
                  fullWidth 
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Electrolytes
                </Button>
                <Button 
                  size="small" 
                  fullWidth 
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Macronutrients
                </Button>
                <Button 
                  size="small" 
                  fullWidth 
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Vitamins
                </Button>
              </Stack>
            </Paper>
          </Grid>
        )}

        {/* Ingredient List/Grid */}
        <Grid item xs={12} md={isMobile ? 12 : 10}>
          {filteredIngredients.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                {searchQuery || Object.keys(activeFilters).length > 0
                  ? 'No ingredients match your filters'
                  : 'No ingredients found'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
                onClick={() => {/* TODO: Open add dialog */}}
              >
                Add Your First Ingredient
              </Button>
            </Paper>
          ) : viewMode === 'list' ? (
            <IngredientList
              ingredients={filteredIngredients}
              selectedIds={selectedIngredients}
              duplicateIds={duplicates}
              onIngredientClick={handleIngredientClick}
              onIngredientSelect={handleIngredientSelect}
              onSelectAll={handleSelectAll}
              loading={isLoading}
            />
          ) : (
            <IngredientGrid
              ingredients={filteredIngredients}
              selectedIds={selectedIngredients}
              duplicateIds={duplicates}
              onIngredientClick={handleIngredientClick}
              onIngredientSelect={handleIngredientSelect}
              loading={isLoading}
            />
          )}
        </Grid>
      </Grid>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      >
        <Box sx={{ width: 350, p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <IngredientFilterPanel
            filters={activeFilters}
            onChange={setActiveFilters}
            onClear={() => setActiveFilters({})}
          />
        </Box>
      </Drawer>

      {/* Detail Drawer */}
      <IngredientDetailDrawer
        open={detailDrawerOpen}
        ingredient={selectedIngredient}
        onClose={() => {
          setDetailDrawerOpen(false)
          setSelectedIngredient(null)
        }}
        onEdit={(ingredient) => {
          // TODO: Open edit dialog
          console.log('Edit ingredient:', ingredient)
        }}
        onDelete={(id) => {
          handleDelete([id])
          setDetailDrawerOpen(false)
        }}
      />

      {/* Import Dialog */}
      <IngredientImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={(ingredients) => {
          // TODO: Import ingredients
          console.log('Import ingredients:', ingredients)
          setImportDialogOpen(false)
          setSnackbarMessage(`Imported ${ingredients.length} ingredients`)
        }}
      />

      {/* Export Dialog */}
      <IngredientExportDialog
        open={exportDialogOpen}
        ingredients={selectedIngredients.length > 0 
          ? ingredients.filter(i => selectedIngredients.includes(i.id))
          : ingredients}
        onClose={() => setExportDialogOpen(false)}
      />

      {/* Floating Action Button (Mobile) */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => {/* TODO: Open add dialog */}}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />
    </Container>
  )
}