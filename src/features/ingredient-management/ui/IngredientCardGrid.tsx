'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Button,
  Stack,
  Avatar,
  Tooltip,
  TextField,
  InputAdornment,
  Divider,
  Badge
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import type { Ingredient } from '@/entities/ingredient/types'

interface IngredientCardGridProps {
  onIngredientClick?: (ingredient: Ingredient) => void
  onEdit?: (ingredient: Ingredient) => void
  onDelete?: (ingredientId: string) => void
}

const categoryColors: Record<string, string> = {
  macronutrient: '#4CAF50',
  micronutrient: '#2196F3',
  salt: '#FF9800',
  electrolyte: '#9C27B0',
  additive: '#F44336',
  diluent: '#00BCD4',
  other: '#607D8B'
}

const getCategoryColor = (category: string): string => {
  return categoryColors[category.toLowerCase()] || categoryColors.other
}

export const IngredientCardGrid: React.FC<IngredientCardGridProps> = ({
  onIngredientClick,
  onEdit,
  onDelete
}) => {
  const dispatch = useDispatch()
  
  // Import the selectors and actions directly in the component
  // This avoids FSD violation by not importing from app layer
  const { selectIngredientsByType, selectIngredient, selectSelectedIngredientId } = require('../store/variantSlice')
  
  const ingredientsByType = useSelector(selectIngredientsByType)
  const selectedIngredientId = useSelector(selectSelectedIngredientId)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter ingredients based on search and category
  const filterIngredients = (ingredients: Ingredient[]) => {
    return ingredients.filter(ing => {
      const matchesSearch = searchQuery === '' || 
        ing.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ing.keyname.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === null || 
        ing.category?.toLowerCase() === selectedCategory.toLowerCase()
      
      return matchesSearch && matchesCategory
    })
  }

  // Get all unique categories
  const allCategories = Array.from(new Set(
    Object.values(ingredientsByType)
      .flat()
      .map(ing => ing.category)
      .filter(Boolean)
  ))

  // Count total ingredients
  const totalIngredients = Object.values(ingredientsByType).flat().length

  // Count duplicates within each type
  const countDuplicates = (ingredients: Ingredient[]): number => {
    const seen = new Map<string, number>()
    let duplicates = 0
    
    ingredients.forEach(ing => {
      const key = ing.displayName.toLowerCase()
      const count = seen.get(key) || 0
      if (count === 1) duplicates++ // First duplicate
      if (count > 0) duplicates++ // Each additional occurrence
      seen.set(key, count + 1)
    })
    
    return duplicates
  }

  const handleIngredientSelect = (ingredient: Ingredient) => {
    dispatch(selectIngredient(ingredient.id))
    onIngredientClick?.(ingredient)
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="All"
                onClick={() => setSelectedCategory(null)}
                color={selectedCategory === null ? 'primary' : 'default'}
                variant={selectedCategory === null ? 'filled' : 'outlined'}
              />
              {allCategories.map(category => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => setSelectedCategory(category)}
                  color={selectedCategory === category ? 'primary' : 'default'}
                  variant={selectedCategory === category ? 'filled' : 'outlined'}
                  sx={{
                    borderColor: getCategoryColor(category),
                    '&.MuiChip-filled': {
                      bgcolor: getCategoryColor(category)
                    }
                  }}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Stats Bar */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <Chip label={`${totalIngredients} Total Ingredients`} size="small" />
          <Chip 
            label={`${allCategories.length} Categories`} 
            size="small" 
            color="primary" 
          />
        </Stack>
      </Box>

      {/* Ingredient Cards Grouped by Type */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {Object.entries(ingredientsByType).map(([type, ingredients]) => {
          const filteredIngredients = filterIngredients(ingredients)
          
          if (filteredIngredients.length === 0) return null
          
          const duplicateCount = countDuplicates(filteredIngredients)
          
          return (
            <Box key={type} sx={{ mb: 4 }}>
              {/* Type Header */}
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                  {type.replace(/([A-Z])/g, ' $1').trim()}
                </Typography>
                <Chip 
                  label={`${filteredIngredients.length} items`} 
                  size="small" 
                  variant="outlined" 
                />
                {duplicateCount > 0 && (
                  <Chip
                    label={`${duplicateCount} duplicates`}
                    size="small"
                    color="warning"
                    icon={<WarningIcon />}
                  />
                )}
              </Box>

              {/* Ingredient Cards Grid */}
              <Grid container spacing={2}>
                {filteredIngredients.map((ingredient) => {
                  const isSelected = selectedIngredientId === ingredient.id
                  const categoryColor = getCategoryColor(ingredient.category || 'other')
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={ingredient.id}>
                      <Card
                        sx={{
                          height: '100%',
                          cursor: 'pointer',
                          border: isSelected ? 2 : 1,
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-2px)'
                          }
                        }}
                        onClick={() => handleIngredientSelect(ingredient)}
                      >
                        <CardContent>
                          {/* Category Badge */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Chip
                              label={ingredient.category || 'uncategorized'}
                              size="small"
                              sx={{
                                bgcolor: categoryColor,
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                            {ingredient.isShared && (
                              <Chip label="Shared" size="small" color="info" />
                            )}
                          </Box>

                          {/* Ingredient Name */}
                          <Typography variant="h6" gutterBottom noWrap>
                            {ingredient.displayName}
                          </Typography>
                          
                          {/* Keyname */}
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            gutterBottom
                            sx={{ 
                              fontFamily: 'monospace',
                              fontSize: '0.85rem'
                            }}
                          >
                            {ingredient.keyname}
                          </Typography>

                          {/* Unit */}
                          {ingredient.unit && (
                            <Typography variant="body2" color="text.secondary">
                              Unit: {ingredient.unit}
                            </Typography>
                          )}

                          {/* Variants Count if applicable */}
                          {ingredient.variants && ingredient.variants.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={`${ingredient.variants.length} variants`}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            </Box>
                          )}

                          {/* Action Buttons */}
                          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEdit?.(ingredient)
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Duplicate">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // TODO: Implement duplicate
                                }}
                              >
                                <DuplicateIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDelete?.(ingredient.id)
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}