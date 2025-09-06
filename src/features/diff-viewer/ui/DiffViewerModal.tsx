import React, { useEffect, useCallback, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Stack,
  Typography,
  Breadcrumbs,
  Link,
  Box,
  Tooltip,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  KeyboardArrowLeft as PrevIcon,
  KeyboardArrowRight as NextIcon,
  Help as HelpIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import {
  setIngredient,
  clearComparison,
  clearError,
  selectLoadingState,
  selectCurrentIngredient,
  selectCurrentComparison,
  selectComparisonHistory
} from '../model/diffSlice';
import { DiffViewer } from './DiffViewer';
import { DiffControls } from './DiffControls';
import { SharedIngredient } from '@/entities/shared-ingredient';
import { Ingredient } from '@/entities/ingredient/types';
import { exportService, ExportFormat } from '../lib/exportService';

interface DiffViewerModalProps {
  open: boolean;
  onClose: () => void;
  ingredient?: SharedIngredient | Ingredient;
  initialMode?: 'populations' | 'versions';
  className?: string;
}

export const DiffViewerModal: React.FC<DiffViewerModalProps> = ({
  open,
  onClose,
  ingredient,
  initialMode = 'populations',
  className
}) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const { loading, error } = useAppSelector(selectLoadingState);
  const currentIngredient = useAppSelector(selectCurrentIngredient);
  const currentComparison = useAppSelector(selectCurrentComparison);
  const comparisonHistory = useAppSelector(selectComparisonHistory);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Set ingredient when modal opens
  useEffect(() => {
    if (open && ingredient) {
      dispatch(setIngredient(ingredient));
    }
  }, [open, ingredient, dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          if (!isFullscreen) {
            handleClose();
          } else {
            setIsFullscreen(false);
          }
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setIsFullscreen(!isFullscreen);
          }
          break;
        case 'ArrowLeft':
          if (e.altKey) {
            navigateHistory('prev');
          }
          break;
        case 'ArrowRight':
          if (e.altKey) {
            navigateHistory('next');
          }
          break;
        case 'h':
        case 'H':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowHelp(!showHelp);
          }
          break;
        case 'c':
        case 'C':
          if (e.ctrlKey || e.metaKey && currentComparison) {
            e.preventDefault();
            handleCopyToClipboard();
          }
          break;
        case 'd':
        case 'D':
          if (e.ctrlKey || e.metaKey && currentComparison) {
            e.preventDefault();
            handleExport('json');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isFullscreen, showHelp, currentComparison]);

  const handleClose = useCallback(() => {
    dispatch(clearComparison());
    dispatch(clearError());
    setIsFullscreen(false);
    setHistoryIndex(0);
    onClose();
  }, [dispatch, onClose]);

  const navigateHistory = useCallback((direction: 'prev' | 'next') => {
    if (!comparisonHistory.length) return;
    
    if (direction === 'prev' && historyIndex < comparisonHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
    } else if (direction === 'next' && historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex, comparisonHistory]);

  const handleExport = useCallback(async (format: ExportFormat) => {
    if (!currentComparison) return;
    
    const result = await exportService.export(currentComparison, {
      format,
      includeMetadata: true,
      includeStyles: format === 'html',
      orientation: 'landscape',
      pageSize: 'a4'
    });
    
    if (!result.success) {
      console.error('Export failed:', result.error);
    }
  }, [currentComparison]);

  const handleShare = useCallback(async () => {
    if (!currentComparison) return;
    
    const shareUrl = `${window.location.origin}/diff/${currentIngredient?.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Diff: ${currentIngredient?.name}`,
          text: `View comparison for ${currentIngredient?.name}`,
          url: shareUrl
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(shareUrl);
    }
  }, [currentComparison, currentIngredient]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!currentComparison) return;
    
    const success = await exportService.copyToClipboard(currentComparison, 'text');
    if (!success) {
      console.error('Failed to copy to clipboard');
    }
  }, [currentComparison]);

  const renderBreadcrumbs = () => (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{ mb: 2 }}
    >
      <Link
        component="button"
        underline="hover"
        color="inherit"
        onClick={() => {/* Navigate to home */}}
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
        Home
      </Link>
      <Link
        component="button"
        underline="hover"
        color="inherit"
        onClick={() => {/* Navigate to ingredients */}}
      >
        Ingredients
      </Link>
      <Typography color="text.primary">
        {currentIngredient?.name || 'Diff Viewer'}
      </Typography>
    </Breadcrumbs>
  );

  const renderToolbar = () => (
    <Stack 
      direction="row" 
      spacing={1} 
      alignItems="center"
      sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        pb: 1,
        mb: 2 
      }}
    >
      {/* History Navigation */}
      {comparisonHistory.length > 0 && (
        <Stack direction="row" spacing={0}>
          <Tooltip title="Previous comparison (Alt+←)">
            <span>
              <IconButton
                size="small"
                onClick={() => navigateHistory('prev')}
                disabled={historyIndex >= comparisonHistory.length - 1}
              >
                <PrevIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              px: 1,
              color: 'text.secondary'
            }}
          >
            {historyIndex + 1} / {comparisonHistory.length}
          </Typography>
          <Tooltip title="Next comparison (Alt+→)">
            <span>
              <IconButton
                size="small"
                onClick={() => navigateHistory('next')}
                disabled={historyIndex <= 0}
              >
                <NextIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      )}

      <Box sx={{ flexGrow: 1 }} />

      {/* Action Buttons */}
      {currentComparison && (
        <>
          <Tooltip title="Copy summary (Ctrl+C)">
            <IconButton size="small" onClick={handleCopyToClipboard}>
              <CopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download (Ctrl+D)">
            <IconButton size="small" onClick={() => handleExport('json')}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton size="small" onClick={handleShare}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
      
      <Tooltip title="Toggle fullscreen (Ctrl+F)">
        <IconButton size="small" onClick={() => setIsFullscreen(!isFullscreen)}>
          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Keyboard shortcuts (Ctrl+H)">
        <IconButton size="small" onClick={() => setShowHelp(!showHelp)}>
          <HelpIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  const renderHelpPanel = () => (
    <Alert 
      severity="info" 
      onClose={() => setShowHelp(false)}
      sx={{ mb: 2 }}
    >
      <Typography variant="subtitle2" gutterBottom>
        Keyboard Shortcuts:
      </Typography>
      <Stack spacing={0.5} sx={{ fontSize: '0.875rem' }}>
        <Box>• <strong>Esc</strong>: Close modal</Box>
        <Box>• <strong>Ctrl+F</strong>: Toggle fullscreen</Box>
        <Box>• <strong>Alt+←/→</strong>: Navigate history</Box>
        <Box>• <strong>Ctrl+C</strong>: Copy summary</Box>
        <Box>• <strong>Ctrl+D</strong>: Download comparison</Box>
        <Box>• <strong>Ctrl+H</strong>: Toggle help</Box>
      </Stack>
    </Alert>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={isFullscreen ? false : 'xl'}
      fullWidth
      fullScreen={isFullscreen || isMobile}
      className={className}
      PaperProps={{
        sx: {
          height: isFullscreen ? '100vh' : isTablet ? '90vh' : '85vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Diff Viewer{currentIngredient && `: ${currentIngredient.name}`}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent 
        dividers 
        sx={{ 
          p: { xs: 1, sm: 2, md: 3 },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {!isMobile && renderBreadcrumbs()}
        {renderToolbar()}
        {showHelp && renderHelpPanel()}

        {error && (
          <Alert 
            severity="error" 
            onClose={() => dispatch(clearError())}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        <Stack spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
          {/* Controls */}
          <DiffControls />

          {/* Diff Viewer */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            {loading ? (
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                height="100%"
              >
                <CircularProgress />
              </Box>
            ) : (
              <DiffViewer height="100%" />
            )}
          </Box>
        </Stack>
      </DialogContent>

      {!isMobile && (
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose}>Close</Button>
          {currentComparison && (
            <>
              <Button 
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('html')}
              >
                Export HTML
              </Button>
              <Button 
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('pdf')}
                variant="contained"
              >
                Export PDF
              </Button>
            </>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};