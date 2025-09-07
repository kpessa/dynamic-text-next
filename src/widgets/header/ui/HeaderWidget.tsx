/**
 * Header Widget
 * Composition of navigation features and user controls
 */

import React, { useState } from 'react'
import { AppBar, Toolbar, Typography, Box, IconButton, Button } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DownloadIcon from '@mui/icons-material/Download'
import { ThemeToggle } from '@/features/theme-toggle'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { UserModel } from '@/entities/user'
import type { User } from '@/entities/user'
import { ImportModal } from '@/widgets/import-modal'
import { ExportModal } from '@/widgets/export-modal'
import { setConfiguration } from '@/features/data-import'
import type { TPNConfiguration, PopulationType } from '@/features/data-import/types/schemas'
import { convertTPNConfig, deduplicateIngredients } from '@/features/data-import/lib/ingredientConverter'
import { setIngredients, selectAllIngredients } from '@/entities/ingredient/model/ingredientSlice'

interface HeaderWidgetProps {
  onMenuClick?: () => void
  title?: string
}

export const HeaderWidget: React.FC<HeaderWidgetProps> = ({ 
  onMenuClick,
  title = 'Dynamic Text Editor' 
}) => {
  const dispatch = useAppDispatch()
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  
  // Get current ingredients from store - moved here to fix hooks error
  const existingIngredients = useAppSelector(selectAllIngredients)
  
  // Mock user for now - will be connected to auth later
  const mockUser: User | null = null
  const userModel = mockUser ? new UserModel(mockUser) : null
  
  // Get current sections from store for export
  // This is a placeholder - you would get actual sections from your editor state
  const currentSections = useAppSelector((state) => {
    // TODO: Get sections from editor state
    return []
  })

  const handleImportClick = () => {
    setImportModalOpen(true)
  }

  const handleImportClose = () => {
    setImportModalOpen(false)
  }

  const handleImportConfig = (config: TPNConfiguration, populationType: PopulationType) => {
    // Convert TPN ingredients to app format
    const importedIngredients = convertTPNConfig(config)
    
    // De-duplicate ingredients
    const { unique, duplicates, merged } = deduplicateIngredients(existingIngredients, importedIngredients)
    
    // Combine unique and merged ingredients
    const allIngredients = [...unique, ...merged]
    
    // Store ingredients in Redux
    dispatch(setIngredients([...existingIngredients.filter(
      existing => !merged.some(m => m.id === existing.id)
    ), ...allIngredients]))
    
    // Also store the configuration
    dispatch(setConfiguration({
      config,
      populationType,
      filename: 'imported-config.json'
    }))
    
    setImportModalOpen(false)
    
    // Log import results
    console.log(`Imported ${allIngredients.length} ingredients (${unique.length} new, ${merged.length} updated)`)
  }
  
  const handleExportClick = () => {
    setExportModalOpen(true)
  }
  
  const handleExportClose = () => {
    setExportModalOpen(false)
  }

  return (
    <>
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {onMenuClick && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            color="inherit"
            startIcon={<UploadFileIcon />}
            onClick={handleImportClick}
          >
            Import Config
          </Button>
          <Button
            color="inherit"
            startIcon={<DownloadIcon />}
            onClick={handleExportClick}
            sx={{ mr: 2 }}
          >
            Export Config
          </Button>
          {userModel && (
            <Typography variant="body2">
              {userModel.displayName}
            </Typography>
          )}
          <ThemeToggle />
        </Box>
      </Toolbar>
    </AppBar>
    
    <ImportModal
      open={importModalOpen}
      onClose={handleImportClose}
      onImport={handleImportConfig}
    />
    
    <ExportModal
      open={exportModalOpen}
      onClose={handleExportClose}
      sections={currentSections}
      // For testing, we can pass text with dynamic sections
      text="Testing dynamic section: [f(\nreturn 1 + 2\n)]"
      ingredientName="test-ingredient"
      healthSystem="Test Health System"
      populationType="ADULT"
    />
    </>
  )
}