import React from 'react'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Stack
} from '@mui/material'
import {
  Language as LanguageIcon,
  Person as PersonIcon,
  CalendarMonth as DateIcon,
  Schedule as TimeIcon
} from '@mui/icons-material'

interface GeneralPreferencesProps {
  settings: {
    defaultPopulation: 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT'
    language: string
    dateFormat: string
    timeFormat: string
  }
  onChange: (key: string, value: any) => void
}

export const GeneralPreferences: React.FC<GeneralPreferencesProps> = ({
  settings,
  onChange
}) => {
  const populations = [
    { value: 'NEO', label: 'Neonatal' },
    { value: 'CHILD', label: 'Pediatric' },
    { value: 'ADOLESCENT', label: 'Adolescent' },
    { value: 'ADULT', label: 'Adult' }
  ]

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'zh', label: '中文' }
  ]

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (01/31/2024)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/01/2024)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-01-31)' },
    { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (31.01.2024)' }
  ]

  const timeFormats = [
    { value: '12h', label: '12-hour (2:30 PM)' },
    { value: '24h', label: '24-hour (14:30)' }
  ]

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        General Preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure your default settings and regional preferences
      </Typography>

      <Grid container spacing={3}>
        {/* Default Population */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="subtitle1">Default Population Type</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Set the default population for new calculations
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Population</InputLabel>
                <Select
                  value={settings.defaultPopulation}
                  label="Population"
                  onChange={(e) => onChange('defaultPopulation', e.target.value)}
                >
                  {populations.map(pop => (
                    <MenuItem key={pop.value} value={pop.value}>
                      {pop.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Grid>

        {/* Language */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LanguageIcon fontSize="small" color="action" />
                <Typography variant="subtitle1">Language</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Choose your preferred language
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  label="Language"
                  onChange={(e) => onChange('language', e.target.value)}
                >
                  {languages.map(lang => (
                    <MenuItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Grid>

        {/* Date Format */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DateIcon fontSize="small" color="action" />
                <Typography variant="subtitle1">Date Format</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                How dates should be displayed
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={settings.dateFormat}
                  label="Date Format"
                  onChange={(e) => onChange('dateFormat', e.target.value)}
                >
                  {dateFormats.map(format => (
                    <MenuItem key={format.value} value={format.value}>
                      {format.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Grid>

        {/* Time Format */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon fontSize="small" color="action" />
                <Typography variant="subtitle1">Time Format</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                How time should be displayed
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Time Format</InputLabel>
                <Select
                  value={settings.timeFormat}
                  label="Time Format"
                  onChange={(e) => onChange('timeFormat', e.target.value)}
                >
                  {timeFormats.map(format => (
                    <MenuItem key={format.value} value={format.value}>
                      {format.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}