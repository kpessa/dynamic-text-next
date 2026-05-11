'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Container,
  Box,
  Paper,
  Grid,
  Typography,
  IconButton,
  Button,
  Chip,
  Stack,
  Drawer,
  useTheme,
  useMediaQuery,
  Fab,
  Snackbar
} from '@mui/material'
import {
  Add as AddIcon,
  Upload as ImportIcon,
  Download as ExportIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { useBreadcrumbs } from '@/features/ui/hooks/useBreadcrumbs'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  selectIngredientsByType,
  selectLoading,
  selectError,
  setIngredientsByType,
  updateIngredient,
  selectSelectedIngredientId,
  selectIngredient,
  setLoading,
  setError
} from '@/features/ingredient-management/store/variantSlice'
import { variantService } from '@/features/ingredient-management/lib/variantService'
import { IngredientDetailDrawer } from '@/features/ingredient-management/ui/IngredientDetailDrawer'
import { IngredientExportDialog } from '@/features/ingredient-management/ui/IngredientExportDialog'
import { ImportModalEnhanced } from '@/widgets/import-modal/ui/ImportModalEnhanced'
import { IngredientCardGrid } from '@/features/ingredient-management/ui/IngredientCardGrid'
import type { Ingredient } from '@/entities/ingredient/types'

export default function IngredientManagementPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useAppDispatch()
  
  // Redux state
  const ingredientsByType = useAppSelector(selectIngredientsByType)
  const selectedIngredientId = useAppSelector(selectSelectedIngredientId)
  const isLoading = useAppSelector(selectLoading)
  const error = useAppSelector(selectError)
  
  // Flatten ingredients from all types for display
  const ingredients = useMemo(() => {
    return Object.values(ingredientsByType).flat()
  }, [ingredientsByType])
  
  const selectedIngredients: string[] = selectedIngredientId ? [selectedIngredientId] : []
  
  // Local state
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
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

  // Load ingredients from Firebase on mount
  useEffect(() => {
    loadIngredientsFromFirebase()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadIngredientsFromFirebase = async () => {
    dispatch(setLoading(true))
    dispatch(setError(null))
    
    try {
      const ingredientsWithVariants = await variantService.fetchIngredientsWithVariants()
      dispatch(setIngredientsByType(ingredientsWithVariants))
      setSnackbarMessage(`Loaded ${Object.values(ingredientsWithVariants).flat().length} ingredients`)
    } catch (err) {
      console.error('Failed to load ingredients:', err)
      dispatch(setError(err instanceof Error ? err.message : 'Failed to load ingredients'))
      setSnackbarMessage('Failed to load ingredients')
    } finally {
      dispatch(setLoading(false))
    }
  }


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

  const handleIngredientClick = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient)
    setDetailDrawerOpen(true)
  }

  const handleIngredientSelect = (id: string, selected: boolean) => {
    // For now, only support single selection in variant system
    if (selected) {
      dispatch(selectIngredient(id))
    } else {
      dispatch(selectIngredient(null))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    // For now, only support single selection in variant system
    if (selected && filteredIngredients.length > 0) {
      dispatch(selectIngredient(filteredIngredients[0].id))
    } else {
      dispatch(selectIngredient(null))
    }
  }

  const handleDelete = (ids: string[]) => {
    // TODO: Implement delete for variant-based system
    setSnackbarMessage(`Delete not yet implemented for variant system`)
    dispatch(selectIngredient(null))
  }

  const handleExport = () => {
    setExportDialogOpen(true)
  }

  const handleImport = () => {
    setImportDialogOpen(true)
  }

  const handleRefresh = () => {
    loadIngredientsFromFirebase()
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


      {/* Main Content Area */}
      <Box sx={{ flex: 1 }}>
        <IngredientCardGrid
          onIngredientClick={handleIngredientClick}
          onEdit={(ingredient) => {
            setSelectedIngredient(ingredient)
            setDetailDrawerOpen(true)
          }}
          onDelete={(id) => handleDelete([id])}
        />
      </Box>

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

      {/* Import Modal */}
      <ImportModalEnhanced
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
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