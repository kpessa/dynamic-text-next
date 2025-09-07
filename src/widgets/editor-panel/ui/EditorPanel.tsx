/**
 * Editor Panel Widget
 * Main editor area with section management
 */

import React, { useCallback } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  Fab,
  Zoom
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import {
  selectSections,
  selectActiveSectionId,
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  setActiveSection
} from '@/features/editor/model/editorSlice'
import { SectionEditor } from './SectionEditor'
import { Section } from '@/shared/types/section'

export const EditorPanel: React.FC = () => {
  const dispatch = useAppDispatch()
  const sections = useAppSelector(selectSections)
  const activeSectionId = useAppSelector(selectActiveSectionId)

  const handleAddSection = () => {
    const newSection: Section = {
      id: Date.now(),
      type: 'static',
      name: `Section ${sections.length + 1}`,
      content: '',
      testCases: []
    }
    dispatch(addSection(newSection))
    dispatch(setActiveSection(newSection.id))
  }

  const handleUpdateSection = useCallback((section: Section) => {
    dispatch(updateSection(section))
  }, [dispatch])

  const handleDeleteSection = useCallback((id: number) => {
    dispatch(deleteSection(id))
  }, [dispatch])

  const handleSetActive = useCallback((id: number) => {
    dispatch(setActiveSection(id))
  }, [dispatch])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result
    if (source.index !== destination.index) {
      dispatch(reorderSections({
        sourceIndex: source.index,
        destinationIndex: destination.index
      }))
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Document Editor
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add sections and build your dynamic document
        </Typography>
      </Box>

      {/* Sections List */}
      <Box sx={{ flex: 1, overflow: 'auto', pb: 8 }}>
        {sections.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'background.default',
              border: '2px dashed',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No sections yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Click the + button to add your first section
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSection}
            >
              Add First Section
            </Button>
          </Paper>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {sections.map((section: Section, index: number) => (
                    <Draggable
                      key={section.id}
                      draggableId={String(section.id)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.5 : 1
                          }}
                        >
                          <SectionEditor
                            section={section}
                            isActive={section.id === activeSectionId}
                            onUpdate={handleUpdateSection}
                            onDelete={() => handleDeleteSection(section.id)}
                            onActivate={() => handleSetActive(section.id)}
                            dragHandleProps={provided.dragHandleProps}
                          />
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </Box>

      {/* Floating Action Button */}
      <Zoom in={sections.length > 0}>
        <Fab
          color="primary"
          aria-label="add section"
          onClick={handleAddSection}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>
    </Box>
  )
}