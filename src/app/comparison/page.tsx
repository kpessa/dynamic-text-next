'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Toolbar,
  IconButton,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Breadcrumbs,
  Link,
  Chip,
  Divider,
  Alert,
  Tooltip,
  Badge,
  LinearProgress,
  SelectChangeEvent
} from '@mui/material'
import {
  ViewColumn as SideBySideIcon,
  ViewAgenda as UnifiedIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Download as ExportIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Settings as SettingsIcon,
  CompareArrows as CompareIcon,
  SwapHoriz as SwapIcon,
  HighlightOff as ClearIcon,
  Search as SearchIcon
} from '@mui/icons-material'
import { DiffViewer, DiffControls, DiffViewerModal } from '@/features/diff-viewer/ui'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  setViewMode,
  setSelectedPopulations,
  selectCurrentComparison,
  selectViewOptions,
  performComparison
} from '@/features/diff-viewer/model/diffSlice'

type ViewMode = 'side-by-side' | 'unified'
type Population = 'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT'

interface Version {
  id: string
  name: string
  date: string
}

export default function ComparisonPage() {
  const dispatch = useAppDispatch()
  const comparison = useAppSelector(selectCurrentComparison)
  const viewOptions = useAppSelector(selectViewOptions)
  
  const [viewMode, setLocalViewMode] = useState<ViewMode>('side-by-side')
  const [leftPopulation, setLeftPopulation] = useState<Population>('ADULT')
  const [rightPopulation, setRightPopulation] = useState<Population>('CHILD')
  const [leftVersion, setLeftVersion] = useState<string>('v1.0.0')
  const [rightVersion, setRightVersion] = useState<string>('v1.0.0')
  const [fullscreen, setFullscreen] = useState(false)
  const [currentDiff, setCurrentDiff] = useState(0)
  const [totalDiffs, setTotalDiffs] = useState(12)
  const [showHighlights, setShowHighlights] = useState(true)
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null)
  const [loading, setLoading] = useState(false)

  // Available versions
  const versions: Version[] = [
    { id: 'v1.0.0', name: 'Version 1.0.0', date: '2024-01-01' },
    { id: 'v1.1.0', name: 'Version 1.1.0', date: '2024-01-15' },
    { id: 'v1.2.0', name: 'Version 1.2.0', date: '2024-02-01' }
  ]

  const populations = [
    { value: 'NEO', label: 'Neonatal' },
    { value: 'CHILD', label: 'Pediatric' },
    { value: 'ADOLESCENT', label: 'Adolescent' },
    { value: 'ADULT', label: 'Adult' }
  ]

  // Perform comparison when selections change
  useEffect(() => {
    if (leftPopulation && rightPopulation) {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        dispatch(performComparison({
          leftId: `${leftPopulation}-${leftVersion}`,
          rightId: `${rightPopulation}-${rightVersion}`,
          type: 'population'
        }))
        setLoading(false)
      }, 500)
    }
  }, [leftPopulation, rightPopulation, leftVersion, rightVersion, dispatch])

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setLocalViewMode(newMode)
      dispatch(setViewMode(newMode === 'unified' ? 'unified' : 'side-by-side'))
    }
  }

  const handleSwapComparisons = () => {
    setLeftPopulation(rightPopulation)
    setRightPopulation(leftPopulation)
    setLeftVersion(rightVersion)
    setRightVersion(leftVersion)
  }

  const handleNavigateDiff = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentDiff > 0) {
      setCurrentDiff(currentDiff - 1)
    } else if (direction === 'next' && currentDiff < totalDiffs - 1) {
      setCurrentDiff(currentDiff + 1)
    }
  }

  const handleExport = () => {
    console.log('Exporting comparison results...')
    // Implement export logic
  }

  const handleClearComparison = () => {
    setLeftPopulation('ADULT')
    setRightPopulation('CHILD')
    setLeftVersion('v1.0.0')
    setRightVersion('v1.0.0')
    setCurrentDiff(0)
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: fullscreen ? '100vh' : 'calc(100vh - 64px)',
      mt: fullscreen ? 0 : 8
    }}>
      {/* Header */}
      {!fullscreen && (
        <Container maxWidth={false}>
          <Box sx={{ py: 2 }}>
            <Breadcrumbs>
              <Link color="inherit" href="/dashboard">
                Dashboard
              </Link>
              <Link color="inherit" href="/ingredients">
                Ingredients
              </Link>
              <Typography color="text.primary">Comparison</Typography>
            </Breadcrumbs>
            
            <Typography variant="h4" sx={{ mt: 1 }}>
              Ingredient Comparison
            </Typography>
          </Box>
        </Container>
      )}

      {/* Controls Bar */}
      <Paper 
        elevation={1} 
        sx={{ 
          borderRadius: 0,
          borderTop: 1,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Container maxWidth={false}>
          <Toolbar sx={{ gap: 2, flexWrap: 'wrap', minHeight: { xs: 'auto', sm: 64 }, py: 1 }}>
            {/* Left Selector */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">Left:</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={leftPopulation}
                  onChange={(e) => setLeftPopulation(e.target.value as Population)}
                >
                  {populations.map(pop => (
                    <MenuItem key={pop.value} value={pop.value}>
                      {pop.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={leftVersion}
                  onChange={(e) => setLeftVersion(e.target.value)}
                >
                  {versions.map(version => (
                    <MenuItem key={version.id} value={version.id}>
                      {version.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* Swap Button */}
            <IconButton onClick={handleSwapComparisons} color="primary">
              <SwapIcon />
            </IconButton>

            {/* Right Selector */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">Right:</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={rightPopulation}
                  onChange={(e) => setRightPopulation(e.target.value as Population)}
                >
                  {populations.map(pop => (
                    <MenuItem key={pop.value} value={pop.value}>
                      {pop.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <Select
                  value={rightVersion}
                  onChange={(e) => setRightVersion(e.target.value)}
                >
                  {versions.map(version => (
                    <MenuItem key={version.id} value={version.id}>
                      {version.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Divider orientation="vertical" flexItem />

            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="side-by-side">
                <Tooltip title="Side by Side">
                  <SideBySideIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="unified">
                <Tooltip title="Unified">
                  <UnifiedIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ flexGrow: 1 }} />

            {/* Right Controls */}
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Diff Navigation */}
              <Chip 
                label={`${currentDiff + 1} / ${totalDiffs} differences`}
                size="small"
                color="primary"
              />
              <IconButton 
                size="small" 
                onClick={() => handleNavigateDiff('prev')}
                disabled={currentDiff === 0}
              >
                <PrevIcon />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => handleNavigateDiff('next')}
                disabled={currentDiff === totalDiffs - 1}
              >
                <NextIcon />
              </IconButton>

              <Divider orientation="vertical" flexItem />

              {/* Action Buttons */}
              <Tooltip title="Export Comparison">
                <IconButton onClick={handleExport}>
                  <ExportIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear Comparison">
                <IconButton onClick={handleClearComparison}>
                  <ClearIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                <IconButton onClick={() => setFullscreen(!fullscreen)}>
                  {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </Container>
      </Paper>

      {/* Loading Bar */}
      {loading && <LinearProgress />}

      {/* Diff Controls */}
      <Container maxWidth={false} sx={{ mt: 2 }}>
        <DiffControls 
          onHighlightChange={(enabled) => setShowHighlights(enabled)}
          onExport={handleExport}
        />
      </Container>

      {/* Main Diff Viewer */}
      <Container maxWidth={false} sx={{ flex: 1, overflow: 'hidden', py: 2 }}>
        <Paper 
          elevation={2} 
          sx={{ 
            height: '100%', 
            overflow: 'auto',
            p: 2,
            bgcolor: 'background.default'
          }}
        >
          {!loading && (leftPopulation !== rightPopulation || leftVersion !== rightVersion) ? (
            <DiffViewer height="100%" />
          ) : !loading ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary'
              }}
            >
              <CompareIcon sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Select Different Populations or Versions
              </Typography>
              <Typography variant="body2">
                Choose different populations or versions from the dropdowns above to compare
              </Typography>
            </Box>
          ) : null}
        </Paper>
      </Container>

      {/* Summary Footer */}
      {!fullscreen && (
        <Paper 
          elevation={1} 
          sx={{ 
            borderTop: 1, 
            borderColor: 'divider',
            p: 2
          }}
        >
          <Container maxWidth={false}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Chip 
                label={`${totalDiffs} total differences`}
                color="primary"
                variant="outlined"
              />
              <Chip 
                label="8 additions"
                color="success"
                variant="outlined"
                size="small"
              />
              <Chip 
                label="3 deletions"
                color="error"
                variant="outlined"
                size="small"
              />
              <Chip 
                label="1 modification"
                color="warning"
                variant="outlined"
                size="small"
              />
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Last compared: {new Date().toLocaleString()}
              </Typography>
            </Stack>
          </Container>
        </Paper>
      )}
    </Box>
  )
}