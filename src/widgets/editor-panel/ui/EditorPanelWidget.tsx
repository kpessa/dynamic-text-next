/**
 * Editor Panel Widget
 * Main content area for editing dynamic text
 */

import React, { useState } from 'react'
import { Box, Paper, Typography, Tab, Tabs, Fab } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import type { ContentSection } from '@/entities/content'

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    const section = sections[newValue]
    if (section) {
      onSectionChange?.(section.id)
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