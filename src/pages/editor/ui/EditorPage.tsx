/**
 * Editor Page
 * Main editing interface composing editor widgets
 */

import React, { useState } from 'react'
import { Box, Toolbar } from '@mui/material'
import { HeaderWidget } from '@/widgets/header'
import { SidebarWidget } from '@/widgets/sidebar'
import { EditorPanelWidget } from '@/widgets/editor-panel'
import { ContentModel } from '@/entities/content'
import type { ContentSection, DynamicContent } from '@/entities/content'
import type { RecentFile } from '@/entities/session'

export const EditorPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [content, setContent] = useState<DynamicContent>(() => 
    ContentModel.createEmpty('user-1', 'Untitled Document')
  )
  const [activeSection, setActiveSection] = useState<string | undefined>()

  const contentModel = new ContentModel(content)

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleAddSection = () => {
    const newContent = contentModel.addSection({
      title: `Section ${contentModel.sectionCount + 1}`,
      type: 'javascript',
      content: '// Enter your code here',
      order: contentModel.sectionCount
    })
    setContent(newContent)
  }

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId)
  }

  const handleNavigate = (path: string) => {
    console.log('Navigate to:', path)
    // Router navigation will be connected later
  }

  // Mock recent files for demo
  const mockRecentFiles: RecentFile[] = [
    {
      id: 'file-1',
      title: 'TPN Configuration',
      lastOpened: new Date(),
      contentType: 'TPN'
    }
  ]

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <HeaderWidget 
        title="Editor" 
        onMenuClick={handleMenuClick}
      />
      
      <SidebarWidget
        open={sidebarOpen}
        recentFiles={mockRecentFiles}
        onNavigate={handleNavigate}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: sidebarOpen ? '240px' : 0,
          transition: 'margin-left 0.3s'
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <EditorPanelWidget
            sections={content.sections}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            onAddSection={handleAddSection}
          />
        </Box>
      </Box>
    </Box>
  )
}