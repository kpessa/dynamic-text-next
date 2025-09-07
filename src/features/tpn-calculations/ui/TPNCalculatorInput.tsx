import React, { useState } from 'react'
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Stack,
  Alert,
  Chip
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Calculate as CalculateIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  MonitorWeight as WeightIcon,
  Height as HeightIcon,
  CalendarMonth as AgeIcon
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  setAdvisorType,
  calculateValues,
  clearCalculation,
  addWarning,
  clearWarnings,
  selectAdvisorType,
  selectCalculationLoading
} from '../model/tpnSlice'
import { MockMe } from '../lib/calculator'
import { getCalculationForAdvisor, isValueInRange } from '../config/advisors'
import type { TPNAdvisorType, TPNValues } from '@/entities/tpn'

interface PatientData {
  weight: string
  height: string
  age: string
  gender?: 'male' | 'female'
  activityLevel?: 'sedentary' | 'moderate' | 'active'
  stressFactors?: string[]
}

export const TPNCalculatorInput: React.FC = () => {
  const dispatch = useAppDispatch()
  const advisorType = useAppSelector(selectAdvisorType)
  const loading = useAppSelector(selectCalculationLoading)

  const [patientData, setPatientData] = useState<PatientData>({
    weight: '',
    height: '',
    age: '',
    gender: undefined,
    activityLevel: 'moderate',
    stressFactors: []
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [expanded, setExpanded] = useState<string | false>('basic')

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  const handleInputChange = (field: keyof PatientData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }

    // Real-time validation
    validateField(field, value)
  }

  const validateField = (field: string, value: string) => {
    const errors: Record<string, string> = {}

    if (field === 'weight') {
      const weight = parseFloat(value)
      if (value && (isNaN(weight) || weight <= 0)) {
        errors.weight = 'Weight must be a positive number'
      } else if (weight > 500) {
        errors.weight = 'Weight seems too high, please verify'
      }
    }

    if (field === 'height') {
      const height = parseFloat(value)
      if (value && (isNaN(height) || height <= 0)) {
        errors.height = 'Height must be a positive number'
      } else if (height > 300) {
        errors.height = 'Height seems too high, please verify'
      }
    }

    if (field === 'age') {
      const age = parseFloat(value)
      if (value && (isNaN(age) || age < 0)) {
        errors.age = 'Age must be a non-negative number'
      } else if (age > 120) {
        errors.age = 'Age seems too high, please verify'
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(prev => ({ ...prev, ...errors }))
    }
  }

  const handleAdvisorChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newType = event.target.value as TPNAdvisorType
    dispatch(setAdvisorType(newType))
    
    // Auto-adjust age constraints based on population
    if (newType === 'NEO' && parseFloat(patientData.age) > 1) {
      setPatientData(prev => ({ ...prev, age: '0.5' }))
    } else if (newType === 'CHILD' && (parseFloat(patientData.age) < 1 || parseFloat(patientData.age) > 12)) {
      setPatientData(prev => ({ ...prev, age: '6' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!patientData.weight) {
      errors.weight = 'Weight is required'
    }
    
    const weight = parseFloat(patientData.weight)
    if (isNaN(weight) || weight <= 0) {
      errors.weight = 'Please enter a valid weight'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCalculate = async () => {
    if (!validateForm()) {
      return
    }

    dispatch(clearWarnings())

    const weight = parseFloat(patientData.weight)
    const height = parseFloat(patientData.height) || 0
    const age = parseFloat(patientData.age) || 0

    const context = {
      weight,
      height,
      age,
      gender: patientData.gender,
      activityLevel: patientData.activityLevel
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
      age: '',
      gender: undefined,
      activityLevel: 'moderate',
      stressFactors: []
    })
    setValidationErrors({})
  }

  const getAgeHelperText = () => {
    switch (advisorType) {
      case 'NEO': return 'Age in months (0-12)'
      case 'CHILD': return 'Age in years (1-12)'
      case 'ADOLESCENT': return 'Age in years (13-17)'
      case 'ADULT': return 'Age in years (18+)'
      default: return 'Age in years'
    }
  }

  return (
    <Box>
      {/* Population Selector - Always Visible */}
      <Alert severity="info" icon={<PersonIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          Select the patient population type to get age-appropriate TPN calculations
        </Typography>
      </Alert>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="advisor-type-label">Population Type</InputLabel>
        <Select
          labelId="advisor-type-label"
          id="advisor-type"
          value={advisorType}
          label="Population Type"
          onChange={handleAdvisorChange}
        >
          <MenuItem value="NEO">
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="NEO" size="small" color="info" />
              <span>Neonatal/Infant (0-12 months)</span>
            </Stack>
          </MenuItem>
          <MenuItem value="CHILD">
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="CHILD" size="small" color="warning" />
              <span>Pediatric (1-12 years)</span>
            </Stack>
          </MenuItem>
          <MenuItem value="ADOLESCENT">
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="ADOLESCENT" size="small" color="secondary" />
              <span>Adolescent (13-17 years)</span>
            </Stack>
          </MenuItem>
          <MenuItem value="ADULT">
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="ADULT" size="small" color="success" />
              <span>Adult (18+ years)</span>
            </Stack>
          </MenuItem>
        </Select>
      </FormControl>

      {/* Organized Input Sections */}
      <Accordion expanded={expanded === 'basic'} onChange={handleAccordionChange('basic')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ flexShrink: 0 }}>
            Basic Parameters
          </Typography>
          <Typography sx={{ color: 'text.secondary', ml: 2 }}>
            Required fields for calculation
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Weight"
                type="number"
                value={patientData.weight}
                onChange={handleInputChange('weight')}
                error={!!validationErrors.weight}
                helperText={validationErrors.weight || 'Required field'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WeightIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">kg</InputAdornment>
                }}
                inputProps={{ min: 0, step: 0.1 }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Height"
                type="number"
                value={patientData.height}
                onChange={handleInputChange('height')}
                error={!!validationErrors.height}
                helperText={validationErrors.height}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HeightIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">cm</InputAdornment>
                }}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={patientData.age}
                onChange={handleInputChange('age')}
                error={!!validationErrors.age}
                helperText={validationErrors.age || getAgeHelperText()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AgeIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {advisorType === 'NEO' ? 'months' : 'years'}
                    </InputAdornment>
                  )
                }}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion expanded={expanded === 'advanced'} onChange={handleAccordionChange('advanced')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ flexShrink: 0 }}>
            Advanced Parameters
          </Typography>
          <Typography sx={{ color: 'text.secondary', ml: 2 }}>
            Optional fields for refined calculation
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={patientData.gender || ''}
                  label="Gender"
                  onChange={(e) => setPatientData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                >
                  <MenuItem value="">Not specified</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Activity Level</InputLabel>
                <Select
                  value={patientData.activityLevel}
                  label="Activity Level"
                  onChange={(e) => setPatientData(prev => ({ ...prev, activityLevel: e.target.value as 'sedentary' | 'moderate' | 'active' }))}
                >
                  <MenuItem value="sedentary">Sedentary</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Action Buttons */}
      <Box mt={3}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<CalculateIcon />}
            onClick={handleCalculate}
            disabled={loading || !patientData.weight || !!validationErrors.weight}
          >
            Calculate TPN
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ClearIcon />}
            onClick={handleClear}
          >
            Clear All
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}