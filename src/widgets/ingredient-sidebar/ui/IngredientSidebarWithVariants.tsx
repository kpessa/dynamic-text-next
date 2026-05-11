/**
 * Enhanced Ingredient Sidebar Widget with Variant Management
 * Displays ingredients grouped by type with variant expansion support
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import ViewList from '@mui/icons-material/ViewList'
import AccountTree from '@mui/icons-material/AccountTree'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { IngredientVariantManager } from '@/features/ingredient-management/ui/IngredientVariantManager'
import { 
  selectLoading,
  selectError,
  setIngredientsByType,
  setLoading,
  setError,
} from '@/features/ingredient-management/store/variantSlice'
import { variantService } from '@/features/ingredient-management/lib/variantService'
import { IngredientSidebar } from './IngredientSidebar'

export interface IngredientSidebarWithVariantsProps {
  onClose?: () => void
  onVariantSelect?: (variantId: string) => void
}

type ViewMode = 'simple' | 'variants'

export const IngredientSidebarWithVariants: React.FC<IngredientSidebarWithVariantsProps> = ({ 
  onClose,
  onVariantSelect 
}) => {
  const dispatch = useAppDispatch()
  const loading = useAppSelector(selectLoading)
  const error = useAppSelector(selectError)
  
  const [viewMode, setViewMode] = useState<ViewMode>('variants')
  const [searchTerm, setSearchTerm] = useState('')
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // Load variant data when switching to variants view
  useEffect(() => {
    const loadVariantData = async () => {
      if (viewMode === 'variants' && !isDataLoaded) {
        dispatch(setLoading(true))
        dispatch(setError(null))
        
        try {
          const ingredientsWithVariants = await variantService.fetchIngredientsWithVariants()
          dispatch(setIngredientsByType(ingredientsWithVariants))
          setIsDataLoaded(true)
        } catch (err) {
          console.error('Failed to load variant data:', err)
          dispatch(setError(err instanceof Error ? err.message : 'Failed to load variant data'))
        } finally {
          dispatch(setLoading(false))
        }
      }
    }
    
    loadVariantData()
  }, [viewMode, isDataLoaded, dispatch])

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode)
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Ingredients
        </Typography>
        {onClose && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* View Mode Toggle - Hidden since we only use variant view */}
      {/* Keeping the toggle code commented in case we want to re-enable it later
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          fullWidth
        >
          <ToggleButton value="simple">
            <ViewList sx={{ mr: 1 }} />
            Simple View
          </ToggleButton>
          <ToggleButton value="variants">
            <AccountTree sx={{ mr: 1 }} />
            Variant View
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      */}

      {/* Search - Now available in variant view */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search ingredients..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setSearchTerm('')}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      {/* Content Area */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {viewMode === 'simple' ? (
          // Simple view - existing ingredient list
          <Box sx={{ height: '100%' }}>
            <IngredientSidebar onClose={undefined} />
          </Box>
        ) : (
          // Variant view - new hierarchical view
          <>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {!loading && !error && (
              <IngredientVariantManager 
                onVariantSelect={onVariantSelect}
                searchTerm={searchTerm}
              />
            )}
          </>
        )}
      </Box>

      {/* Footer Info */}
      <Paper sx={{ p: 1.5, mt: 2 }} variant="outlined">
        <Typography variant="caption" color="text.secondary">
          Expand categories to view ingredients with displayName and keyname
        </Typography>
      </Paper>
    </Box>
  )
}

export default IngredientSidebarWithVariants