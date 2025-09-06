'use client';

import React, { useMemo, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Print as PrintIcon,
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ZoomOutMap as FitIcon,
} from '@mui/icons-material';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { Section, isStaticSection, isDynamicSection } from '@/entities/section/types';
import { evaluateDynamicSection, interpolateVariables } from '../lib/evaluator';

interface PreviewProps {
  sections: Section[];
  variables?: Record<string, unknown>;
  onRefresh?: () => void;
  showErrors?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

interface RenderedSection {
  id: string;
  content: string;
  error?: string;
  executionTime?: number;
}

export default function Preview({
  sections,
  variables = {},
  onRefresh,
  showErrors = true,
  autoRefresh = true,
  refreshInterval = 2000,
}: PreviewProps) {
  const [renderedSections, setRenderedSections] = useState<RenderedSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Render all sections
  const renderSections = useMemo(() => {
    return async () => {
      setIsLoading(true);
      const rendered: RenderedSection[] = [];

      for (const section of sections) {
        if (isStaticSection(section)) {
          try {
            // Process markdown if it looks like markdown
            let html = section.content;
            if (html.includes('**') || html.includes('*') || html.includes('#') || html.includes('[')) {
              html = marked(html) as string;
            }
            
            // Interpolate variables
            html = interpolateVariables(html, variables);
            
            // Sanitize HTML
            const sanitized = DOMPurify.sanitize(html, {
              ADD_ATTR: ['target', 'rel'],
              ADD_TAGS: ['style'],
            });
            
            rendered.push({
              id: section.id,
              content: sanitized,
            });
          } catch (error) {
            rendered.push({
              id: section.id,
              content: '',
              error: error instanceof Error ? error.message : 'Failed to render static section',
            });
          }
        } else if (isDynamicSection(section)) {
          const result = evaluateDynamicSection(
            section.content,
            variables,
            section.timeout
          );
          
          if (result.success) {
            // Wrap output in a pre tag if it looks like JSON
            let content = result.output;
            if (content.startsWith('{') || content.startsWith('[')) {
              content = `<pre class="code-output">${content}</pre>`;
            }
            
            rendered.push({
              id: section.id,
              content,
              executionTime: result.executionTime,
            });
          } else {
            rendered.push({
              id: section.id,
              content: '',
              error: result.error,
              executionTime: result.executionTime,
            });
          }
        }
      }

      setRenderedSections(rendered);
      setIsLoading(false);
      setLastRefresh(Date.now());
    };
  }, [sections, variables]);

  // Initial render and auto-refresh
  useEffect(() => {
    renderSections();
  }, [renderSections]);

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const timer = setInterval(() => {
      renderSections();
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval, renderSections]);

  const handleManualRefresh = () => {
    renderSections();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  const formatTime = (ms: number) => {
    if (ms < 1) return '<1ms';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Paper elevation={0} sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Preview
          </Typography>
          
          {autoRefresh && (
            <Typography variant="caption" color="text.secondary">
              (Auto-refresh: {refreshInterval / 1000}s)
            </Typography>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Typography variant="caption" color="text.secondary">
            Zoom: {zoom}%
          </Typography>

          <Tooltip title="Zoom Out">
            <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reset Zoom">
            <IconButton size="small" onClick={handleZoomReset}>
              <FitIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom In">
            <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem />

          <Tooltip title="Refresh Preview">
            <IconButton size="small" onClick={handleManualRefresh}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Print">
            <IconButton size="small" onClick={handlePrint}>
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Preview Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : renderedSections.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center">
            No content to preview. Add sections to see them rendered here.
          </Typography>
        ) : (
          <Paper
            sx={{
              p: 3,
              minHeight: '100%',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              width: `${100 / (zoom / 100)}%`,
            }}
            className="preview-content"
          >
            {renderedSections.map((rendered, index) => (
              <Box key={rendered.id}>
                {rendered.error && showErrors ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="caption">
                      Error in section {index + 1}: {rendered.error}
                    </Typography>
                  </Alert>
                ) : (
                  <>
                    <Box
                      dangerouslySetInnerHTML={{ __html: rendered.content }}
                      sx={{
                        '& pre.code-output': {
                          backgroundColor: 'grey.100',
                          p: 2,
                          borderRadius: 1,
                          overflowX: 'auto',
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                        },
                        '& p': { mb: 1.5 },
                        '& h1': { mt: 3, mb: 2 },
                        '& h2': { mt: 2.5, mb: 1.5 },
                        '& h3': { mt: 2, mb: 1 },
                        '& ul, & ol': { mb: 1.5 },
                        '& li': { mb: 0.5 },
                        '& blockquote': {
                          borderLeft: 3,
                          borderColor: 'primary.main',
                          pl: 2,
                          ml: 0,
                          my: 2,
                        },
                        '& code': {
                          backgroundColor: 'grey.100',
                          px: 0.5,
                          py: 0.25,
                          borderRadius: 0.5,
                          fontFamily: 'monospace',
                          fontSize: '0.875em',
                        },
                        '& a': {
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        },
                      }}
                    />
                    {rendered.executionTime !== undefined && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 1 }}
                      >
                        Execution time: {formatTime(rendered.executionTime)}
                      </Typography>
                    )}
                  </>
                )}
                {index < renderedSections.length - 1 && (
                  <Divider sx={{ my: 2 }} />
                )}
              </Box>
            ))}
          </Paper>
        )}
      </Box>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .preview-content {
            transform: none !important;
            width: 100% !important;
          }
          
          body * {
            visibility: hidden;
          }
          
          .preview-content,
          .preview-content * {
            visibility: visible;
          }
          
          .preview-content {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </Box>
  );
}