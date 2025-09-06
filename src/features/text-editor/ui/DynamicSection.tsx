'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  useTheme,
} from '@mui/material';
import {
  PlayArrow as RunIcon,
  FormatAlignLeft as FormatIcon,
  ContentCopy as CopyIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as ExitFullscreenIcon,
} from '@mui/icons-material';
import { DynamicSection as DynamicSectionType } from '@/entities/section/types';

interface DynamicSectionProps {
  section: DynamicSectionType;
  onChange: (content: string) => void;
  onRun?: () => void;
  isActive: boolean;
  variables?: Record<string, unknown>;
  error?: string | null;
}

export default function DynamicSection({
  section,
  onChange,
  onRun,
  isActive, // eslint-disable-line @typescript-eslint/no-unused-vars
  variables = {},
  error = null,
}: DynamicSectionProps) {
  const theme = useTheme();
  const [code, setCode] = useState(section.content);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setCode(section.content);
  }, [section.content]);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
    onChange(value);
  }, [onChange]);

  const handleRun = useCallback(() => {
    if (onRun) {
      onRun();
    }
  }, [onRun]);

  const handleFormat = () => {
    // Basic formatting - could be enhanced with prettier
    try {
      // Simple indentation fix
      const formatted = code
        .split('\n')
        .map(line => line.trim())
        .join('\n');
      setCode(formatted);
      onChange(formatted);
    } catch (err) {
      console.error('Failed to format code:', err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Create autocomplete hints from available variables
  const autocompleteHints = useMemo(() => {
    return Object.keys(variables).map(key => ({
      label: key,
      type: 'variable',
      detail: typeof variables[key],
      info: `Value: ${JSON.stringify(variables[key])}`,
    }));
  }, [variables]);

  const extensions = useMemo(() => {
    const exts = [javascript()];
    
    // Add custom autocomplete for variables
    if (autocompleteHints.length > 0) {
      // Note: For full autocomplete, we'd need to add @codemirror/autocomplete
      // and configure it properly. This is a simplified version.
    }
    
    return exts;
  }, [autocompleteHints]);

  const editorTheme = theme.palette.mode === 'dark' ? oneDark : undefined;

  return (
    <Box
      sx={{
        height: isFullscreen ? '100vh' : '100%',
        width: isFullscreen ? '100vw' : '100%',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? theme.zIndex.modal : 'auto',
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Paper elevation={0} sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            JavaScript Code
          </Typography>

          {Object.keys(variables).length > 0 && (
            <>
              <Typography variant="caption" color="text.secondary">
                Available variables:
              </Typography>
              {Object.keys(variables).slice(0, 5).map(key => (
                <Chip
                  key={key}
                  label={key}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20 }}
                />
              ))}
              {Object.keys(variables).length > 5 && (
                <Typography variant="caption" color="text.secondary">
                  +{Object.keys(variables).length - 5} more
                </Typography>
              )}
            </>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Tooltip title="Format Code">
            <IconButton size="small" onClick={handleFormat}>
              <FormatIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={copySuccess ? 'Copied!' : 'Copy Code'}>
            <IconButton size="small" onClick={handleCopy}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Run Code">
            <IconButton size="small" onClick={handleRun} color="primary">
              <RunIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            <IconButton size="small" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <ExitFullscreenIcon fontSize="small" />
              ) : (
                <FullscreenIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 1 }}>
          {error}
        </Alert>
      )}

      {/* Code Editor */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <CodeMirror
          value={code}
          height={isFullscreen ? '100%' : '400px'}
          theme={editorTheme}
          extensions={extensions}
          onChange={handleCodeChange}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            highlightSelectionMatches: true,
            searchKeymap: true,
          }}
          placeholder="// Enter your JavaScript code here
// Available variables are shown above
// Use return statement to output a value

return 'Hello World';"
        />
      </Box>

      {/* Test Cases Info */}
      {section.testCases && section.testCases.length > 0 && (
        <Paper elevation={0} sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {section.testCases.length} test case{section.testCases.length !== 1 ? 's' : ''} defined
            </Typography>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}