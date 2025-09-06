import React, { useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import {
  selectCurrentComparison,
  selectViewOptions,
  selectLoadingState
} from '../model/diffSlice';
import { DiffEngine } from '../lib/diffEngine';
import { populationInfo } from '../lib/comparisonService';
import DOMPurify from 'dompurify';

interface DiffViewerProps {
  height?: number | string;
  className?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ 
  height = 600,
  className 
}) => {
  const dispatch = useAppDispatch();
  const comparison = useAppSelector(selectCurrentComparison);
  const viewOptions = useAppSelector(selectViewOptions);
  const { loading, error } = useAppSelector(selectLoadingState);
  
  const diffEngine = useMemo(() => new DiffEngine(), []);

  // Generate HTML diff content
  const diffContent = useMemo(() => {
    if (!comparison || comparison.comparisons.length === 0) {
      return null;
    }

    const htmlParts: string[] = [];
    
    comparison.comparisons.forEach((pair, index) => {
      const leftContent = JSON.stringify(pair.left.content, null, 2);
      const rightContent = JSON.stringify(pair.right.content, null, 2);
      
      const html = diffEngine.generateDiff2Html(
        leftContent,
        rightContent,
        pair.left.label,
        pair.right.label,
        {
          viewMode: viewOptions.viewMode,
          showIdentical: viewOptions.showIdentical,
          granularity: viewOptions.granularity,
          highlightSyntax: true
        }
      );
      
      htmlParts.push(html);
    });
    
    return htmlParts.join('<hr class="diff-separator">');
  }, [comparison, viewOptions, diffEngine]);

  // Sanitize HTML for security
  const sanitizedContent = useMemo(() => {
    if (!diffContent) return '';
    
    return DOMPurify.sanitize(diffContent, {
      ADD_TAGS: ['style'],
      ADD_ATTR: ['class', 'style'],
      ALLOW_DATA_ATTR: true
    });
  }, [diffContent]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height={height}
        className={className}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2} className={className}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!comparison) {
    return (
      <Box p={2} className={className}>
        <Alert severity="info">
          No comparison data available. Select populations or versions to compare.
        </Alert>
      </Box>
    );
  }

  return (
    <Paper 
      elevation={1} 
      className={className}
      sx={{ 
        height, 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header with summary */}
      <Box p={2} borderBottom={1} borderColor="divider">
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6" component="div">
            Comparison Results
          </Typography>
          
          {comparison.mode === 'populations' && (
            <Stack direction="row" spacing={1}>
              {Array.from(new Set(
                comparison.comparisons.flatMap(c => [c.left.population, c.right.population])
                  .filter(Boolean)
              )).map(pop => (
                <Chip
                  key={pop}
                  label={populationInfo[pop!].name}
                  size="small"
                  sx={{
                    backgroundColor: populationInfo[pop!].bgColor,
                    color: populationInfo[pop!].color,
                    fontWeight: 'medium'
                  }}
                />
              ))}
            </Stack>
          )}
          
          {comparison.mode === 'versions' && comparison.comparisons[0] && (
            <Stack direction="row" spacing={1}>
              <Chip 
                label={`v${comparison.comparisons[0].left.version}`} 
                size="small" 
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary">→</Typography>
              <Chip 
                label={`v${comparison.comparisons[0].right.version}`} 
                size="small" 
                variant="outlined"
              />
            </Stack>
          )}
        </Stack>
        
        <Stack direction="row" spacing={2} mt={1}>
          <Typography variant="caption" color="text.secondary">
            Total changes: {comparison.summary.totalChanges}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Comparisons: {comparison.summary.totalComparisons}
          </Typography>
          {comparison.summary.identicalPairs > 0 && (
            <Typography variant="caption" color="success.main">
              Identical: {comparison.summary.identicalPairs}
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Diff content */}
      <Box 
        sx={{ 
          flex: 1,
          overflow: 'auto',
          p: 2,
          '& .d2h-wrapper': {
            fontSize: '0.875rem'
          },
          '& .d2h-file-header': {
            backgroundColor: 'background.paper',
            padding: '8px',
            borderRadius: '4px',
            marginBottom: '8px'
          },
          '& .d2h-diff-table': {
            fontFamily: 'monospace',
            fontSize: '0.8125rem'
          },
          '& .d2h-code-line-prefix': {
            userSelect: 'none'
          },
          '& .d2h-del': {
            backgroundColor: 'rgba(255, 0, 0, 0.1)'
          },
          '& .d2h-ins': {
            backgroundColor: 'rgba(0, 255, 0, 0.1)'
          },
          '& .diff-separator': {
            margin: '24px 0',
            border: 'none',
            borderTop: '1px solid',
            borderColor: 'divider.main'
          }
        }}
      >
        {sanitizedContent ? (
          <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
        ) : (
          <Alert severity="info">
            No differences found between the selected items.
          </Alert>
        )}
      </Box>

      {/* Statistics footer */}
      {comparison.comparisons.length > 0 && (
        <Box p={1} borderTop={1} borderColor="divider" bgcolor="background.default">
          <Stack direction="row" spacing={3} justifyContent="center">
            {comparison.comparisons.map((pair, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {pair.left.label} ↔ {pair.right.label}:
                </Typography>
                <Chip 
                  label={`+${pair.statistics.additions}`} 
                  size="small" 
                  color="success"
                  sx={{ minWidth: 40 }}
                />
                <Chip 
                  label={`-${pair.statistics.deletions}`} 
                  size="small" 
                  color="error"
                  sx={{ minWidth: 40 }}
                />
                <Chip 
                  label={`~${pair.statistics.modifications}`} 
                  size="small" 
                  color="warning"
                  sx={{ minWidth: 40 }}
                />
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};