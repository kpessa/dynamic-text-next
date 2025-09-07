'use client'

import React, { useState } from 'react'
import { 
  Container, 
  Typography, 
  Box,
  Paper,
  Grid,
  Tabs,
  Tab,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Calculate as CalculateIcon,
  Save as SaveIcon,
  FolderOpen as LoadIcon,
  FileDownload as ExportIcon,
  Print as PrintIcon,
  Help as HelpIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'
// import { useRouter } from 'next/navigation' // For future use
import { useBreadcrumbs } from '@/features/ui/hooks/useBreadcrumbs'
import { /*useAppDispatch,*/ useAppSelector } from '@/app/hooks'
import { 
  selectAdvisorType,
  selectCalculationResults,
  selectCalculationWarnings 
} from '@/features/tpn-calculations/model/tpnSlice'
import { TPNCalculatorInput } from '@/features/tpn-calculations/ui/TPNCalculatorInput'
import { TPNCalculatorResults } from '@/features/tpn-calculations/ui/TPNCalculatorResults'
import { TPNCalculatorValidation } from '@/features/tpn-calculations/ui/TPNCalculatorValidation'
import { TPNSaveLoadDialog } from '@/features/tpn-calculations/ui/TPNSaveLoadDialog'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tpn-tabpanel-${index}`}
      aria-labelledby={`tpn-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export default function TPNCalculatorPage() {
  // const router = useRouter() // For future use
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  // const dispatch = useAppDispatch() // For future use
  const advisorType = useAppSelector(selectAdvisorType)
  const results = useAppSelector(selectCalculationResults)
  const warnings = useAppSelector(selectCalculationWarnings)
  const [activeTab, setActiveTab] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [saveLoadDialogOpen, setSaveLoadDialogOpen] = useState(false)
  const [saveLoadMode, setSaveLoadMode] = useState<'save' | 'load'>('save')
  const [patientData, setPatientData] = useState<Record<string, string> | null>(null)

  // Use breadcrumbs hook
  useBreadcrumbs([
    { label: 'Dashboard', href: '/' },
    { label: 'TPN', href: '/tpn' },
    { label: 'Calculator', href: '/tpn/calculator' }
  ])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleSave = () => {
    setSaveLoadMode('save')
    setSaveLoadDialogOpen(true)
    // Get patient data from the input component (would be passed via context or props)
    setPatientData({ weight: '70', height: '170', age: '30' }) // Placeholder data
  }

  const handleLoad = () => {
    setSaveLoadMode('load')
    setSaveLoadDialogOpen(true)
  }

  const handleExport = () => {
    if (!results) return

    const exportData = {
      advisorType,
      results,
      warnings,
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

  const handlePrint = () => {
    window.print()
  }

  const getPopulationColor = (type: string) => {
    switch (type) {
      case 'NEO': return 'info'
      case 'CHILD': return 'warning'
      case 'ADOLESCENT': return 'secondary'
      case 'ADULT': return 'success'
      default: return 'default'
    }
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Page Header with Actions */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CalculateIcon color="primary" fontSize="large" />
              <Box>
                <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
                  TPN Calculator
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Population:
                  </Typography>
                  <Chip
                    label={advisorType}
                    size="small"
                    color={getPopulationColor(advisorType) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                  />
                  {results && (
                    <Chip
                      label="Calculated"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack 
              direction="row" 
              spacing={1} 
              justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
              flexWrap="wrap"
              useFlexGap
            >
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!results}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                startIcon={<LoadIcon />}
                onClick={handleLoad}
              >
                Load
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExport}
                disabled={!results}
              >
                Export
              </Button>
              {!isMobile && (
                <>
                  <Tooltip title="Print">
                    <IconButton onClick={handlePrint} disabled={!results}>
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Settings">
                    <IconButton onClick={() => setShowSettings(!showSettings)}>
                      <SettingsIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Help">
                    <IconButton>
                      <HelpIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content with Tabs */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={1} sx={{ height: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="TPN calculator tabs">
                <Tab label="Input Parameters" />
                <Tab label="Results" disabled={!results} />
                <Tab label="Validation" disabled={warnings.length === 0} />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              <TabPanel value={activeTab} index={0}>
                <TPNCalculatorInput />
              </TabPanel>
              <TabPanel value={activeTab} index={1}>
                {results && <TPNCalculatorResults results={results} />}
              </TabPanel>
              <TabPanel value={activeTab} index={2}>
                {warnings.length > 0 && <TPNCalculatorValidation warnings={warnings} />}
              </TabPanel>
            </Box>
          </Paper>
        </Grid>

        {/* Side Panel for Summary */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={1} sx={{ p: 3, position: 'sticky', top: 80 }}>
            <Typography variant="h6" gutterBottom>
              Calculation Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {results ? (
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Calories
                  </Typography>
                  <Typography variant="h5">
                    {results.calories.toFixed(0)} kcal/day
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Macronutrients
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Protein: {results.protein.toFixed(1)} g/day
                    </Typography>
                    <Typography variant="body2">
                      Carbs: {results.carbohydrates.toFixed(1)} g/day
                    </Typography>
                    <Typography variant="body2">
                      Lipids: {results.lipids.toFixed(1)} g/day
                    </Typography>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Electrolytes
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      Sodium: {results.sodium.toFixed(1)} mEq/day
                    </Typography>
                    <Typography variant="body2">
                      Potassium: {results.potassium.toFixed(1)} mEq/day
                    </Typography>
                  </Stack>
                </Box>

                {warnings.length > 0 && (
                  <Box>
                    <Chip 
                      label={`${warnings.length} Warning${warnings.length > 1 ? 's' : ''}`}
                      color="warning"
                      size="small"
                    />
                  </Box>
                )}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Enter patient data and click &quot;Calculate TPN&quot; to see results
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Save/Load Dialog */}
      <TPNSaveLoadDialog
        open={saveLoadDialogOpen}
        onClose={() => setSaveLoadDialogOpen(false)}
        mode={saveLoadMode}
        patientData={patientData}
      />
    </Container>
  )
}