/**
 * Editor Panel Widget
 * Main content area for editing dynamic text
 */

import React, { useState, useEffect } from 'react'
import { Box, Paper, Typography, Tab, Tabs, Fab, CircularProgress, Alert } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import type { ContentSection } from '@/entities/content'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/app/store'
import { ingredientService } from '@/entities/ingredient/model/ingredientService'
import type { Ingredient } from '@/entities/ingredient/types'
import { 
  selectSelectedIngredient, 
  selectIsEditingSection,
  updateSelectedIngredient 
} from '@/shared/model/selectedIngredientModel'

interface EditorPanelProps {
  sections?: ContentSection[]
  activeSection?: string
  onSectionChange?: (sectionId: string) => void
  onAddSection?: () => void
}

// Add prop for the section editor component
interface ExtendedEditorPanelProps extends EditorPanelProps {
  sectionEditorComponent?: React.ComponentType<{
    ingredient: Ingredient
    onSave?: (sections: any[]) => void
    onCancel?: () => void
  }>
}

export const EditorPanel: React.FC<ExtendedEditorPanelProps> = ({
  sections = [],
  activeSection,
  onSectionChange,
  onAddSection,
  sectionEditorComponent: SectionEditorComponent
}) => {
  const dispatch = useDispatch()
  const [tabValue, setTabValue] = useState(0)
  const [fullIngredient, setFullIngredient] = useState<Ingredient | null>(null)
  const [isLoadingIngredient, setIsLoadingIngredient] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  // Get selected ingredient from shared model
  const selectedIngredient = useSelector(selectSelectedIngredient)
  const isEditingSection = useSelector(selectIsEditingSection)
  const selectedIngredientId = selectedIngredient?.id || selectedIngredient?.keyname

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
      
      // First, use the ingredient as-is since it already has the data
      // Convert notes to sections if needed
      const ingWithSections = {
        ...selectedIngredient,
        sections: selectedIngredient.sections || (selectedIngredient.notes && selectedIngredient.notes.length > 0 ? 
          selectedIngredient.notes.map((note: string, index: number) => ({
            id: `note-${index}`,
            name: '',
            type: 'static' as const,
            content: note
          })) : [])
      } as Ingredient
      
      setFullIngredient(ingWithSections)
      
      // Then try to load from Firebase to get any additional data (but don't fail if not found)
      try {
        const result = await ingredientService.getById(
          selectedIngredient.keyname || selectedIngredient.id
        )
        
        if (result.data) {
          // If we got data from Firebase, use it (it might have more recent sections)
          setFullIngredient(result.data)
        }
      } catch (error) {
        // Silently ignore - we already have the ingredient data
        console.log('Could not load from Firebase, using selected ingredient data')
      } finally {
        setIsLoadingIngredient(false)
      }
    }
    
    loadFullIngredient()
  }, [selectedIngredientId]) // Only re-run when the ingredient ID changes
  
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
    
    if (fullIngredient && SectionEditorComponent) {
      console.log('Passing to SectionEditor:', fullIngredient.keyname, 'sections:', fullIngredient.sections)
      return (
        <SectionEditorComponent
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
            {selectedIngredient ? 'Loading ingredient sections...' : 'Select an ingredient to edit'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {selectedIngredient ? 'Please wait while we load the sections' : 'Choose an ingredient from the sidebar to view and edit its sections'}
          </Typography>
        </Box>
      )}
      
      {!isEditingSection && (
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
      )}
    </Box>
  )
}