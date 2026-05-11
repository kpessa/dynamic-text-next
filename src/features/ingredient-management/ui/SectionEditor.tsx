import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  IconButton,
  Chip,
  Alert,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Collapse,
  CircularProgress,
} from '@mui/material'
import {
  Add,
  Delete,
  Save,
  Cancel,
  Code,
  Description,
  ExpandMore,
  ExpandLess,
  DragIndicator,
} from '@mui/icons-material'
import type { Section, StaticSection, DynamicSection } from '@/entities/section/types'
import { ingredientService } from '@/entities/ingredient/model/ingredientService'
import type { Ingredient } from '@/entities/ingredient/types'

interface SectionEditorProps {
  ingredient: Ingredient
  onSave?: (sections: Section[]) => void
  onCancel?: () => void
}

// Simplified section type for editing (without timestamps)
interface EditableSection {
  id: string
  name: string
  type: 'static' | 'dynamic'
  content: string
  order: number
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  ingredient,
  onSave,
  onCancel,
}) => {
  const [sections, setSections] = useState<EditableSection[]>([])
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Load sections from ingredient
  useEffect(() => {
    console.log('SectionEditor received ingredient:', ingredient.keyname, 'sections:', ingredient.sections, 'notes:', ingredient.notes)
    
    if (ingredient.sections && ingredient.sections.length > 0) {
      // Convert full sections to editable format
      const editableSections: EditableSection[] = ingredient.sections.map(section => ({
        id: section.id,
        name: section.name || '',
        type: section.type,
        content: section.content || '',
        order: section.order || 0,
      }))
      setSections(editableSections)
      // Auto-expand all sections by default (especially useful for static text sections)
      const expandedMap: Record<string, boolean> = {}
      ingredient.sections.forEach(section => {
        expandedMap[section.id] = true
      })
      setExpandedSections(expandedMap)
      console.log('Set sections from ingredient.sections:', editableSections)
    } else if (ingredient.notes && ingredient.notes.length > 0) {
      // Convert notes to sections if no sections exist
      const convertedSections: EditableSection[] = ingredient.notes.map((note, index) => ({
        id: `section_${Date.now()}_${index}`,
        name: '', // Empty name for static sections as requested
        type: 'static' as 'static',
        content: note,
        order: index,
      }))
      setSections(convertedSections)
      // Auto-expand all converted sections
      const expandedMap: Record<string, boolean> = {}
      convertedSections.forEach(section => {
        expandedMap[section.id] = true
      })
      setExpandedSections(expandedMap)
      console.log('Set sections from notes:', convertedSections)
    } else {
      // No sections or notes
      setSections([])
      setExpandedSections({})
      console.log('No sections or notes found')
    }
  }, [ingredient])

  const handleAddSection = (type: 'static' | 'dynamic') => {
    const newSection: EditableSection = {
      id: `section_${Date.now()}`,
      name: type === 'static' ? '' : `New Dynamic Section`,
      type,
      content: '',
      order: sections.length,
    }
    setSections([...sections, newSection])
    setEditingSectionId(newSection.id)
    setExpandedSections({ ...expandedSections, [newSection.id]: true })
    setHasChanges(true)
  }

  const handleUpdateSection = (sectionId: string, updates: Partial<EditableSection>) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ))
    setHasChanges(true)
  }

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId))
    setHasChanges(true)
  }

  const handleReorderSections = (fromIndex: number, toIndex: number) => {
    const newSections = [...sections]
    const [movedSection] = newSections.splice(fromIndex, 1)
    newSections.splice(toIndex, 0, movedSection)
    
    // Update order values
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      order: index,
    }))
    
    setSections(reorderedSections)
    setHasChanges(true)
  }

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Convert editable sections to Ingredient's section format
      const ingredientSections = sections.map(section => ({
        id: section.id,
        name: section.name,
        type: section.type,
        content: section.content,
        order: section.order,
        isExpanded: expandedSections[section.id] || false,
      }))
      
      // Update ingredient with new sections
      const result = await ingredientService.update(ingredient.id, {
        sections: ingredientSections,
        // Also update notes for backward compatibility
        notes: sections
          .filter(s => s.type === 'static')
          .map(s => s.content),
        formula: sections
          .find(s => s.type === 'dynamic')
          ?.content,
      })
      
      if (result.data) {
        // Convert to full Section format for onSave callback
        const now = new Date().toISOString()
        const fullSections: Section[] = sections.map(section => {
          if (section.type === 'static') {
            const staticSection: StaticSection = {
              id: section.id,
              name: section.name,
              type: 'static',
              content: section.content,
              order: section.order,
              createdAt: now,
              updatedAt: now,
            }
            return staticSection
          } else {
            const dynamicSection: DynamicSection = {
              id: section.id,
              name: section.name,
              type: 'dynamic',
              content: section.content,
              order: section.order,
              createdAt: now,
              updatedAt: now,
            }
            return dynamicSection
          }
        })
        
        onSave?.(fullSections)
        setHasChanges(false)
      } else {
        console.error('Failed to save sections:', result.error)
      }
    } catch (error) {
      console.error('Error saving sections:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel?.()
      }
    } else {
      onCancel?.()
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Edit Sections
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<Add />}
              onClick={() => handleAddSection('static')}
              size="small"
              variant="outlined"
            >
              Add Static
            </Button>
            <Button
              startIcon={<Code />}
              onClick={() => handleAddSection('dynamic')}
              size="small"
              variant="outlined"
            >
              Add Dynamic
            </Button>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {ingredient.displayName} ({ingredient.keyname})
        </Typography>
      </Box>

      {/* Sections List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {sections.length === 0 ? (
          <Alert severity="info">
            No sections defined. Add static or dynamic sections to create reference text.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {sections.map((section, index) => (
              <Paper
                key={section.id}
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: section.type === 'dynamic' ? 'action.hover' : 'background.paper',
                }}
              >
                {/* Section Header */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton
                    size="small"
                    sx={{ cursor: 'grab' }}
                    title="Drag to reorder"
                  >
                    <DragIndicator />
                  </IconButton>
                  
                  <Box flex={1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {section.type === 'static' ? (
                        <Description fontSize="small" color="action" />
                      ) : (
                        <Code fontSize="small" color="primary" />
                      )}
                      
                      {editingSectionId === section.id ? (
                        <TextField
                          value={section.name}
                          onChange={(e) => handleUpdateSection(section.id, { name: e.target.value })}
                          size="small"
                          variant="standard"
                          autoFocus
                          onBlur={() => setEditingSectionId(null)}
                        />
                      ) : (
                        <Typography
                          variant="subtitle2"
                          onClick={() => setEditingSectionId(section.id)}
                          sx={{ cursor: 'pointer', fontStyle: section.name ? 'normal' : 'italic', opacity: section.name ? 1 : 0.7 }}
                        >
                          {section.name || (section.type === 'static' ? `Static Text ${index + 1}` : `Dynamic Section ${index + 1}`)}
                        </Typography>
                      )}
                      
                      <Chip
                        label={section.type}
                        size="small"
                        color={section.type === 'dynamic' ? 'primary' : 'default'}
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                  
                  <IconButton
                    size="small"
                    onClick={() => toggleSectionExpansion(section.id)}
                  >
                    {expandedSections[section.id] ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteSection(section.id)}
                  >
                    <Delete />
                  </IconButton>
                </Stack>

                {/* Section Content */}
                <Collapse in={expandedSections[section.id]}>
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={section.type === 'dynamic' ? 10 : 4}
                      value={section.content}
                      onChange={(e) => handleUpdateSection(section.id, { content: e.target.value })}
                      placeholder={
                        section.type === 'static'
                          ? 'Enter static text content...'
                          : 'Enter JavaScript code...\n\nExample:\nvar result = "";\nif (me.getValue("Weight") > 0) {\n  result = "Weight: " + me.getValue("Weight") + " kg";\n}\nreturn result;'
                      }
                      variant="outlined"
                      sx={{
                        '& .MuiInputBase-input': {
                          fontFamily: section.type === 'dynamic' ? 'monospace' : 'inherit',
                          fontSize: section.type === 'dynamic' ? '0.9rem' : 'inherit',
                        },
                      }}
                    />
                    
                    {section.type === 'dynamic' && (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        <Typography variant="caption">
                          Dynamic sections use JavaScript to generate content based on patient data.
                          Use `me.getValue('KEYNAME')` to access ingredient values.
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            onClick={handleCancel}
            startIcon={<Cancel />}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={isSaving ? <CircularProgress size={16} /> : <Save />}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}

export default SectionEditor