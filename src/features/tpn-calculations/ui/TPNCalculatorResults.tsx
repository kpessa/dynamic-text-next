import React, { useState } from 'react'
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  LinearProgress
} from '@mui/material'
import {
  TableChart as TableIcon,
  BarChart as ChartIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import type { TPNValues } from '@/entities/tpn'

interface TPNCalculatorResultsProps {
  results: TPNValues
}

interface NutrientInfo {
  name: string
  value: number
  unit: string
  category: 'macro' | 'electrolyte' | 'mineral'
  normalRange?: { min: number; max: number }
  percentOfTotal?: number
}

export const TPNCalculatorResults: React.FC<TPNCalculatorResultsProps> = ({ results }) => {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'table' | 'chart' | null) => {
    if (newMode !== null) {
      setViewMode(newMode)
    }
  }

  const nutrients: NutrientInfo[] = [
    // Macronutrients
    {
      name: 'Total Calories',
      value: results.calories,
      unit: 'kcal/day',
      category: 'macro',
      normalRange: { min: 80, max: 120 } // kcal/kg/day for neonates
    },
    {
      name: 'Protein',
      value: results.protein,
      unit: 'g/day',
      category: 'macro',
      percentOfTotal: (results.protein * 4) / results.calories * 100
    },
    {
      name: 'Carbohydrates',
      value: results.carbohydrates,
      unit: 'g/day',
      category: 'macro',
      percentOfTotal: (results.carbohydrates * 4) / results.calories * 100
    },
    {
      name: 'Lipids',
      value: results.lipids,
      unit: 'g/day',
      category: 'macro',
      percentOfTotal: (results.lipids * 9) / results.calories * 100
    },
    // Electrolytes
    {
      name: 'Sodium',
      value: results.sodium,
      unit: 'mEq/day',
      category: 'electrolyte',
      normalRange: { min: 2, max: 5 } // mEq/kg/day
    },
    {
      name: 'Potassium',
      value: results.potassium,
      unit: 'mEq/day',
      category: 'electrolyte',
      normalRange: { min: 2, max: 4 } // mEq/kg/day
    },
    {
      name: 'Calcium',
      value: results.calcium,
      unit: 'mEq/day',
      category: 'electrolyte',
      normalRange: { min: 0.5, max: 3 } // mEq/kg/day
    },
    // Minerals
    {
      name: 'Magnesium',
      value: results.magnesium,
      unit: 'mEq/day',
      category: 'mineral',
      normalRange: { min: 0.3, max: 0.5 } // mEq/kg/day
    },
    {
      name: 'Phosphorus',
      value: results.phosphorus,
      unit: 'mmol/day',
      category: 'mineral',
      normalRange: { min: 1, max: 2 } // mmol/kg/day
    }
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'macro': return 'primary'
      case 'electrolyte': return 'info'
      case 'mineral': return 'warning'
      default: return 'default'
    }
  }

  const getStatusIcon = (value: number, normalRange?: { min: number; max: number }) => {
    if (!normalRange) return null
    
    // Simplified check - in real app would need to consider weight
    if (value >= normalRange.min && value <= normalRange.max * 10) {
      return <CheckIcon color="success" fontSize="small" />
    }
    return <WarningIcon color="warning" fontSize="small" />
  }

  const renderTableView = () => (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Component</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Value</TableCell>
            <TableCell align="right">Unit</TableCell>
            <TableCell align="center">% of Calories</TableCell>
            <TableCell align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {nutrients.map((nutrient) => (
            <TableRow key={nutrient.name} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={nutrient.category === 'macro' ? 600 : 400}>
                  {nutrient.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={nutrient.category}
                  size="small"
                  color={getCategoryColor(nutrient.category) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={600}>
                  {nutrient.value.toFixed(nutrient.name === 'Magnesium' ? 2 : 1)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" color="text.secondary">
                  {nutrient.unit}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {nutrient.percentOfTotal ? (
                  <Box>
                    <Typography variant="body2">
                      {nutrient.percentOfTotal.toFixed(1)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(nutrient.percentOfTotal, 100)}
                      sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </TableCell>
              <TableCell align="center">
                {getStatusIcon(nutrient.value, nutrient.normalRange)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const renderChartView = () => {
    // Calculate macronutrient distribution
    const totalCalories = results.calories
    const proteinCalories = results.protein * 4
    const carbCalories = results.carbohydrates * 4
    const lipidCalories = results.lipids * 9

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Macronutrient Distribution
        </Typography>
        
        <Stack spacing={2}>
          {/* Protein */}
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2">Protein</Typography>
              <Typography variant="body2" fontWeight={600}>
                {((proteinCalories / totalCalories) * 100).toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(proteinCalories / totalCalories) * 100}
              sx={{ height: 24, borderRadius: 2 }}
              color="primary"
            />
          </Box>

          {/* Carbohydrates */}
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2">Carbohydrates</Typography>
              <Typography variant="body2" fontWeight={600}>
                {((carbCalories / totalCalories) * 100).toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(carbCalories / totalCalories) * 100}
              sx={{ height: 24, borderRadius: 2 }}
              color="info"
            />
          </Box>

          {/* Lipids */}
          <Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2">Lipids</Typography>
              <Typography variant="body2" fontWeight={600}>
                {((lipidCalories / totalCalories) * 100).toFixed(1)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(lipidCalories / totalCalories) * 100}
              sx={{ height: 24, borderRadius: 2 }}
              color="warning"
            />
          </Box>
        </Stack>

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Electrolyte Balance
          </Typography>
          <Grid container spacing={2}>
            {nutrients.filter(n => n.category === 'electrolyte').map(nutrient => (
              <Grid item xs={12} md={4} key={nutrient.name}>
                <Paper sx={{ p: 2, textAlign: 'center' }} elevation={0} variant="outlined">
                  <Typography variant="subtitle2" color="text.secondary">
                    {nutrient.name}
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {nutrient.value.toFixed(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {nutrient.unit}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      {/* View Mode Toggle */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">
          Calculation Results
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="table">
            <Tooltip title="Table View">
              <TableIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="chart">
            <Tooltip title="Chart View">
              <ChartIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Content based on view mode */}
      {viewMode === 'table' ? renderTableView() : renderChartView()}

      {/* Additional Information */}
      <Box mt={3} p={2} bgcolor="background.default" borderRadius={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <InfoIcon color="info" fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            Values are calculated based on the selected population type and patient parameters.
            Consult with healthcare provider for final prescription adjustments.
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}