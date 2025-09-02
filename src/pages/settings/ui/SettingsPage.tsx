/**
 * Settings Page
 * Application configuration and preferences
 */

import React, { useState } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { HeaderWidget } from '@/widgets/header'
import { SidebarWidget } from '@/widgets/sidebar'
import SaveIcon from '@mui/icons-material/Save'
import type { UserPreferences } from '@/entities/user'

export const SettingsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    defaultIngredientType: 'TPN',
    autoSave: true
  })

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleNavigate = (path: string) => {
    console.log('Navigate to:', path)
    // Router navigation will be connected later
  }

  const handlePreferenceChange = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    console.log('Saving preferences:', preferences)
    // Will be connected to actual persistence later
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <HeaderWidget 
        title="Settings" 
        onMenuClick={handleMenuClick}
      />
      
      <SidebarWidget
        open={sidebarOpen}
        onNavigate={handleNavigate}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? '240px' : 0,
          transition: 'margin-left 0.3s',
          pt: 8
        }}
      >
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Settings
          </Typography>
          
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Theme</InputLabel>
              <Select
                value={preferences.theme}
                label="Theme"
                onChange={(e) => handlePreferenceChange('theme', e.target.value as 'light' | 'dark' | 'system')}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="system">System</MenuItem>
              </Select>
            </FormControl>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Editor Preferences
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.autoSave}
                    onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
                  />
                }
                label="Auto-save documents"
              />
            </FormGroup>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Default Ingredient Type</InputLabel>
              <Select
                value={preferences.defaultIngredientType || 'TPN'}
                label="Default Ingredient Type"
                onChange={(e) => handlePreferenceChange('defaultIngredientType', e.target.value as 'TPN' | 'general')}
              >
                <MenuItem value="TPN">TPN (Total Parenteral Nutrition)</MenuItem>
                <MenuItem value="general">General</MenuItem>
              </Select>
            </FormControl>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Advanced
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Advanced settings for power users
            </Typography>
            
            <Button variant="outlined" sx={{ mr: 2 }}>
              Clear Cache
            </Button>
            <Button variant="outlined" color="warning">
              Reset All Settings
            </Button>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}