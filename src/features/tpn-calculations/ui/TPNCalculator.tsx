import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material'
import {
  Calculate as CalculateIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  setAdvisorType,
  calculateValues,
  clearCalculation,
  addWarning,
  clearWarnings,
  selectAdvisorType,
  selectCalculationResults,
  selectCalculationWarnings,
  selectCalculationLoading
} from '../model/tpnSlice'
import { MockMe } from '../lib/calculator'
import { getCalculationForAdvisor, isValueInRange } from '../config/advisors'
import type { TPNAdvisorType, TPNValues } from '@/entities/tpn'

export const TPNCalculator: React.FC = () => {
  const dispatch = useAppDispatch()
  const advisorType = useAppSelector(selectAdvisorType)
  const results = useAppSelector(selectCalculationResults)
  const warnings = useAppSelector(selectCalculationWarnings)
  const loading = useAppSelector(selectCalculationLoading)

  const [patientData, setPatientData] = useState({
    weight: '',
    height: '',
    age: ''
  })

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPatientData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleAdvisorChange = (event: any) => {
    dispatch(setAdvisorType(event.target.value as TPNAdvisorType))
  }

  const handleCalculate = async () => {
    dispatch(clearWarnings())

    const weight = parseFloat(patientData.weight)
    const height = parseFloat(patientData.height) || 0
    const age = parseFloat(patientData.age) || 0

    if (isNaN(weight) || weight <= 0) {
      dispatch(addWarning('Please enter a valid weight'))
      return
    }

    const context = {
      weight,
      height,
      age
    }

    const mockMe = new MockMe(context, advisorType)
    const calculatedValues: TPNValues = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      lipids: 0,
      sodium: 0,
      potassium: 0,
      calcium: 0,
      magnesium: 0,
      phosphorus: 0
    }

    for (const key of Object.keys(calculatedValues)) {
      const formula = getCalculationForAdvisor(advisorType, key)
      if (formula) {
        calculatedValues[key] = mockMe.calculate(formula)
        
        if (!isValueInRange(calculatedValues[key], advisorType, key)) {
          dispatch(addWarning(`${key} value may be outside recommended range`))
        }
      }
    }

    await dispatch(calculateValues(calculatedValues))
  }

  const handleClear = () => {
    dispatch(clearCalculation())
    setPatientData({
      weight: '',
      height: '',
      age: ''
    })
  }

  const handleExport = () => {
    if (!results) return

    const exportData = {
      advisorType,
      patientData,
      results,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tpn-calculation-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          TPN Calculator
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="advisor-type-label">Advisor Type</InputLabel>
              <Select
                labelId="advisor-type-label"
                id="advisor-type"
                value={advisorType}
                label="Advisor Type"
                onChange={handleAdvisorChange}
              >
                <MenuItem value="NEO">Neonatal/Infant (NEO)</MenuItem>
                <MenuItem value="CHILD">Child</MenuItem>
                <MenuItem value="ADOLESCENT">Adolescent</MenuItem>
                <MenuItem value="ADULT">Adult</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              margin="normal"
              label="Weight (kg)"
              type="number"
              value={patientData.weight}
              onChange={handleInputChange('weight')}
              inputProps={{ min: 0, step: 0.1 }}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              margin="normal"
              label="Height (cm)"
              type="number"
              value={patientData.height}
              onChange={handleInputChange('height')}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              margin="normal"
              label="Age (years)"
              type="number"
              value={patientData.age}
              onChange={handleInputChange('age')}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CalculateIcon />}
                onClick={handleCalculate}
                disabled={loading || !patientData.weight}
              >
                Calculate TPN
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ClearIcon />}
                onClick={handleClear}
              >
                Clear
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                disabled={!results}
              >
                Export
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {warnings.length > 0 && (
          <Box mt={3}>
            {warnings.map((warning, index) => (
              <Alert key={index} severity="warning" icon={<WarningIcon />} sx={{ mb: 1 }}>
                Warning: {warning}
              </Alert>
            ))}
          </Box>
        )}

        {results && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Component</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">Unit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Calories</TableCell>
                    <TableCell align="right">{results.calories.toFixed(0)}</TableCell>
                    <TableCell align="right">kcal/day</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Protein</TableCell>
                    <TableCell align="right">{results.protein.toFixed(1)}</TableCell>
                    <TableCell align="right">g/day</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Carbohydrates</TableCell>
                    <TableCell align="right">{results.carbohydrates.toFixed(1)}</TableCell>
                    <TableCell align="right">g/day</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Lipids</TableCell>
                    <TableCell align="right">{results.lipids.toFixed(1)}</TableCell>
                    <TableCell align="right">g/day</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sodium</TableCell>
                    <TableCell align="right">{results.sodium.toFixed(1)}</TableCell>
                    <TableCell align="right">mEq/day</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Potassium</TableCell>
                    <TableCell align="right">{results.potassium.toFixed(1)}</TableCell>
                    <TableCell align="right">mEq/day</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Calcium</TableCell>
                    <TableCell align="right">{results.calcium.toFixed(1)}</TableCell>
                    <TableCell align="right">mEq/day</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Magnesium</TableCell>
                    <TableCell align="right">{results.magnesium.toFixed(2)}</TableCell>
                    <TableCell align="right">mEq/day</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Phosphorus</TableCell>
                    <TableCell align="right">{results.phosphorus.toFixed(1)}</TableCell>
                    <TableCell align="right">mmol/day</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}