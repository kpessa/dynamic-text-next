import React from 'react'
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Switch,
  Paper,
  Grid,
  Divider,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  LightMode as LightIcon,
  DarkMode as DarkIcon,
  SettingsBrightness as AutoIcon,
  FormatSize as FontSizeIcon,
  Palette as PaletteIcon
} from '@mui/icons-material'

interface ThemePreferencesProps {
  settings: {
    theme: 'light' | 'dark' | 'auto'
    primaryColor: string
    fontSize: 'small' | 'medium' | 'large'
  }
  onChange: (key: string, value: any) => void
}

export const ThemePreferences: React.FC<ThemePreferencesProps> = ({
  settings,
  onChange
}) => {
  const primaryColors = [
    { value: '#1976d2', label: 'Blue', color: '#1976d2' },
    { value: '#388e3c', label: 'Green', color: '#388e3c' },
    { value: '#d32f2f', label: 'Red', color: '#d32f2f' },
    { value: '#7b1fa2', label: 'Purple', color: '#7b1fa2' },
    { value: '#f57c00', label: 'Orange', color: '#f57c00' },
    { value: '#455a64', label: 'Blue Grey', color: '#455a64' }
  ]

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Theme Preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize the appearance of your application
      </Typography>

      <Grid container spacing={3}>
        {/* Theme Mode */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DarkIcon fontSize="small" />
              Theme Mode
            </Typography>
            <RadioGroup
              value={settings.theme}
              onChange={(e) => onChange('theme', e.target.value)}
            >
              <FormControlLabel
                value="light"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LightIcon fontSize="small" />
                    <Typography>Light Mode</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="dark"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DarkIcon fontSize="small" />
                    <Typography>Dark Mode</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="auto"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoIcon fontSize="small" />
                    <Typography>Auto (Follow System)</Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </Paper>
        </Grid>

        {/* Primary Color */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaletteIcon fontSize="small" />
              Primary Color
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose your accent color
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {primaryColors.map((color) => (
                <Tooltip key={color.value} title={color.label}>
                  <IconButton
                    onClick={() => onChange('primaryColor', color.value)}
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: color.color,
                      border: settings.primaryColor === color.value ? 3 : 0,
                      borderColor: 'primary.main',
                      '&:hover': {
                        bgcolor: color.color,
                        opacity: 0.8
                      }
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Font Size */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FontSizeIcon fontSize="small" />
              Font Size
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Adjust text size for better readability
            </Typography>
            <FormControl fullWidth>
              <Select
                value={settings.fontSize}
                onChange={(e) => onChange('fontSize', e.target.value)}
              >
                <MenuItem value="small">
                  <Typography variant="body2">Small</Typography>
                </MenuItem>
                <MenuItem value="medium">
                  <Typography variant="body1">Medium (Default)</Typography>
                </MenuItem>
                <MenuItem value="large">
                  <Typography variant="h6">Large</Typography>
                </MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Preview */}
        <Grid item xs={12}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3,
              bgcolor: settings.theme === 'dark' ? 'grey.900' : 'background.paper',
              color: settings.theme === 'dark' ? 'grey.100' : 'text.primary'
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Preview
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <Typography 
                variant={settings.fontSize === 'small' ? 'body2' : settings.fontSize === 'large' ? 'h6' : 'body1'}
              >
                This is how your text will appear with the selected settings.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Paper 
                  sx={{ 
                    px: 2, 
                    py: 1, 
                    bgcolor: settings.primaryColor,
                    color: 'white'
                  }}
                >
                  Primary Button
                </Paper>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    px: 2, 
                    py: 1,
                    borderColor: settings.primaryColor,
                    color: settings.primaryColor
                  }}
                >
                  Secondary Button
                </Paper>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}