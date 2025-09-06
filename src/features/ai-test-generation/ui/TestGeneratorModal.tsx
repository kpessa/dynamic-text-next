import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  Stack,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { 
  generateTests, 
  selectIsGenerating, 
  selectLastResponse, 
  selectError,
  clearError,
  saveGeneratedTests 
} from '../model/aiTestSlice';
import { AITestRequest } from '../types';

interface TestGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  sectionContent: string;
  sectionType: 'static' | 'dynamic';
  sectionId?: string;
  existingVariables?: Record<string, any>;
  onTestsGenerated?: (tests: any[]) => void;
}

export const TestGeneratorModal: React.FC<TestGeneratorModalProps> = ({
  open,
  onClose,
  sectionContent,
  sectionType,
  sectionId,
  existingVariables,
  onTestsGenerated
}) => {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector(selectIsGenerating);
  const lastResponse = useAppSelector(selectLastResponse);
  const error = useAppSelector(selectError);
  
  const [testCount, setTestCount] = useState(5);
  const [testTypes, setTestTypes] = useState<Array<'exact' | 'contains' | 'regex'>>(['exact', 'contains']);
  const [includeEdgeCases, setIncludeEdgeCases] = useState(true);
  const [populationType, setPopulationType] = useState<'NEO' | 'CHILD' | 'ADOLESCENT' | 'ADULT'>('ADULT');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleGenerate = useCallback(async () => {
    const request: AITestRequest = {
      sectionContent,
      sectionType,
      existingVariables,
      testCount: includeEdgeCases ? Math.max(testCount, 8) : testCount,
      testTypes,
      tpnContext: {
        advisorType: 'standard',
        populationType,
        ingredients: []
      }
    };
    
    const result = await dispatch(generateTests(request));
    
    if (generateTests.fulfilled.match(result)) {
      const tests = result.payload.response.testCases;
      
      if (sectionId) {
        dispatch(saveGeneratedTests({ sectionId, tests }));
      }
      
      if (onTestsGenerated) {
        onTestsGenerated(tests);
      }
    }
  }, [
    dispatch,
    sectionContent,
    sectionType,
    existingVariables,
    testCount,
    testTypes,
    includeEdgeCases,
    populationType,
    sectionId,
    onTestsGenerated
  ]);
  
  const handleClose = useCallback(() => {
    if (!isGenerating) {
      dispatch(clearError());
      onClose();
    }
  }, [dispatch, isGenerating, onClose]);
  
  const handleTestTypeToggle = (type: 'exact' | 'contains' | 'regex') => {
    setTestTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isGenerating}
    >
      <DialogTitle>
        Generate AI Test Cases
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {/* Section Preview */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Section Type: {sectionType}
            </Typography>
            <TextField
              label="Section Content"
              multiline
              rows={4}
              value={sectionContent.substring(0, 200) + (sectionContent.length > 200 ? '...' : '')}
              disabled
              fullWidth
              variant="outlined"
            />
          </Box>
          
          {/* Basic Settings */}
          <Stack direction="row" spacing={2}>
            <TextField
              label="Number of Tests"
              type="number"
              value={testCount}
              onChange={(e) => setTestCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              inputProps={{ min: 1, max: 20 }}
              disabled={isGenerating}
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel>Population Type</InputLabel>
              <Select
                value={populationType}
                onChange={(e) => setPopulationType(e.target.value as any)}
                disabled={isGenerating}
                label="Population Type"
              >
                <MenuItem value="NEO">Neonate</MenuItem>
                <MenuItem value="CHILD">Child</MenuItem>
                <MenuItem value="ADOLESCENT">Adolescent</MenuItem>
                <MenuItem value="ADULT">Adult</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          
          {/* Test Match Types */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Test Match Types
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                label="Exact"
                color={testTypes.includes('exact') ? 'primary' : 'default'}
                onClick={() => handleTestTypeToggle('exact')}
                disabled={isGenerating}
              />
              <Chip
                label="Contains"
                color={testTypes.includes('contains') ? 'primary' : 'default'}
                onClick={() => handleTestTypeToggle('contains')}
                disabled={isGenerating}
              />
              <Chip
                label="Regex"
                color={testTypes.includes('regex') ? 'primary' : 'default'}
                onClick={() => handleTestTypeToggle('regex')}
                disabled={isGenerating}
              />
            </Stack>
          </Box>
          
          {/* Advanced Options */}
          <Box>
            <Button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              size="small"
              disabled={isGenerating}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>
            
            {showAdvanced && (
              <Stack spacing={2} sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeEdgeCases}
                      onChange={(e) => setIncludeEdgeCases(e.target.checked)}
                      disabled={isGenerating}
                    />
                  }
                  label="Include edge cases and boundary conditions"
                />
              </Stack>
            )}
          </Box>
          
          {/* Progress */}
          {isGenerating && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Generating test cases...
              </Typography>
              <LinearProgress />
            </Box>
          )}
          
          {/* Error Display */}
          {error && (
            <Alert severity="error" onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}
          
          {/* Results Preview */}
          {lastResponse && !isGenerating && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Generated {lastResponse.testCases.length} Test Cases
              </Typography>
              
              {/* Quality Metrics */}
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip 
                  label={`Coverage: ${lastResponse.metrics.coverage}%`}
                  color={lastResponse.metrics.coverage > 80 ? 'success' : 'warning'}
                  size="small"
                />
                <Chip 
                  label={`Diversity: ${lastResponse.metrics.diversity}%`}
                  color={lastResponse.metrics.diversity > 70 ? 'success' : 'warning'}
                  size="small"
                />
                <Chip 
                  label={`Edge Cases: ${lastResponse.metrics.edgeCases}%`}
                  color={lastResponse.metrics.edgeCases > 50 ? 'success' : 'warning'}
                  size="small"
                />
                <Chip 
                  label={`Overall: ${lastResponse.metrics.overall}%`}
                  color={lastResponse.metrics.overall > 75 ? 'success' : 'warning'}
                  size="small"
                />
              </Stack>
              
              {/* Test Preview */}
              <Box sx={{ maxHeight: 200, overflowY: 'auto', bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
                {lastResponse.testCases.slice(0, 3).map((test, index) => (
                  <Box key={test.id || index} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {test.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Variables: {Object.keys(test.variables).join(', ')}
                    </Typography>
                  </Box>
                ))}
                {lastResponse.testCases.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    ...and {lastResponse.testCases.length - 3} more
                  </Typography>
                )}
              </Box>
              
              {/* AI Reasoning */}
              {lastResponse.reasoning && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    AI Reasoning
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {lastResponse.reasoning}
                  </Typography>
                </Box>
              )}
              
              {/* Suggestions */}
              {lastResponse.suggestions.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Improvement Suggestions
                  </Typography>
                  <Stack spacing={0.5}>
                    {lastResponse.suggestions.map((suggestion, index) => (
                      <Typography key={index} variant="body2" color="text.secondary">
                        • {suggestion}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={handleClose}
          disabled={isGenerating}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleGenerate}
          variant="contained"
          disabled={isGenerating || testTypes.length === 0}
          startIcon={isGenerating ? <CircularProgress size={20} /> : null}
        >
          {isGenerating ? 'Generating...' : 'Generate Tests'}
        </Button>
        {lastResponse && !isGenerating && (
          <Button 
            onClick={() => {
              onClose();
            }}
            variant="contained"
            color="success"
          >
            Use Generated Tests
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TestGeneratorModal;