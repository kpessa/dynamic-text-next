/**
 * Editor Panel Widget
 * Main content area for editing dynamic text
 */

import React, { useState, useEffect } from 'react'
import { Box, Paper, Typography, Tab, Tabs, Fab, CircularProgress, Alert } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import type { ContentSection } from '@/entities/content'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import { SectionEditor } from '@/features/ingredient-management/ui/SectionEditor'
import { ingredientService } from '@/entities/ingredient/model/ingredientService'
import type { Ingredient } from '@/entities/ingredient/types'

interface EditorPanelWidgetProps {
  sections?: ContentSection[]
  activeSection?: string
  onSectionChange?: (sectionId: string) => void
  onAddSection?: () => void
}

export const EditorPanelWidget: React.FC<EditorPanelWidgetProps> = ({
  sections = [],
  activeSection,
  onSectionChange,
  onAddSection
}) => {
  const [tabValue, setTabValue] = useState(0)
  const [fullIngredient, setFullIngredient] = useState<Ingredient | null>(null)
  const [isLoadingIngredient, setIsLoadingIngredient] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  // Get selected ingredient from Redux
  const selectedIngredient = useSelector((state: RootState) => state.ingredientEditor?.selectedIngredient)
  const isEditingSection = useSelector((state: RootState) => state.ingredientEditor?.isEditingSection)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    const section = sections[newValue]
    if (section) {
      onSectionChange?.(section.id)
    }
  }
  
  // Load full ingredient data when selection changes
  useEffect(() => {
    const loadFullIngredient = async () => {
      if (!selectedIngredient) {
        setFullIngredient(null)
        return
      }
      
      setIsLoadingIngredient(true)
      setLoadError(null)
      
      try {
        // Try to load by keyname first, then by id
        const result = await ingredientService.getById(
          selectedIngredient.keyname || selectedIngredient.id
        )
        
        if (result.data) {
          setFullIngredient(result.data)
        } else {
          // If no data, use the ingredient as is (it might already have sections)
          setFullIngredient(selectedIngredient)
        }
      } catch (error) {
        console.error('Failed to load ingredient:', error)
        setLoadError('Failed to load ingredient data')
        // On error, try to use the ingredient as is
        setFullIngredient(selectedIngredient)
      } finally {
        setIsLoadingIngredient(false)
      }
    }
    
    loadFullIngredient()
  }, [selectedIngredient])
  
  const handleSaveSections = (sections: any[]) => {
    // Refresh the ingredient data after saving
    if (selectedIngredient) {
      const loadFullIngredient = async () => {
        const result = await ingredientService.getById(
          selectedIngredient.keyname || selectedIngredient.id
        )
        if (result.data) {
          setFullIngredient(result.data)
        }
      }
      loadFullIngredient()
    }
  }
  
  // Show section editor if an ingredient is selected
  if (isEditingSection && selectedIngredient) {
    if (isLoadingIngredient) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%' 
        }}>
          <CircularProgress />
        </Box>
      )
    }
    
    if (loadError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{loadError}</Alert>
        </Box>
      )
    }
    
    if (fullIngredient) {
      return (
        <SectionEditor
          ingredient={fullIngredient}
          onSave={handleSaveSections}
          onCancel={() => {
            // We can't really cancel from here, but we could clear the selection
            // For now, just keep editing
          }}
        />
      )
    }
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      position: 'relative'
    }}>
      {sections.length > 0 ? (
        <>
          <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {sections.map((section) => (
                <Tab 
                  key={section.id} 
                  label={section.title || `Section ${section.order + 1}`}
                />
              ))}
            </Tabs>
          </Paper>
          
          <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
            {sections[tabValue] && (
              <Paper elevation={2} sx={{ p: 3, minHeight: 400 }}>
                <Typography variant="h6" gutterBottom>
                  {sections[tabValue].title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Type: {sections[tabValue].type}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {sections[tabValue].content || 'No content yet'}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>
        </>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          p: 3
        }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No sections yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Click the + button to add your first section
          </Typography>
        </Box>
      )}
      
      <Fab
        color="primary"
        aria-label="add section"
        onClick={onAddSection}
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  )
}