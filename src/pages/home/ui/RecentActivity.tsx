import React from 'react'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Chip,
  Skeleton,
} from '@mui/material'
import {
  Calculate as CalculateIcon,
  Science as ScienceIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'
import type { TPNCalculation } from '@/entities/calculation'
import type { SimpleIngredient } from '@/entities/ingredient/types'

// Re-export types for backwards compatibility
export type { TPNCalculation } from '@/entities/calculation'
export type { SimpleIngredient as Ingredient } from '@/entities/ingredient/types'

interface RecentActivityProps {
  calculations?: TPNCalculation[]
  ingredients?: SimpleIngredient[]
  onCalculationClick?: (calc: TPNCalculation) => void
  onIngredientClick?: (ing: SimpleIngredient) => void
  loading?: boolean
  maxItems?: number
}

const getPopulationColor = (type: string) => {
  switch (type) {
    case 'NEO':
      return 'info'
    case 'CHILD':
      return 'warning'
    case 'ADULT':
      return 'success'
    default:
      return 'default'
  }
}

const formatDate = (date: Date | string) => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return 'Unknown date'
  }
}

export const RecentCalculations: React.FC<{
  calculations: TPNCalculation[]
  onClick?: (calc: TPNCalculation) => void
  loading?: boolean
  maxItems?: number
}> = ({ calculations, onClick, loading = false, maxItems = 5 }) => {
  const displayItems = calculations.slice(0, maxItems)

  if (loading) {
    return (
      <List>
        {[...Array(3)].map((_, i) => (
          <ListItem key={i}>
            <ListItemIcon>
              <Skeleton variant="circular" width={24} height={24} />
            </ListItemIcon>
            <ListItemText
              primary={<Skeleton variant="text" width="60%" />}
              secondary={<Skeleton variant="text" width="40%" />}
            />
          </ListItem>
        ))}
      </List>
    )
  }

  return (
    <List>
      {displayItems.map((calc) => (
        <ListItem key={calc.id} disablePadding>
          <ListItemButton onClick={() => onClick?.(calc)}>
            <ListItemIcon>
              <CalculateIcon />
            </ListItemIcon>
            <ListItemText
              primary={calc.patientName || `Patient ${calc.patientId}` || 'Unnamed Calculation'}
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography variant="caption" component="span">
                    {formatDate(calc.date)}
                  </Typography>
                  <Chip
                    label={calc.populationType}
                    size="small"
                    color={getPopulationColor(calc.populationType) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                    sx={{ height: 18, fontSize: '0.7rem' }}
                  />
                  {calc.status === 'draft' && (
                    <Chip
                      label="Draft"
                      size="small"
                      variant="outlined"
                      sx={{ height: 18, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}

export const RecentIngredients: React.FC<{
  ingredients: SimpleIngredient[]
  onClick?: (ing: SimpleIngredient) => void
  loading?: boolean
  maxItems?: number
}> = ({ ingredients, onClick, loading = false, maxItems = 10 }) => {
  const displayItems = ingredients.slice(0, maxItems)

  if (loading) {
    return (
      <List>
        {[...Array(3)].map((_, i) => (
          <ListItem key={i}>
            <ListItemIcon>
              <Skeleton variant="circular" width={24} height={24} />
            </ListItemIcon>
            <ListItemText
              primary={<Skeleton variant="text" width="60%" />}
              secondary={<Skeleton variant="text" width="40%" />}
            />
          </ListItem>
        ))}
      </List>
    )
  }

  return (
    <List>
      {displayItems.map((ing) => (
        <ListItem key={ing.id} disablePadding>
          <ListItemButton onClick={() => onClick?.(ing)}>
            <ListItemIcon>
              <ScienceIcon />
            </ListItemIcon>
            <ListItemText
              primary={ing.name}
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <TimeIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption" component="span">
                    {formatDate(ing.lastModified)}
                  </Typography>
                  {ing.category && (
                    <Chip
                      label={ing.category}
                      size="small"
                      variant="outlined"
                      sx={{ height: 18, fontSize: '0.7rem' }}
                    />
                  )}
                  {ing.isShared && (
                    <Chip
                      label="Shared"
                      size="small"
                      color="primary"
                      sx={{ height: 18, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  calculations = [],
  ingredients = [],
  onCalculationClick,
  onIngredientClick,
  loading = false,
  maxItems,
}) => {
  return (
    <Box>
      {calculations.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Recent Calculations
          </Typography>
          <RecentCalculations
            calculations={calculations}
            onClick={onCalculationClick}
            loading={loading}
            maxItems={maxItems}
          />
        </Box>
      )}
      
      {ingredients.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Recent Ingredients
          </Typography>
          <RecentIngredients
            ingredients={ingredients}
            onClick={onIngredientClick}
            loading={loading}
            maxItems={maxItems}
          />
        </Box>
      )}
    </Box>
  )
}