'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ViewColumn as SplitViewIcon,
  Visibility as PreviewIcon,
  Code as CodeIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import {
  selectAllSections,
  selectActiveSectionId,
  setActiveSectionId,
  addSection,
} from '@/entities/section';
import { Section } from '@/entities/section/types';

type ViewMode = 'editor' | 'preview' | 'split';

interface DynamicTextEditorProps {
  documentId?: string;
  onSave?: (sections: Section[]) => void;
  onRunTests?: () => void;
}

export default function DynamicTextEditor({
  documentId,
  onSave,
  onRunTests,
}: DynamicTextEditorProps) {
  const dispatch = useAppDispatch();
  const sections = useAppSelector(selectAllSections);
  const activeSectionId = useAppSelector(selectActiveSectionId);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showSidebar, setShowSidebar] = useState(true);

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleAddSection = useCallback((type: 'static' | 'dynamic') => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      name: `New ${type === 'static' ? 'Text' : 'Code'} Section`,
      content: '',
      order: sections.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(type === 'dynamic' && { testCases: [] }),
    };
    dispatch(addSection(newSection));
    dispatch(setActiveSectionId(newSection.id));
  }, [dispatch, sections.length]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(sections);
    }
  }, [sections, onSave]);

  const handleRunTests = useCallback(() => {
    if (onRunTests) {
      onRunTests();
    }
  }, [onRunTests]);

  const handleUndo = () => {
    // TODO: Implement undo functionality
    console.log('Undo action');
  };

  const handleRedo = () => {
    // TODO: Implement redo functionality
    console.log('Redo action');
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Toolbar */}
      <Paper elevation={1} sx={{ zIndex: 1 }}>
        <Toolbar variant="dense">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
            <Tooltip title="Toggle Section List">
              <IconButton onClick={toggleSidebar} size="small">
                <ListIcon />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem />

            <Tooltip title="Add Text Section">
              <IconButton onClick={() => handleAddSection('static')} size="small">
                <AddIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Add Code Section">
              <IconButton onClick={() => handleAddSection('dynamic')} size="small">
                <CodeIcon />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem />

            <Tooltip title="Undo">
              <IconButton onClick={handleUndo} size="small">
                <UndoIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Redo">
              <IconButton onClick={handleRedo} size="small">
                <RedoIcon />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem />

            <Tooltip title="Run Tests">
              <IconButton onClick={handleRunTests} size="small" color="primary">
                <PlayIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Save Document">
              <IconButton onClick={handleSave} size="small" color="primary">
                <SaveIcon />
              </IconButton>
            </Tooltip>

            <Box sx={{ flexGrow: 1 }} />

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="editor" aria-label="editor only">
                <Tooltip title="Editor Only">
                  <CodeIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="split" aria-label="split view">
                <Tooltip title="Split View">
                  <SplitViewIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="preview" aria-label="preview only">
                <Tooltip title="Preview Only">
                  <PreviewIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Toolbar>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Section Navigator Sidebar */}
        {showSidebar && (
          <Paper
            elevation={2}
            sx={{
              width: 250,
              display: 'flex',
              flexDirection: 'column',
              borderRight: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2">Sections</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
              {sections.map((section) => (
                <Paper
                  key={section.id}
                  elevation={activeSectionId === section.id ? 3 : 0}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    cursor: 'pointer',
                    backgroundColor:
                      activeSectionId === section.id
                        ? 'action.selected'
                        : 'background.paper',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => dispatch(setActiveSectionId(section.id))}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {section.type === 'dynamic' ? <CodeIcon fontSize="small" /> : null}
                    <Typography variant="body2" noWrap>
                      {section.name}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
              {sections.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 2 }}
                >
                  No sections yet. Add one to get started.
                </Typography>
              )}
            </Box>
          </Paper>
        )}

        {/* Editor/Preview Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Editor Panel */}
          {(viewMode === 'editor' || viewMode === 'split') && (
            <Box
              sx={{
                flexGrow: viewMode === 'split' ? 1 : undefined,
                width: viewMode === 'split' ? '50%' : '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <Paper sx={{ flexGrow: 1, m: 2, p: 2, overflow: 'auto' }}>
                {activeSectionId ? (
                  <Typography variant="body2" color="text.secondary">
                    Editor content for section: {activeSectionId}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    Select or create a section to start editing
                  </Typography>
                )}
              </Paper>
            </Box>
          )}

          {/* Divider for split view */}
          {viewMode === 'split' && (
            <Divider orientation="vertical" flexItem />
          )}

          {/* Preview Panel */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <Box
              sx={{
                flexGrow: viewMode === 'split' ? 1 : undefined,
                width: viewMode === 'split' ? '50%' : '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <Paper sx={{ flexGrow: 1, m: 2, p: 2, overflow: 'auto' }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  Preview will be displayed here
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}