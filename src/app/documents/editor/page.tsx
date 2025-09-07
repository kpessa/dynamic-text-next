'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
  Toolbar,
  Divider,
  Breadcrumbs,
  Link,
  Chip,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Save as SaveIcon,
  History as HistoryIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'
import {
  EditorToolbar,
  FormulaBuilderModal,
  SectionSidebar,
  CodeEditor,
  PreviewPane,
  ExportMenu,
  VersionHistoryDialog
} from '@/features/document-editor/ui'

export default function DocumentEditorPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [documentContent, setDocumentContent] = useState(`# Dynamic Text Documentation

## Introduction
This is a sample document with dynamic text capabilities.

## Formula Example
The patient's weight is {{weight}} kg, which requires {{calciumDose}} mg of calcium.

## Sections
- Patient Information
- Calculations
- Results

### Code Block
\`\`\`javascript
const calculateDose = (weight) => {
  return weight * 10; // Sample calculation
}
\`\`\`
`)
  const [previewMode, setPreviewMode] = useState<'side' | 'bottom' | 'hidden'>('side')
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const [formulaModalOpen, setFormulaModalOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const autoSaveTimerRef = useRef<NodeJS.Timeout>()

  // Document sections for sidebar
  const sections = [
    { id: 'intro', title: 'Introduction', line: 3 },
    { id: 'formula', title: 'Formula Example', line: 6 },
    { id: 'sections', title: 'Sections', line: 9 },
    { id: 'code', title: 'Code Block', line: 14 }
  ]

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    setAutoSaveStatus('saving')
    autoSaveTimerRef.current = setTimeout(() => {
      // Simulate save
      setAutoSaveStatus('saved')
      console.log('Document auto-saved')
    }, 2000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [documentContent])

  const handleContentChange = (newContent: string) => {
    setDocumentContent(newContent)
  }

  const handleFormulaInsert = (formula: string) => {
    // Insert formula at cursor position
    setDocumentContent(prev => prev + `\n{{${formula}}}`)
    setFormulaModalOpen(false)
    setSnackbarMessage('Formula inserted successfully')
  }

  const handleExport = (format: string) => {
    console.log(`Exporting as ${format}`)
    setExportMenuAnchor(null)
    setSnackbarMessage(`Document exported as ${format}`)
  }

  const handleSectionClick = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (section) {
      // Scroll to section line in editor
      console.log(`Scrolling to line ${section.line}`)
    }
  }

  const handleVersionRestore = (version: any) => {
    setDocumentContent(version.content)
    setHistoryDialogOpen(false)
    setSnackbarMessage('Version restored successfully')
  }

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen)
  }

  const togglePreviewMode = () => {
    const modes: Array<'side' | 'bottom' | 'hidden'> = ['side', 'bottom', 'hidden']
    const currentIndex = modes.indexOf(previewMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setPreviewMode(modes[nextIndex])
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      height: fullscreen ? '100vh' : 'calc(100vh - 64px)',
      mt: fullscreen ? 0 : 8,
      overflow: 'hidden'
    }}>
      {/* Section Sidebar */}
      <SectionSidebar
        open={sidebarOpen}
        sections={sections}
        onSectionClick={handleSectionClick}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Editor Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: sidebarOpen && !isMobile ? '240px' : 0,
          transition: 'margin-left 0.3s'
        }}
      >
        {/* Header */}
        {!fullscreen && (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Breadcrumbs>
              <Link color="inherit" href="/dashboard">
                Dashboard
              </Link>
              <Link color="inherit" href="/documents">
                Documents
              </Link>
              <Typography color="text.primary">Editor</Typography>
            </Breadcrumbs>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="h5">
                Document Editor
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={autoSaveStatus === 'saved' ? 'Saved' : autoSaveStatus === 'saving' ? 'Saving...' : 'Error'}
                  color={autoSaveStatus === 'saved' ? 'success' : autoSaveStatus === 'saving' ? 'default' : 'error'}
                  size="small"
                  icon={<SaveIcon />}
                />
                <IconButton onClick={() => setHistoryDialogOpen(true)} title="Version History">
                  <HistoryIcon />
                </IconButton>
                <IconButton onClick={toggleFullscreen} title={fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                  {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Box>
            </Box>
          </Box>
        )}

        {/* Editor Toolbar */}
        <EditorToolbar
          onFormulaClick={() => setFormulaModalOpen(true)}
          onExportClick={(event) => setExportMenuAnchor(event.currentTarget)}
          onPreviewToggle={togglePreviewMode}
          previewMode={previewMode}
        />

        {/* Editor and Preview */}
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex',
          flexDirection: previewMode === 'bottom' ? 'column' : 'row',
          overflow: 'hidden'
        }}>
          {/* Code Editor */}
          <Box sx={{ 
            flex: previewMode === 'hidden' ? 1 : previewMode === 'side' ? 0.5 : 1,
            height: previewMode === 'bottom' ? '50%' : '100%',
            overflow: 'hidden'
          }}>
            <CodeEditor
              value={documentContent}
              onChange={handleContentChange}
              language="markdown"
              theme={theme.palette.mode}
            />
          </Box>

          {/* Preview Pane */}
          {previewMode !== 'hidden' && (
            <>
              <Divider orientation={previewMode === 'side' ? 'vertical' : 'horizontal'} />
              <Box sx={{ 
                flex: previewMode === 'side' ? 0.5 : 1,
                height: previewMode === 'bottom' ? '50%' : '100%',
                overflow: 'auto'
              }}>
                <PreviewPane content={documentContent} />
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Modals and Dialogs */}
      <FormulaBuilderModal
        open={formulaModalOpen}
        onClose={() => setFormulaModalOpen(false)}
        onInsert={handleFormulaInsert}
      />

      <VersionHistoryDialog
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        onRestore={handleVersionRestore}
      />

      <ExportMenu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
        onExport={handleExport}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />
    </Box>
  )
}