import React, { useState } from 'react';
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ViewColumn as SideBySideIcon,
  ViewStream as UnifiedIcon,
  TextFields as WordIcon,
  Title as CharIcon,
  Notes as LineIcon,
  ExpandMore as ExpandMoreIcon,
  CompareArrows as CompareIcon,
  Clear as ClearIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import {
  setViewMode,
  setShowIdentical,
  setGranularity,
  setComparisonMode,
  setSelectedPopulations,
  togglePopulation,
  setSelectedVersions,
  comparePopulations,
  compareVersions,
  clearComparison,
  selectViewOptions,
  selectComparisonMode,
  selectSelectedPopulations,
  selectSelectedVersions,
  selectCurrentIngredient
} from '../model/diffSlice';
import { PopulationType, populationInfo } from '../lib/comparisonService';

interface DiffControlsProps {
  onCompare?: () => void;
  className?: string;
}

export const DiffControls: React.FC<DiffControlsProps> = ({ 
  onCompare,
  className 
}) => {
  const dispatch = useAppDispatch();
  const viewOptions = useAppSelector(selectViewOptions);
  const comparisonMode = useAppSelector(selectComparisonMode);
  const selectedPopulations = useAppSelector(selectSelectedPopulations);
  const selectedVersions = useAppSelector(selectSelectedVersions);
  const currentIngredient = useAppSelector(selectCurrentIngredient);
  
  const [expanded, setExpanded] = useState(false);
  const [version1Input, setVersion1Input] = useState(selectedVersions?.v1?.toString() || '1');
  const [version2Input, setVersion2Input] = useState(selectedVersions?.v2?.toString() || '2');

  const allPopulations: PopulationType[] = ['neonatal', 'child', 'adolescent', 'adult'];

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newMode: 'side-by-side' | 'unified' | null) => {
    if (newMode !== null) {
      dispatch(setViewMode(newMode));
    }
  };

  const handleGranularityChange = (_: React.MouseEvent<HTMLElement>, newGranularity: 'line' | 'word' | 'char' | null) => {
    if (newGranularity !== null) {
      dispatch(setGranularity(newGranularity));
    }
  };

  const handleComparisonModeChange = (event: any) => {
    dispatch(setComparisonMode(event.target.value));
  };

  const handlePopulationToggle = (population: PopulationType) => {
    dispatch(togglePopulation(population));
  };

  const handleVersionChange = () => {
    const v1 = parseInt(version1Input);
    const v2 = parseInt(version2Input);
    
    if (!isNaN(v1) && !isNaN(v2)) {
      dispatch(setSelectedVersions({ v1, v2 }));
    }
  };

  const handleCompare = () => {
    if (!currentIngredient) {
      console.error('No ingredient selected');
      return;
    }

    if (comparisonMode === 'populations' && selectedPopulations.length >= 2) {
      dispatch(comparePopulations({
        ingredient: currentIngredient,
        populations: selectedPopulations,
        options: viewOptions
      }));
    } else if (comparisonMode === 'versions' && selectedVersions) {
      const population = selectedPopulations[0] || 'neonatal';
      dispatch(compareVersions({
        ingredient: currentIngredient,
        population,
        version1: selectedVersions.v1,
        version2: selectedVersions.v2,
        options: viewOptions
      }));
    }
    
    onCompare?.();
  };

  const handleClear = () => {
    dispatch(clearComparison());
    dispatch(setSelectedPopulations([]));
    dispatch(setSelectedVersions(null));
  };

  const canCompare = comparisonMode === 'populations' 
    ? selectedPopulations.length >= 2 
    : selectedVersions !== null;

  return (
    <Paper elevation={1} className={className} sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* Primary Controls */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            {/* View Mode */}
            <ToggleButtonGroup
              value={viewOptions.viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="side-by-side">
                <Tooltip title="Side by Side View">
                  <SideBySideIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="unified">
                <Tooltip title="Unified View">
                  <UnifiedIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Show Identical Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={viewOptions.showIdentical}
                  onChange={(e) => dispatch(setShowIdentical(e.target.checked))}
                  size="small"
                />
              }
              label="Show Identical"
            />

            {/* Granularity */}
            <ToggleButtonGroup
              value={viewOptions.granularity}
              exclusive
              onChange={handleGranularityChange}
              size="small"
            >
              <ToggleButton value="line">
                <Tooltip title="Line Level">
                  <LineIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="word">
                <Tooltip title="Word Level">
                  <WordIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="char">
                <Tooltip title="Character Level">
                  <CharIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>

        {/* Comparison Mode Selection */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Compare By</InputLabel>
              <Select
                value={comparisonMode}
                onChange={handleComparisonModeChange}
                label="Compare By"
              >
                <MenuItem value="populations">Populations</MenuItem>
                <MenuItem value="versions">Versions</MenuItem>
              </Select>
            </FormControl>

            {/* Population Selection */}
            {comparisonMode === 'populations' && (
              <Stack direction="row" spacing={1}>
                {allPopulations.map(pop => (
                  <Chip
                    key={pop}
                    label={populationInfo[pop].name}
                    onClick={() => handlePopulationToggle(pop)}
                    color={selectedPopulations.includes(pop) ? 'primary' : 'default'}
                    variant={selectedPopulations.includes(pop) ? 'filled' : 'outlined'}
                    sx={{
                      backgroundColor: selectedPopulations.includes(pop) 
                        ? populationInfo[pop].color 
                        : 'transparent',
                      borderColor: populationInfo[pop].color,
                      color: selectedPopulations.includes(pop) 
                        ? 'white' 
                        : populationInfo[pop].color,
                      '&:hover': {
                        backgroundColor: selectedPopulations.includes(pop)
                          ? populationInfo[pop].color
                          : populationInfo[pop].bgColor
                      }
                    }}
                  />
                ))}
              </Stack>
            )}

            {/* Version Selection */}
            {comparisonMode === 'versions' && (
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Version 1"
                  value={version1Input}
                  onChange={(e) => setVersion1Input(e.target.value)}
                  onBlur={handleVersionChange}
                  size="small"
                  type="number"
                  sx={{ width: 100 }}
                />
                <Typography variant="body2">→</Typography>
                <TextField
                  label="Version 2"
                  value={version2Input}
                  onChange={(e) => setVersion2Input(e.target.value)}
                  onBlur={handleVersionChange}
                  size="small"
                  type="number"
                  sx={{ width: 100 }}
                />
                {comparisonMode === 'versions' && selectedPopulations.length > 0 && (
                  <Chip
                    label={`${populationInfo[selectedPopulations[0]].name} population`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
              <Button
                variant="contained"
                startIcon={<CompareIcon />}
                onClick={handleCompare}
                disabled={!canCompare || !currentIngredient}
                size="small"
              >
                Compare
              </Button>
              <IconButton 
                onClick={handleClear}
                size="small"
                disabled={!selectedPopulations.length && !selectedVersions}
              >
                <Tooltip title="Clear Selection">
                  <ClearIcon />
                </Tooltip>
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        {/* Advanced Options */}
        <Accordion 
          expanded={expanded} 
          onChange={(_, isExpanded) => setExpanded(isExpanded)}
          elevation={0}
          sx={{ 
            backgroundColor: 'transparent',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" color="text.secondary">
              Advanced Options
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    disabled
                  />
                }
                label="Ignore Whitespace"
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    disabled
                  />
                }
                label="Case Sensitive"
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    disabled
                  />
                }
                label="Syntax Highlighting"
              />
              <Button
                startIcon={<HistoryIcon />}
                variant="outlined"
                size="small"
                disabled
              >
                View History
              </Button>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Paper>
  );
};