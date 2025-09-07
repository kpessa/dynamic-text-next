'use client'

import React, { useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Button,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Settings as SettingsIcon,
  Palette as ThemeIcon,
  Calculate as CalculationIcon,
  FileDownload as ExportIcon,
  Notifications as NotificationIcon,
  Storage as DataIcon,
  Save as SaveIcon,
  RestartAlt as ResetIcon
} from '@mui/icons-material'
import {
  GeneralPreferences,
  ThemePreferences,
  CalculationSettings,
  ExportPreferences,
  NotificationSettings,
  DataManagement
} from '@/features/settings/ui'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function SettingsPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [activeTab, setActiveTab] = useState(0)
  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success')

  // Settings state
  const [settings, setSettings] = useState({
    // Theme preferences
    theme: 'auto' as 'light' | 'dark' | 'auto',
    primaryColor: '#1976d2',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    
    // General preferences
    defaultPopulation: 'ADULT' as 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    
    // Calculation settings
    calculationPrecision: 2,
    roundingMethod: 'standard' as 'standard' | 'ceil' | 'floor',
    unitSystem: 'metric' as 'metric' | 'imperial',
    showIntermediateSteps: true,
    autoCalculate: true,
    
    // Export preferences
    defaultExportFormat: 'pdf' as 'pdf' | 'excel' | 'csv' | 'json',
    includeMetadata: true,
    includeTimestamp: true,
    compressExports: false,
    
    // Notification settings
    enableNotifications: true,
    emailNotifications: false,
    calculationComplete: true,
    exportComplete: true,
    errorAlerts: true,
    updateAvailable: true
  })

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    setUnsavedChanges(true)
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('userSettings', JSON.stringify(settings))
    setUnsavedChanges(false)
    setSnackbarMessage('Settings saved successfully')
    setSnackbarSeverity('success')
  }

  const handleResetSettings = () => {
    // Reset to default settings
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings({
        theme: 'auto',
        primaryColor: '#1976d2',
        fontSize: 'medium',
        defaultPopulation: 'ADULT',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        calculationPrecision: 2,
        roundingMethod: 'standard',
        unitSystem: 'metric',
        showIntermediateSteps: true,
        autoCalculate: true,
        defaultExportFormat: 'pdf',
        includeMetadata: true,
        includeTimestamp: true,
        compressExports: false,
        enableNotifications: true,
        emailNotifications: false,
        calculationComplete: true,
        exportComplete: true,
        errorAlerts: true,
        updateAvailable: true
      })
      setSnackbarMessage('Settings reset to defaults')
      setSnackbarSeverity('info')
    }
  }

  const tabs = [
    { label: 'General', icon: <SettingsIcon /> },
    { label: 'Theme', icon: <ThemeIcon /> },
    { label: 'Calculations', icon: <CalculationIcon /> },
    { label: 'Export', icon: <ExportIcon /> },
    { label: 'Notifications', icon: <NotificationIcon /> },
    { label: 'Data', icon: <DataIcon /> }
  ]

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/dashboard">
          Dashboard
        </Link>
        <Typography color="text.primary">Settings</Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings & Preferences
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize your application experience
        </Typography>
      </Box>

      {/* Unsaved Changes Alert */}
      {unsavedChanges && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleSaveSettings}>
              Save Now
            </Button>
          }
        >
          You have unsaved changes
        </Alert>
      )}

      {/* Settings Content */}
      <Paper elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, value) => setActiveTab(value)}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* General Preferences */}
          <TabPanel value={activeTab} index={0}>
            <GeneralPreferences
              settings={{
                defaultPopulation: settings.defaultPopulation,
                language: settings.language,
                dateFormat: settings.dateFormat,
                timeFormat: settings.timeFormat
              }}
              onChange={(key, value) => handleSettingChange('general', key, value)}
            />
          </TabPanel>

          {/* Theme Preferences */}
          <TabPanel value={activeTab} index={1}>
            <ThemePreferences
              settings={{
                theme: settings.theme,
                primaryColor: settings.primaryColor,
                fontSize: settings.fontSize
              }}
              onChange={(key, value) => handleSettingChange('theme', key, value)}
            />
          </TabPanel>

          {/* Calculation Settings */}
          <TabPanel value={activeTab} index={2}>
            <CalculationSettings
              settings={{
                calculationPrecision: settings.calculationPrecision,
                roundingMethod: settings.roundingMethod,
                unitSystem: settings.unitSystem,
                showIntermediateSteps: settings.showIntermediateSteps,
                autoCalculate: settings.autoCalculate
              }}
              onChange={(key, value) => handleSettingChange('calculation', key, value)}
            />
          </TabPanel>

          {/* Export Preferences */}
          <TabPanel value={activeTab} index={3}>
            <ExportPreferences
              settings={{
                defaultExportFormat: settings.defaultExportFormat,
                includeMetadata: settings.includeMetadata,
                includeTimestamp: settings.includeTimestamp,
                compressExports: settings.compressExports
              }}
              onChange={(key, value) => handleSettingChange('export', key, value)}
            />
          </TabPanel>

          {/* Notification Settings */}
          <TabPanel value={activeTab} index={4}>
            <NotificationSettings
              settings={{
                enableNotifications: settings.enableNotifications,
                emailNotifications: settings.emailNotifications,
                calculationComplete: settings.calculationComplete,
                exportComplete: settings.exportComplete,
                errorAlerts: settings.errorAlerts,
                updateAvailable: settings.updateAvailable
              }}
              onChange={(key, value) => handleSettingChange('notification', key, value)}
            />
          </TabPanel>

          {/* Data Management */}
          <TabPanel value={activeTab} index={5}>
            <DataManagement
              onClearCache={() => {
                setSnackbarMessage('Cache cleared successfully')
                setSnackbarSeverity('success')
              }}
              onExportData={() => {
                setSnackbarMessage('Data exported successfully')
                setSnackbarSeverity('success')
              }}
              onDeleteData={() => {
                setSnackbarMessage('Data deleted successfully')
                setSnackbarSeverity('success')
              }}
            />
          </TabPanel>
        </Box>

        {/* Action Buttons */}
        <Box 
          sx={{ 
            p: 3, 
            borderTop: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ResetIcon />}
            onClick={handleResetSettings}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            disabled={!unsavedChanges}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage('')}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarMessage('')}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  )
}