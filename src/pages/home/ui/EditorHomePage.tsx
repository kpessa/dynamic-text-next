/**
 * Editor Home Page
 * Three-column layout with ingredient sidebar, editor, and preview
 */

import React, { useState } from 'react'
import { Box, IconButton, useTheme, useMediaQuery } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import { HeaderWidget } from '@/widgets/header'
import { IngredientSidebar } from '@/widgets/ingredient-sidebar'
import { EditorPanel } from '@/widgets/editor-panel'
import { PreviewPanel } from '@/widgets/preview-panel'

export const EditorHomePage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
  
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const [previewOpen, setPreviewOpen] = useState(!isMobile)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const togglePreview = () => setPreviewOpen(!previewOpen)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <HeaderWidget title="Dynamic Text Editor" />
      
      <Box 
        sx={{ 
          display: 'flex', 
          flex: 1, 
          overflow: 'hidden',
          pt: 8, // Account for header
          position: 'relative'
        }}
      >
        {/* Mobile menu button for sidebar */}
        {isMobile && (
          <IconButton
            onClick={toggleSidebar}
            sx={{
              position: 'absolute',
              left: 8,
              top: 8,
              zIndex: 1200,
              bgcolor: 'background.paper',
              boxShadow: 1
            }}
          >
            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        )}

        {/* Left Sidebar - Ingredients */}
        <Box
          sx={{
            width: sidebarOpen ? (isMobile ? '100%' : isTablet ? 280 : 320) : 0,
            flexShrink: 0,
            borderRight: sidebarOpen ? 1 : 0,
            borderColor: 'divider',
            transition: 'width 0.3s ease',
            overflow: 'hidden',
            position: isMobile ? 'absolute' : 'relative',
            left: 0,
            top: 0,
            bottom: 0,
            bgcolor: 'background.paper',
            zIndex: isMobile ? 1100 : 'auto'
          }}
        >
          {sidebarOpen && <IngredientSidebar onClose={isMobile ? toggleSidebar : undefined} />}
        </Box>

        {/* Center - Editor */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minWidth: 0 // Allow flex item to shrink below content size
          }}
        >
          <EditorPanel />
        </Box>

        {/* Right - Preview Panel */}
        <Box
          sx={{
            width: previewOpen ? (isMobile ? '100%' : isTablet ? 320 : 400) : 0,
            flexShrink: 0,
            borderLeft: previewOpen ? 1 : 0,
            borderColor: 'divider',
            transition: 'width 0.3s ease',
            overflow: 'hidden',
            position: isMobile ? 'absolute' : 'relative',
            right: 0,
            top: 0,
            bottom: 0,
            bgcolor: 'background.paper',
            zIndex: isMobile ? 1100 : 'auto'
          }}
        >
          {previewOpen && <PreviewPanel onToggle={togglePreview} />}
        </Box>

        {/* Mobile preview toggle button */}
        {isMobile && (
          <IconButton
            onClick={togglePreview}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1200,
              bgcolor: 'background.paper',
              boxShadow: 1
            }}
          >
            {previewOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        )}
      </Box>
    </Box>
  )
}