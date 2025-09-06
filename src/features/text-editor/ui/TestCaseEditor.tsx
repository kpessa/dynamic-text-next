'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as RunIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { TestCase, TestMatchType, DynamicSection, TestResult } from '@/entities/section/types';
import { runTestCase } from '../lib/evaluator';

interface TestCaseEditorProps {
  section: DynamicSection;
  onUpdateTestCases: (testCases: TestCase[]) => void;
  onRunTests?: (results: TestResult[]) => void;
}

interface TestCaseFormData {
  name: string;
  variables: string; // JSON string
  expected: string;
  matchType: TestMatchType;
  expectedStyles?: string; // JSON string
}

const defaultFormData: TestCaseFormData = {
  name: '',
  variables: '{}',
  expected: '',
  matchType: 'exact',
  expectedStyles: '',
};

export default function TestCaseEditor({
  section,
  onUpdateTestCases,
  onRunTests,
}: TestCaseEditorProps) {
  const [testCases, setTestCases] = useState<TestCase[]>(section.testCases || []);
  const [testResults, setTestResults] = useState<Map<number, TestResult>>(new Map());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<TestCaseFormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<Partial<TestCaseFormData>>({});
  const [runningTests, setRunningTests] = useState(false);

  const validateFormData = (): boolean => {
    const errors: Partial<TestCaseFormData> = {};

    if (!formData.name.trim()) {
      errors.name = 'Test name is required';
    }

    try {
      JSON.parse(formData.variables);
    } catch {
      errors.variables = 'Invalid JSON format';
    }

    if (formData.matchType === 'styles' && formData.expectedStyles) {
      try {
        JSON.parse(formData.expectedStyles);
      } catch {
        errors.expectedStyles = 'Invalid JSON format';
      }
    }

    if (!formData.expected.trim() && formData.matchType !== 'styles') {
      errors.expected = 'Expected output is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = (index?: number) => {
    if (index !== undefined) {
      const testCase = testCases[index];
      setFormData({
        name: testCase.name,
        variables: JSON.stringify(testCase.variables, null, 2),
        expected: testCase.expected,
        matchType: testCase.matchType,
        expectedStyles: testCase.expectedStyles ? JSON.stringify(testCase.expectedStyles, null, 2) : '',
      });
      setEditingIndex(index);
    } else {
      setFormData(defaultFormData);
      setEditingIndex(null);
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingIndex(null);
    setFormData(defaultFormData);
    setFormErrors({});
  };

  const handleSaveTestCase = () => {
    if (!validateFormData()) return;

    const newTestCase: TestCase = {
      name: formData.name,
      variables: JSON.parse(formData.variables),
      expected: formData.expected,
      matchType: formData.matchType,
    };

    if (formData.matchType === 'styles' && formData.expectedStyles) {
      newTestCase.expectedStyles = JSON.parse(formData.expectedStyles);
    }

    let updatedTestCases: TestCase[];
    if (editingIndex !== null) {
      updatedTestCases = [...testCases];
      updatedTestCases[editingIndex] = newTestCase;
    } else {
      updatedTestCases = [...testCases, newTestCase];
    }

    setTestCases(updatedTestCases);
    onUpdateTestCases(updatedTestCases);
    handleCloseDialog();
  };

  const handleDeleteTestCase = (index: number) => {
    const updatedTestCases = testCases.filter((_, i) => i !== index);
    setTestCases(updatedTestCases);
    onUpdateTestCases(updatedTestCases);
    
    // Remove test result for deleted test case
    const newResults = new Map(testResults);
    newResults.delete(index);
    setTestResults(newResults);
  };

  const handleDuplicateTestCase = (index: number) => {
    const testCase = testCases[index];
    const duplicated: TestCase = {
      ...testCase,
      name: `${testCase.name} (Copy)`,
      variables: { ...testCase.variables },
    };
    const updatedTestCases = [...testCases, duplicated];
    setTestCases(updatedTestCases);
    onUpdateTestCases(updatedTestCases);
  };

  const handleRunTestCase = useCallback(async (index: number) => {
    const testCase = testCases[index];
    setRunningTests(true);

    const result = runTestCase(
      section.content,
      testCase.variables,
      testCase.expected,
      testCase.matchType,
      section.timeout
    );

    const newResults = new Map(testResults);
    newResults.set(index, result);
    setTestResults(newResults);
    setRunningTests(false);

    if (onRunTests) {
      onRunTests(Array.from(newResults.values()));
    }
  }, [section.content, section.timeout, testCases, testResults, onRunTests]);

  const handleRunAllTests = useCallback(async () => {
    setRunningTests(true);
    const results: TestResult[] = [];
    const newResults = new Map<number, TestResult>();

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const result = runTestCase(
        section.content,
        testCase.variables,
        testCase.expected,
        testCase.matchType,
        section.timeout
      );
      results.push(result);
      newResults.set(i, result);
    }

    setTestResults(newResults);
    setRunningTests(false);

    if (onRunTests) {
      onRunTests(results);
    }
  }, [section.content, section.timeout, testCases, onRunTests]);

  const getPassedCount = () => {
    let passed = 0;
    testResults.forEach(result => {
      if (result.passed) passed++;
    });
    return passed;
  };

  return (
    <Box>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6">Test Cases</Typography>
          
          {testCases.length > 0 && testResults.size > 0 && (
            <Chip
              label={`${getPassedCount()}/${testCases.length} Passed`}
              color={getPassedCount() === testCases.length ? 'success' : 'warning'}
              size="small"
            />
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button
            startIcon={<RunIcon />}
            onClick={handleRunAllTests}
            disabled={testCases.length === 0 || runningTests}
            variant="outlined"
            size="small"
          >
            Run All Tests
          </Button>
          
          <Button
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            variant="contained"
            size="small"
          >
            Add Test Case
          </Button>
        </Stack>
      </Paper>

      {/* Test Cases List */}
      {testCases.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No test cases defined. Click "Add Test Case" to create one.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1}>
          {testCases.map((testCase, index) => {
            const result = testResults.get(index);
            
            return (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                    {result && (
                      result.passed ? (
                        <PassIcon color="success" />
                      ) : (
                        <FailIcon color="error" />
                      )
                    )}
                    <Typography>{testCase.name}</Typography>
                    <Chip label={testCase.matchType} size="small" variant="outlined" />
                    <Box sx={{ flexGrow: 1 }} />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {/* Variables */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Variables:
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 1 }}>
                        <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                          {JSON.stringify(testCase.variables, null, 2)}
                        </pre>
                      </Paper>
                    </Box>

                    {/* Expected Output */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Expected Output ({testCase.matchType}):
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {testCase.expected}
                        </Typography>
                      </Paper>
                    </Box>

                    {/* Test Result */}
                    {result && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Test Result:
                        </Typography>
                        {result.error ? (
                          <Alert severity="error">
                            <Typography variant="body2">{result.error}</Typography>
                          </Alert>
                        ) : (
                          <Stack spacing={1}>
                            <Alert severity={result.passed ? 'success' : 'error'}>
                              Test {result.passed ? 'Passed' : 'Failed'}
                            </Alert>
                            <Paper variant="outlined" sx={{ p: 1 }}>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                Actual: {result.actual}
                              </Typography>
                            </Paper>
                            {result.executionTime && (
                              <Typography variant="caption" color="text.secondary">
                                Execution time: {result.executionTime}ms
                              </Typography>
                            )}
                          </Stack>
                        )}
                      </Box>
                    )}

                    {/* Actions */}
                    <Stack direction="row" spacing={1}>
                      <Button
                        startIcon={<RunIcon />}
                        onClick={() => handleRunTestCase(index)}
                        disabled={runningTests}
                        size="small"
                      >
                        Run Test
                      </Button>
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(index)}
                        size="small"
                      >
                        Edit
                      </Button>
                      <Button
                        startIcon={<CopyIcon />}
                        onClick={() => handleDuplicateTestCase(index)}
                        size="small"
                      >
                        Duplicate
                      </Button>
                      <Button
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteTestCase(index)}
                        color="error"
                        size="small"
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'Edit Test Case' : 'Add Test Case'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Test Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
              fullWidth
            />

            <TextField
              label="Variables (JSON)"
              value={formData.variables}
              onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
              error={!!formErrors.variables}
              helperText={formErrors.variables || 'Enter variables as JSON object'}
              multiline
              rows={4}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Match Type</InputLabel>
              <Select
                value={formData.matchType}
                onChange={(e) => setFormData({ ...formData, matchType: e.target.value as TestMatchType })}
                label="Match Type"
              >
                <MenuItem value="exact">Exact Match</MenuItem>
                <MenuItem value="contains">Contains</MenuItem>
                <MenuItem value="regex">Regular Expression</MenuItem>
                <MenuItem value="styles">Style Match</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Expected Output"
              value={formData.expected}
              onChange={(e) => setFormData({ ...formData, expected: e.target.value })}
              error={!!formErrors.expected}
              helperText={formErrors.expected}
              multiline
              rows={3}
              fullWidth
            />

            {formData.matchType === 'styles' && (
              <TextField
                label="Expected Styles (JSON)"
                value={formData.expectedStyles}
                onChange={(e) => setFormData({ ...formData, expectedStyles: e.target.value })}
                error={!!formErrors.expectedStyles}
                helperText={formErrors.expectedStyles || 'Enter expected styles as JSON object'}
                multiline
                rows={3}
                fullWidth
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveTestCase} variant="contained">
            {editingIndex !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}