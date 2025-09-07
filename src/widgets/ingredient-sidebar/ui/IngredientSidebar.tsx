/**
 * Ingredient Sidebar Widget
 * Displays ingredients grouped by type with search and drag-drop functionality
 */

import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  IconButton,
  Chip,
  Paper,
  Tooltip
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { selectIngredients as selectConfigIngredients } from '@/features/data-import'
import type { LoadedIngredient } from '@/shared/types/section'
import type { Ingredient } from '@/features/data-import/types/schemas'

// Map TPN configuration ingredients to the format expected by the sidebar
const mapIngredientsToSidebarFormat = (ingredients: Ingredient[]): LoadedIngredient[] => {
  return ingredients.map((ing, index) => {
    // Map TPN types to sidebar types
    let type: 'Macronutrient' | 'Micronutrient' | 'Additive' | 'Salt' | 'Diluent' | 'Other' = 'Other'
    
    switch (ing.TYPE) {
      case 'Macronutrient':
        type = 'Macronutrient'
        break
      case 'Electrolyte':
        type = 'Salt'
        break
      case 'Mineral':
      case 'Vitamin':
      case 'Trace Element':
        type = 'Micronutrient'
        break
      case 'Other':
      default:
        type = 'Additive'
        break
    }
    
    return {
      id: `${index + 1}`,
      name: ing.DISPLAY,
      keyname: ing.KEYNAME.toLowerCase(),
      type
    }
  })
}

// Mock ingredients as fallback when no configuration is loaded
const mockIngredients: LoadedIngredient[] = [
  // Macronutrients
  { id: '1', name: 'Dextrose', keyname: 'dextrose', type: 'Macronutrient' as const },
  { id: '2', name: 'Amino Acids', keyname: 'amino_acids', type: 'Macronutrient' as const },
  { id: '3', name: 'Lipids', keyname: 'lipids', type: 'Macronutrient' as const },
  { id: '4', name: 'Protein', keyname: 'protein', type: 'Macronutrient' as const },
  
  // Micronutrients
  { id: '5', name: 'Calcium', keyname: 'calcium', type: 'Micronutrient' as const },
  { id: '6', name: 'Magnesium', keyname: 'magnesium', type: 'Micronutrient' as const },
  { id: '7', name: 'Phosphorus', keyname: 'phosphorus', type: 'Micronutrient' as const },
  { id: '8', name: 'Zinc', keyname: 'zinc', type: 'Micronutrient' as const },
  { id: '9', name: 'Vitamin C', keyname: 'vitamin_c', type: 'Micronutrient' as const },
  { id: '10', name: 'Vitamin D', keyname: 'vitamin_d', type: 'Micronutrient' as const },
  
  // Additives
  { id: '11', name: 'Heparin', keyname: 'heparin', type: 'Additive' as const },
  { id: '12', name: 'Insulin', keyname: 'insulin', type: 'Additive' as const },
  { id: '13', name: 'Multivitamin', keyname: 'multivitamin', type: 'Additive' as const },
  
  // Salts
  { id: '14', name: 'Sodium Chloride', keyname: 'sodium_chloride', type: 'Salt' as const },
  { id: '15', name: 'Potassium Chloride', keyname: 'potassium_chloride', type: 'Salt' as const },
  { id: '16', name: 'Sodium Acetate', keyname: 'sodium_acetate', type: 'Salt' as const },
  
  // Diluents
  { id: '17', name: 'Sterile Water', keyname: 'sterile_water', type: 'Diluent' as const },
  { id: '18', name: 'Normal Saline', keyname: 'normal_saline', type: 'Diluent' as const }
]

const addIngredientToEditor = (ingredient: LoadedIngredient) => ({
  type: 'editor/addIngredientToEditor',
  payload: ingredient
})

export interface IngredientSidebarProps {
  onClose?: () => void
}

type IngredientType = 'Macronutrient' | 'Micronutrient' | 'Additive' | 'Salt' | 'Diluent' | 'Other'

const ingredientTypeColors: Record<IngredientType, string> = {
  Macronutrient: '#4caf50',
  Micronutrient: '#2196f3',
  Additive: '#ff9800',
  Salt: '#9c27b0',
  Diluent: '#00bcd4',
  Other: '#607d8b'
}

export const IngredientSidebar: React.FC<IngredientSidebarProps> = ({ onClose }) => {
  const dispatch = useAppDispatch()
  
  // Get ingredients from Redux configuration state, fallback to mock data
  const configIngredients = useAppSelector(selectConfigIngredients)
  const ingredients = configIngredients.length > 0 
    ? mapIngredientsToSidebarFormat(configIngredients)
    : mockIngredients
    
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Set<IngredientType>>(
    new Set(['Macronutrient', 'Micronutrient'])
  )

  // Group and filter ingredients
  const groupedIngredients = useMemo(() => {
    if (!ingredients || ingredients.length === 0) {
      return {} as Record<IngredientType, LoadedIngredient[]>
    }
    
    const filtered = ingredients.filter((ing: LoadedIngredient) =>
      ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ing.keyname?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const grouped = filtered.reduce((acc: Record<IngredientType, LoadedIngredient[]>, ingredient: LoadedIngredient) => {
      const type = ingredient.type || 'Other'
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(ingredient)
      return acc
    }, {} as Record<IngredientType, typeof ingredients>)

    // Sort each group alphabetically
    Object.keys(grouped).forEach(type => {
      grouped[type as IngredientType].sort((a: LoadedIngredient, b: LoadedIngredient) => a.name.localeCompare(b.name))
    })

    return grouped
  }, [ingredients, searchTerm])

  const handleAccordionChange = (type: IngredientType) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(type)) {
        newSet.delete(type)
      } else {
        newSet.add(type)
      }
      return newSet
    })
  }

  const handleDragStart = (e: React.DragEvent, ingredient: LoadedIngredient) => {
    e.dataTransfer.setData('ingredient', JSON.stringify(ingredient))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleIngredientClick = (ingredient: LoadedIngredient) => {
    dispatch(addIngredientToEditor(ingredient))
  }

  const ingredientTypes: IngredientType[] = [
    'Macronutrient',
    'Micronutrient',
    'Additive',
    'Salt',
    'Diluent',
    'Other'
  ]

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

      {/* Search */}
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

      {/* Ingredient Groups */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {ingredientTypes.map(type => {
          const ingredients = groupedIngredients[type] || []
          if (ingredients.length === 0 && searchTerm) return null

          return (
            <Accordion
              key={type}
              expanded={expandedGroups.has(type)}
              onChange={() => handleAccordionChange(type)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: ingredientTypeColors[type]
                    }}
                  />
                  <Typography sx={{ flex: 1 }}>{type}</Typography>
                  <Chip
                    label={ingredients.length}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List dense>
                  {ingredients.map((ingredient: LoadedIngredient) => (
                    <ListItem
                      key={ingredient.id || ingredient.name}
                      draggable
                      onDragStart={(e) => handleDragStart(e, ingredient)}
                      sx={{
                        cursor: 'grab',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        },
                        '&:active': {
                          cursor: 'grabbing'
                        }
                      }}
                    >
                      <DragIndicatorIcon 
                        sx={{ 
                          mr: 1, 
                          color: 'text.secondary',
                          fontSize: 18
                        }} 
                      />
                      <ListItemText
                        primary={ingredient.name}
                        secondary={ingredient.keyname}
                        primaryTypographyProps={{
                          variant: 'body2'
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption'
                        }}
                      />
                      <Tooltip title="Add to editor">
                        <IconButton
                          size="small"
                          onClick={() => handleIngredientClick(ingredient)}
                        >
                          <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )
        })}
      </Box>

      {/* Footer Info */}
      <Paper sx={{ p: 1.5, mt: 2 }} variant="outlined">
        <Typography variant="caption" color="text.secondary">
          Drag ingredients to editor or click + to insert
        </Typography>
      </Paper>
    </Box>
  )
}