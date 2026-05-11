import React, { useState, useCallback, useMemo } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  Tooltip,
  Paper,
  Drawer,
} from '@mui/material'
import {
  ExpandMore,
  ChevronRight,
  Science,
  CheckCircle,
  Warning,
  Error,
  Sync,
  SyncProblem,
  Schedule,
  Person,
  LocalHospital,
} from '@mui/icons-material'
import { AccordionWithBadges } from '@/shared/ui/molecules/Accordion'
import type { AccordionItem } from '@/shared/ui/molecules/Accordion'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { 
  selectIngredientsByType, 
  selectExpandedTypes,
  selectExpandedIngredients,
  toggleTypeExpansion,
  toggleIngredientExpansion,
  selectIngredientVariant,
  Ingredient,
  IngredientVariant,
} from '../store/variantSlice'
import { setSelectedIngredient } from '@/shared/model/selectedIngredientModel'
import { IngredientDetailsPanel } from './IngredientDetailsPanel'

interface IngredientVariantManagerProps {
  onVariantSelect?: (variantId: string) => void
  searchTerm?: string
}

const populationIcons: Record<string, string> = {
  NEO: '👶',
  CHILD: '👧',
  ADOLESCENT: '🧑',
  ADULT: '👨',
}

const getValidationStatusIcon = (status: string) => {
  switch (status) {
    case 'valid':
      return <CheckCircle color="success" fontSize="small" />
    case 'warning':
      return <Warning color="warning" fontSize="small" />
    case 'error':
      return <Error color="error" fontSize="small" />
    default:
      return <Schedule color="disabled" fontSize="small" />
  }
}

const getSyncStatusIcon = (status: string) => {
  switch (status) {
    case 'synced':
      return <Sync color="success" fontSize="small" />
    case 'conflict':
      return <SyncProblem color="error" fontSize="small" />
    case 'outdated':
      return <Warning color="warning" fontSize="small" />
    default:
      return <Schedule color="disabled" fontSize="small" />
  }
}

const getTestStatusColor = (passed: number, total: number): 'success' | 'error' | 'warning' | 'default' => {
  if (total === 0) return 'default'
  if (passed === total) return 'success'
  if (passed === 0) return 'error'
  return 'warning'
}

export const IngredientVariantManager: React.FC<IngredientVariantManagerProps> = ({ 
  onVariantSelect,
  searchTerm = '' 
}) => {
  const [localSelectedIngredient, setLocalSelectedIngredient] = useState<Ingredient | null>(null)
  const [showDetailsPanel, setShowDetailsPanel] = useState(false)
  const dispatch = useAppDispatch()
  const ingredientsByType = useAppSelector(selectIngredientsByType)
  const expandedTypes = useAppSelector(selectExpandedTypes)
  const expandedIngredients = useAppSelector(selectExpandedIngredients)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  const handleTypeToggle = useCallback((type: string) => {
    dispatch(toggleTypeExpansion(type))
  }, [dispatch])

  const handleIngredientToggle = useCallback((ingredientId: string) => {
    dispatch(toggleIngredientExpansion(ingredientId))
  }, [dispatch])
  
  const handleIngredientClick = useCallback((ingredient: Ingredient) => {
    try {
      // Map variant slice ingredient to entity ingredient format
      // Handle potential undefined type safely
      const ingredientType = ingredient.type || 'Other'
      const category = ingredientType.toLowerCase() === 'macronutrient' ? 'macro' :
                       ingredientType.toLowerCase() === 'micronutrient' ? 'micro' :
                       ingredientType.toLowerCase() as any || 'other'
      
      const entityIngredient = {
        id: ingredient.id,
        keyname: ingredient.keyname,
        displayName: ingredient.displayName || ingredient.display || ingredient.name || '',
        mnemonic: ingredient.mnemonic,
        type: ingredientType,
        category: category,
        unit: ingredient.uomDisp || '',
        referenceRanges: ingredient.referenceRanges || [],
        isShared: false,
        notes: ingredient.notes,
        sections: ingredient.sections || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // Dispatch to shared model for other widgets to pick up
      dispatch(setSelectedIngredient(entityIngredient as any))
      // Keep local state for highlighting
      setLocalSelectedIngredient(ingredient)
      // Show the details panel
      setShowDetailsPanel(true)
    } catch (error) {
      console.error('Error in handleIngredientClick:', error)
    }
  }, [dispatch])

  const handleVariantSelect = useCallback((variantId: string) => {
    setSelectedVariantId(variantId)
    dispatch(selectIngredientVariant(variantId))
    onVariantSelect?.(variantId)
  }, [dispatch, onVariantSelect])

  // Filter and deduplicate ingredients based on search term and keyname
  const filterAndDeduplicateIngredients = (ingredients: Ingredient[]) => {
    // First deduplicate by keyname
    const deduplicatedMap = new Map<string, Ingredient>()
    ingredients.forEach(ing => {
      const keyname = ing.keyname || ing.id
      if (!deduplicatedMap.has(keyname)) {
        deduplicatedMap.set(keyname, ing)
      } else {
        // Merge variants from duplicate ingredients - create new object to avoid mutation
        const existing = deduplicatedMap.get(keyname)!
        deduplicatedMap.set(keyname, {
          ...existing,
          variants: [...existing.variants, ...ing.variants],
          hasSyncConflicts: existing.hasSyncConflicts || ing.hasSyncConflicts
        })
      }
    })
    
    const deduplicated = Array.from(deduplicatedMap.values())
    
    // Then filter by search term if provided
    if (!searchTerm) return deduplicated
    
    const lowerSearch = searchTerm.toLowerCase()
    return deduplicated.filter(ing => {
      const displayName = (ing.displayName || ing.display || ing.name || '').toLowerCase()
      const keyname = (ing.keyname || ing.id || '').toLowerCase()
      return displayName.includes(lowerSearch) || keyname.includes(lowerSearch)
    })
  }

  // Define the order of ingredient types
  const typeOrder = ['Macronutrient', 'Micronutrient', 'Salt', 'Additive', 'Diluent', 'Other']
  const ingredientTypes = Object.keys(ingredientsByType)
    .sort((a, b) => {
      const indexA = typeOrder.indexOf(a)
      const indexB = typeOrder.indexOf(b)
      // If both are in the order list, sort by their position
      if (indexA !== -1 && indexB !== -1) return indexA - indexB
      // If only one is in the list, prioritize it
      if (indexA !== -1) return -1
      if (indexB !== -1) return 1
      // Otherwise sort alphabetically
      return a.localeCompare(b)
    }) as Array<keyof typeof ingredientsByType>

  // Create accordion items for each ingredient type
  const accordionItems = useMemo(() => {
    return ingredientTypes
      .map((type) => {
        const allIngredients = ingredientsByType[type] || []
        const ingredients = filterAndDeduplicateIngredients(allIngredients)
        
        // Skip this type if no ingredients match the search
        if (searchTerm && ingredients.length === 0) return null
        
        const typeHasConflicts = ingredients.some((ing: Ingredient) => ing.hasSyncConflicts)
        
        // Sort ingredients by keyname within each type
        const sortedIngredients = [...ingredients].sort((a, b) => {
          const keynameA = a.keyname || a.id || ''
          const keynameB = b.keyname || b.id || ''
          return keynameA.localeCompare(keynameB)
        })
        
        return {
          id: type,
          title: type,
          content: (
            <List component="div" disablePadding>
              {sortedIngredients.map((ingredient: Ingredient) => {
                const passedTests = ingredient.tests?.filter((t: any) => t.enabled).length || 0
                const totalTests = ingredient.tests?.length || 0
                const isSelected = localSelectedIngredient?.id === ingredient.id
                
                return (
                  <ListItemButton
                    key={ingredient.id}
                    onClick={() => handleIngredientClick(ingredient)}
                    selected={isSelected}
                    sx={{ 
                      pl: 2,
                      borderRadius: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'action.selected',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Science fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {ingredient.displayName || ingredient.display || ingredient.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ingredient.keyname || ingredient.id}
                            </Typography>
                          </Box>
                          {ingredient.variants && ingredient.variants.length > 0 && (
                            <Chip 
                              label={`${ingredient.variants.length} variants`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          {passedTests > 0 && (
                            <Chip 
                              label={`${passedTests}/${totalTests}`}
                              size="small"
                              color={getTestStatusColor(passedTests, totalTests)}
                              variant="outlined"
                            />
                          )}
                          {ingredient.hasSyncConflicts && getSyncStatusIcon('conflict')}
                        </Stack>
                      }
                    />
                  </ListItemButton>
                )
              })}
            </List>
          ),
          icon: typeHasConflicts ? (
            <Tooltip title="Some ingredients have sync conflicts">
              <SyncProblem color="warning" fontSize="small" />
            </Tooltip>
          ) : null,
        } as AccordionItem
      })
      .filter(Boolean) as AccordionItem[]
  }, [ingredientsByType, searchTerm, expandedIngredients, selectedVariantId, dispatch, onVariantSelect])

  // Create badges object for accordion
  const badges = useMemo(() => {
    const badgeObj: Record<string, number> = {}
    ingredientTypes.forEach(type => {
      const allIngredients = ingredientsByType[type] || []
      const ingredients = filterAndDeduplicateIngredients(allIngredients)
      if (!searchTerm || ingredients.length > 0) {
        badgeObj[type] = ingredients.length
      }
    })
    return badgeObj
  }, [ingredientsByType, searchTerm, ingredientTypes])

  return (
    <>
      <Paper elevation={0} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Ingredient Variants
        </Typography>
        
        <AccordionWithBadges
          items={accordionItems}
          badges={badges}
          expanded={expandedTypes}
          onChange={handleTypeToggle}
          multiple={true}
          variant="outlined"
        />
      </Paper>
      
      {/* Ingredient Details Drawer */}
      <Drawer
        anchor="right"
        open={showDetailsPanel}
        onClose={() => setShowDetailsPanel(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 400, md: 500 },
            maxWidth: '90vw'
          }
        }}
      >
        <IngredientDetailsPanel
          ingredient={localSelectedIngredient}
          onClose={() => setShowDetailsPanel(false)}
          onVariantSelect={(variant) => {
            handleVariantSelect(variant.id)
          }}
        />
      </Drawer>
    </>
  )
}

export default IngredientVariantManager