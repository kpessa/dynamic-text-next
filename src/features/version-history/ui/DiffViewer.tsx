import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Divider,
  Chip,
  Tooltip
} from '@mui/material';
import {
  ViewColumn as SideBySideIcon,
  ViewStream as InlineIcon,
  Code as UnifiedIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';
import { DiffEngine, DiffResult } from '../lib/diffEngine';
import { Version } from '@/entities/version';

interface DiffViewerProps {
  leftVersion: Version;
  rightVersion: Version;
  onClose?: () => void;
}

type ViewMode = 'side-by-side' | 'inline' | 'unified';

export const DiffViewer: React.FC<DiffViewerProps> = ({
  leftVersion,
  rightVersion,
  onClose
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [zoom, setZoom] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const diffEngine = useRef(new DiffEngine());

  useEffect(() => {
    if (leftVersion.content && rightVersion.content) {
      const leftContent = JSON.stringify(leftVersion.content, null, 2);
      const rightContent = JSON.stringify(rightVersion.content, null, 2);
      
      const result = diffEngine.current.computeDiff(leftContent, rightContent, {
        context: 3,
        showLineNumbers: true
      });
      
      setDiffResult(result);
    }
  }, [leftVersion, rightVersion]);

  useEffect(() => {
    if (diffResult && containerRef.current) {
      const diffContainer = containerRef.current.querySelector('.diff-container');
      if (diffContainer) {
        diffContainer.innerHTML = '';
        
        let element: HTMLElement;
        switch (viewMode) {
          case 'side-by-side':
            element = diffEngine.current.renderSideBySide(diffResult, {
              showLineNumbers: true
            });
            break;
          case 'inline':
            element = diffEngine.current.renderInline(diffResult, {
              showLineNumbers: true
            });
            break;
          case 'unified':
            element = document.createElement('pre');
            element.style.fontFamily = 'monospace';
            element.style.fontSize = '14px';
            element.style.padding = '12px';
            element.style.backgroundColor = '#f8f9fa';
            element.style.borderRadius = '4px';
            element.style.overflow = 'auto';
            element.textContent = diffEngine.current.renderUnified(diffResult);
            break;
        }
        
        diffContainer.appendChild(element);
      }
    }
  }, [diffResult, viewMode]);

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 10, 50));
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  if (!diffResult) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography>Computing differences...</Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      ref={containerRef}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              Comparing Versions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Chip
                label={`v${leftVersion.version}`}
                color="primary"
                variant="outlined"
                size="small"
              />
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                →
              </Typography>
              <Chip
                label={`v${rightVersion.version}`}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Zoom in">
              <IconButton size="small" onClick={handleZoomIn}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom out">
              <IconButton size="small" onClick={handleZoomOut}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fullscreen">
              <IconButton size="small" onClick={handleFullscreen}>
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, value) => value && setViewMode(value)}
            size="small"
          >
            <ToggleButton value="side-by-side">
              <SideBySideIcon sx={{ mr: 1 }} />
              Side by Side
            </ToggleButton>
            <ToggleButton value="inline">
              <InlineIcon sx={{ mr: 1 }} />
              Inline
            </ToggleButton>
            <ToggleButton value="unified">
              <UnifiedIcon sx={{ mr: 1 }} />
              Unified
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={`+${diffResult.stats.additions}`}
              color="success"
              size="small"
            />
            <Chip
              label={`-${diffResult.stats.deletions}`}
              color="error"
              size="small"
            />
            <Chip
              label={`~${diffResult.stats.modifications}`}
              color="warning"
              size="small"
            />
          </Box>
        </Box>
      </Box>

      <Box 
        className="diff-container"
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          p: 2,
          fontSize: `${zoom}%`,
          '& .diff-line-add': {
            backgroundColor: '#e6ffed !important',
          },
          '& .diff-line-remove': {
            backgroundColor: '#ffeef0 !important',
          },
          '& .diff-prefix': {
            color: '#666',
            userSelect: 'none',
          },
          '& .diff-hunk-header': {
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }
        }}
      />
    </Paper>
  );
};