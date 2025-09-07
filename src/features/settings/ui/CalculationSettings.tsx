import React from 'react'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Chip
} from '@mui/material'
import {
  Calculate as CalculateIcon,
  Speed as SpeedIcon,
  Straighten as UnitIcon,
  ShowChart as StepsIcon,
  Autorenew as AutoIcon
} from '@mui/icons-material'

interface CalculationSettingsProps {
  settings: {
    calculationPrecision: number
    roundingMethod: 'standard' | 'ceil' | 'floor'
    unitSystem: 'metric' | 'imperial'
    showIntermediateSteps: boolean
    autoCalculate: boolean
  }
  onChange: (key: string, value: any) => void
}

export const CalculationSettings: React.FC<CalculationSettingsProps> = ({
  settings,
  onChange
}) => {
  const roundingMethods = [
    { value: 'standard', label: 'Standard (Round Half Up)', description: '1.5 → 2, 1.4 → 1' },
    { value: 'ceil', label: 'Round Up (Ceiling)', description: 'Always round up: 1.1 → 2' },
    { value: 'floor', label: 'Round Down (Floor)', description: 'Always round down: 1.9 → 1' }
  ]

  const unitSystems = [
    { value: 'metric', label: 'Metric', description: 'kg, cm, mL' },
    { value: 'imperial', label: 'Imperial', description: 'lbs, inches, oz' }
  ]

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Calculation Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure how calculations are performed and displayed
      </Typography>

      <Grid container spacing={3}>
        {/* Precision */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalculateIcon fontSize="small" color="action" />
                  <Typography variant="subtitle1">Calculation Precision</Typography>
                  <Chip label={`${settings.calculationPrecision} decimal places`} size="small" color="primary" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Number of decimal places for calculation results
                </Typography>
              </Box>
              
              <Box sx={{ px: 2 }}>
                <Slider
                  value={settings.calculationPrecision}
                  onChange={(e, value) => onChange('calculationPrecision', value)}
                  min={0}
                  max={5}
                  marks
                  valueLabelDisplay="auto"
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">0 (Integer)</Typography>
                  <Typography variant="caption" color="text.secondary">5 (Maximum)</Typography>
                </Box>
              </Box>

              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Example with {settings.calculationPrecision} decimal places:</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                  123.456789 → {(123.456789).toFixed(settings.calculationPrecision)}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Rounding Method */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon fontSize="small" color="action" />
                <Typography variant="subtitle1">Rounding Method</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                How numbers are rounded
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={settings.roundingMethod}
                  onChange={(e) => onChange('roundingMethod', e.target.value)}
                >
                  {roundingMethods.map(method => (
                    <MenuItem key={method.value} value={method.value}>
                      <Box>
                        <Typography variant="body2">{method.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {method.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Grid>

        {/* Unit System */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UnitIcon fontSize="small" color="action" />
                <Typography variant="subtitle1">Unit System</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Preferred measurement units
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={settings.unitSystem}
                  onChange={(e) => onChange('unitSystem', e.target.value)}
                >
                  {unitSystems.map(system => (
                    <MenuItem key={system.value} value={system.value}>
                      <Box>
                        <Typography variant="body2">{system.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {system.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Grid>

        {/* Calculation Options */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Calculation Options
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showIntermediateSteps}
                    onChange={(e) => onChange('showIntermediateSteps', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StepsIcon fontSize="small" />
                      <Typography>Show Intermediate Steps</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Display step-by-step calculation breakdown
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoCalculate}
                    onChange={(e) => onChange('autoCalculate', e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AutoIcon fontSize="small" />
                      <Typography>Auto-Calculate</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Automatically recalculate when inputs change
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}