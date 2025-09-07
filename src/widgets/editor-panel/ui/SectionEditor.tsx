/**
 * Section Editor Component
 * Individual section editor with CodeMirror integration
 */

import React from 'react'
import {
  Box,
  Paper,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Typography,
  Tooltip
} from '@mui/material'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import CodeIcon from '@mui/icons-material/Code'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import { Section } from '@/shared/types/section'

interface SectionEditorProps {
  section: Section
  isActive: boolean
  onUpdate: (section: Section) => void
  onDelete: () => void
  onActivate: () => void
  dragHandleProps?: any
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  isActive,
  onUpdate,
  onDelete,
  onActivate,
  dragHandleProps
}) => {
  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: 'static' | 'dynamic' | null) => {
    if (newType) {
      onUpdate({ ...section, type: newType })
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...section, name: e.target.value })
  }

  const handleContentChange = (value: string) => {
    onUpdate({ ...section, content: value })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const ingredientData = e.dataTransfer.getData('ingredient')
    if (ingredientData) {
      try {
        const ingredient = JSON.parse(ingredientData)
        const insertion = section.type === 'dynamic' 
          ? `getValue('${ingredient.keyname || ingredient.name}')`
          : `{{${ingredient.keyname || ingredient.name}}}`
        
        // Insert at cursor position or append
        const newContent = section.content + insertion
        onUpdate({ ...section, content: newContent })
      } catch (err) {
        console.error('Failed to parse ingredient data', err)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  return (
    <Paper
      elevation={isActive ? 3 : 1}
      sx={{
        mb: 2,
        border: isActive ? 2 : 1,
        borderColor: isActive ? 'primary.main' : 'divider',
        transition: 'all 0.3s ease'
      }}
      onClick={onActivate}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <Box {...dragHandleProps} sx={{ cursor: 'grab', display: 'flex' }}>
            <DragIndicatorIcon color="action" />
          </Box>
          
          <TextField
            size="small"
            value={section.name}
            onChange={handleNameChange}
            placeholder="Section name"
            variant="outlined"
            sx={{ flex: 1 }}
            onClick={(e) => e.stopPropagation()}
          />

          <ToggleButtonGroup
            value={section.type}
            exclusive
            onChange={handleTypeChange}
            size="small"
          >
            <ToggleButton value="static">
              <Tooltip title="Static Text">
                <TextFieldsIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="dynamic">
              <Tooltip title="Dynamic JavaScript">
                <CodeIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Content Editor */}
        <Box onClick={(e) => e.stopPropagation()}>
          {section.type === 'dynamic' ? (
            <CodeMirror
              value={section.content}
              height="200px"
              theme={oneDark}
              extensions={[javascript()]}
              onChange={handleContentChange}
              placeholder="// Enter JavaScript code here"
            />
          ) : (
            <TextField
              multiline
              fullWidth
              minRows={6}
              maxRows={12}
              value={section.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Enter static text here..."
              variant="outlined"
            />
          )}
        </Box>

        {/* Helper Text */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {section.type === 'dynamic' 
            ? 'JavaScript code - use getValue() to access ingredients'
            : 'Static text - use {{ingredient}} for placeholders'}
        </Typography>
      </Box>
    </Paper>
  )
}