import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tabs,
  Tab,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Code as CodeIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ContentCopy as ContentCopyIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useAppSelector } from '@/app/hooks';
import { selectGenerationHistory } from '../model/aiTestSlice';
import { GenerationHistory, GenerationStep } from '../types';

interface AIWorkflowInspectorProps {
  open: boolean;
  onClose: () => void;
  historyId?: string;
}

export const AIWorkflowInspector: React.FC<AIWorkflowInspectorProps> = ({
  open,
  onClose,
  historyId
}) => {
  const history = useAppSelector(selectGenerationHistory);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<GenerationHistory | null>(null);

  // Get the specific history entry or the latest one
  const currentEntry = useMemo(() => {
    if (historyId) {
      return history.find(h => h.id === historyId) || null;
    }
    if (selectedEntry) {
      return selectedEntry;
    }
    return history[0] || null;
  }, [history, historyId, selectedEntry]);

  // Filter history based on search and filter
  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      const matchesSearch = searchTerm === '' || 
        entry.request.sectionContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.response.reasoning.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === 'all' || 
        (filterType === 'success' && entry.response.confidence > 0.7) ||
        (filterType === 'failed' && entry.response.confidence <= 0.7);
      
      return matchesSearch && matchesFilter;
    });
  }, [history, searchTerm, filterType]);

  const handleExport = () => {
    if (!currentEntry) return;
    
    const exportData = {
      timestamp: new Date(currentEntry.timestamp).toISOString(),
      duration: currentEntry.duration,
      request: currentEntry.request,
      response: currentEntry.response,
      steps: currentEntry.steps
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-workflow-${currentEntry.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyPrompt = () => {
    if (!currentEntry) return;
    
    const prompt = `Section Content:\n${currentEntry.request.sectionContent}\n\nType: ${currentEntry.request.sectionType}`;
    navigator.clipboard.writeText(prompt);
  };

  const renderTimeline = () => {
    if (!currentEntry) return null;

    const steps: GenerationStep[] = [
      {
        timestamp: currentEntry.timestamp,
        type: 'prompt',
        content: 'Request received',
        metadata: { 
          sectionType: currentEntry.request.sectionType,
          testCount: currentEntry.request.testCount 
        }
      },
      {
        timestamp: currentEntry.timestamp + 100,
        type: 'extraction',
        content: 'Variables extracted',
        metadata: { 
          variableCount: Object.keys(currentEntry.request.existingVariables || {}).length 
        }
      },
      {
        timestamp: currentEntry.timestamp + 200,
        type: 'validation',
        content: 'Tests validated',
        metadata: { 
          testsGenerated: currentEntry.response.testCases.length 
        }
      },
      {
        timestamp: currentEntry.timestamp + currentEntry.duration,
        type: 'response',
        content: 'Generation complete',
        metadata: { 
          quality: currentEntry.response.metrics.overall 
        }
      }
    ];

    return (
      <Box>
        {steps.map((step, index) => (
          <Box key={index} sx={{ display: 'flex', mb: 3 }}>
            <Box sx={{ mr: 2, minWidth: 100 }}>
              <Typography variant="caption" color="text.secondary">
                {new Date(step.timestamp).toLocaleTimeString()}
              </Typography>
            </Box>
            <Box sx={{ mr: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: `${getStepColor(step.type)}.main`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                {getStepIcon(step.type)}
              </Box>
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    width: 2,
                    height: 60,
                    bgcolor: 'grey.300',
                    ml: '19px',
                    mt: 1
                  }}
                />
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="span">
                {step.content}
              </Typography>
              {step.metadata && (
                <Box sx={{ mt: 1 }}>
                  {Object.entries(step.metadata).map(([key, value]) => (
                    <Chip
                      key={key}
                      label={`${key}: ${value}`}
                      size="small"
                      sx={{ mr: 0.5 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  const getStepColor = (type: GenerationStep['type']): 'primary' | 'secondary' | 'success' | 'error' => {
    switch (type) {
      case 'prompt':
        return 'primary';
      case 'extraction':
        return 'secondary';
      case 'validation':
        return 'primary';
      case 'response':
        return 'success';
      default:
        return 'primary';
    }
  };

  const getStepIcon = (type: GenerationStep['type']) => {
    switch (type) {
      case 'prompt':
        return <CodeIcon />;
      case 'extraction':
        return <FilterListIcon />;
      case 'validation':
        return <CheckCircleIcon />;
      case 'response':
        return <PsychologyIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const renderDebugInfo = () => {
    if (!currentEntry) return null;

    return (
      <Box>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Request Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre style={{ overflow: 'auto', fontSize: '12px' }}>
              {JSON.stringify(currentEntry.request, null, 2)}
            </pre>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Response Details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre style={{ overflow: 'auto', fontSize: '12px' }}>
              {JSON.stringify(currentEntry.response, null, 2)}
            </pre>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Performance Metrics</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2">Duration</Typography>
                <Typography variant="h6">{currentEntry.duration}ms</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Quality Metrics</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip 
                    label={`Coverage: ${currentEntry.response.metrics.coverage}%`}
                    color={currentEntry.response.metrics.coverage > 80 ? 'success' : 'warning'}
                  />
                  <Chip 
                    label={`Diversity: ${currentEntry.response.metrics.diversity}%`}
                    color={currentEntry.response.metrics.diversity > 70 ? 'success' : 'warning'}
                  />
                  <Chip 
                    label={`Overall: ${currentEntry.response.metrics.overall}%`}
                    color={currentEntry.response.metrics.overall > 75 ? 'success' : 'warning'}
                  />
                </Stack>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  };

  const renderHistory = () => {
    return (
      <Box>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Filter"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <List>
          {filteredHistory.map((entry) => (
            <React.Fragment key={entry.id}>
              <ListItemButton
                selected={currentEntry?.id === entry.id}
                onClick={() => setSelectedEntry(entry)}
              >
                <ListItemIcon>
                  {entry.response.confidence > 0.7 ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <ErrorIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={`${entry.request.sectionType} - ${entry.response.testCases.length} tests`}
                  secondary={
                    <>
                      {new Date(entry.timestamp).toLocaleString()}
                      {' • '}
                      {entry.duration}ms
                      {' • '}
                      Quality: {entry.response.metrics.overall}%
                    </>
                  }
                />
              </ListItemButton>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">AI Workflow Inspector</Typography>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={handleCopyPrompt} size="small" disabled={!currentEntry}>
              <ContentCopyIcon />
            </IconButton>
            <IconButton onClick={handleExport} size="small" disabled={!currentEntry}>
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {currentEntry ? (
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)}>
              <Tab label="Timeline" icon={<SpeedIcon />} iconPosition="start" />
              <Tab label="Debug Info" icon={<CodeIcon />} iconPosition="start" />
              <Tab label="History" icon={<PsychologyIcon />} iconPosition="start" />
            </Tabs>
          </Box>
        ) : (
          <Alert severity="info">No generation history available</Alert>
        )}

        <Box sx={{ mt: 2, height: 'calc(100% - 48px)', overflow: 'auto' }}>
          {selectedTab === 0 && renderTimeline()}
          {selectedTab === 1 && renderDebugInfo()}
          {selectedTab === 2 && renderHistory()}
        </Box>

        {currentEntry && (
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              AI Reasoning
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentEntry.response.reasoning}
            </Typography>
            {currentEntry.response.suggestions.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
                  Suggestions
                </Typography>
                <Stack spacing={0.5}>
                  {currentEntry.response.suggestions.map((suggestion, index) => (
                    <Typography key={index} variant="body2" color="text.secondary">
                      • {suggestion}
                    </Typography>
                  ))}
                </Stack>
              </>
            )}
          </Paper>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIWorkflowInspector;