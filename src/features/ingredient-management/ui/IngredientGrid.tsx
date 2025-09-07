import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Checkbox,
  IconButton,
  Chip,
  Box,
  Skeleton,
  Tooltip,
  Stack,
  Badge
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Share as ShareIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import type { Ingredient } from '@/entities/ingredient/types'

interface IngredientGridProps {
  ingredients: Ingredient[]
  selectedIds: string[]
  duplicateIds: string[]
  onIngredientClick: (ingredient: Ingredient) => void
  onIngredientSelect: (id: string, selected: boolean) => void
  loading?: boolean
}

export const IngredientGrid: React.FC<IngredientGridProps> = ({
  ingredients,
  selectedIds,
  duplicateIds,
  onIngredientClick,
  onIngredientSelect,
  loading = false
}) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      electrolyte: 'primary',
      macro: 'secondary',
      micro: 'info',
      vitamin: 'success',
      trace: 'warning',
      other: 'default'
    }
    return colors[category] || 'default'
  }

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" />
                <Box mt={2}>
                  <Skeleton variant="rectangular" height={40} />
                </Box>
              </CardContent>
              <CardActions>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="circular" width={40} height={40} />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <Grid container spacing={2}>
      {ingredients.map((ingredient) => {
        const isSelected = selectedIds.includes(ingredient.id)
        const isDuplicate = duplicateIds.includes(ingredient.id)

        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={ingredient.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: isSelected ? 2 : 1,
                borderColor: isSelected ? 'primary.main' : 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {/* Selection Checkbox */}
              <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => onIngredientSelect(ingredient.id, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
              </Box>

              {/* Duplicate Warning Badge */}
              {isDuplicate && (
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                  <Tooltip title="Potential duplicate detected">
                    <Badge color="warning">
                      <WarningIcon color="warning" />
                    </Badge>
                  </Tooltip>
                </Box>
              )}

              <CardContent 
                sx={{ 
                  flexGrow: 1, 
                  cursor: 'pointer',
                  pt: 5 
                }}
                onClick={() => onIngredientClick(ingredient)}
              >
                <Typography variant="h6" gutterBottom noWrap>
                  {ingredient.displayName}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {ingredient.keyname}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1 }}>
                  <Chip
                    label={ingredient.category}
                    size="small"
                    color={getCategoryColor(ingredient.category) as any}
                  />
                  {ingredient.isShared && (
                    <Chip
                      icon={<ShareIcon />}
                      label="Shared"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>

                <Typography variant="caption" color="text.secondary">
                  Unit: {ingredient.unit}
                </Typography>

                {ingredient.referenceRanges && ingredient.referenceRanges.length > 0 && (
                  <Box mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      {ingredient.referenceRanges.length} reference range{ingredient.referenceRanges.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                <Box>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        onIngredientClick(ingredient)
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
                        // TODO: Handle duplicate
                      }}
                    >
                      <DuplicateIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Tooltip title="Delete">
                  <IconButton 
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: Handle delete
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}