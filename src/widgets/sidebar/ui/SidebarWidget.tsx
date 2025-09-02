/**
 * Sidebar Widget
 * App navigation and content organization
 */

import React from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import EditIcon from '@mui/icons-material/Edit'
import SettingsIcon from '@mui/icons-material/Settings'
import FolderIcon from '@mui/icons-material/Folder'
import type { RecentFile } from '@/entities/session'

interface SidebarWidgetProps {
  open?: boolean
  width?: number
  recentFiles?: RecentFile[]
  onNavigate?: (path: string) => void
}

const drawerWidth = 240

export const SidebarWidget: React.FC<SidebarWidgetProps> = ({
  open = true,
  width = drawerWidth,
  recentFiles = [],
  onNavigate
}) => {
  const handleNavigation = (path: string) => {
    onNavigate?.(path)
  }

  const navigationItems = [
    { icon: <HomeIcon />, label: 'Home', path: '/' },
    { icon: <EditIcon />, label: 'Editor', path: '/editor' },
    { icon: <SettingsIcon />, label: 'Settings', path: '/settings' }
  ]

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
        },
        transition: 'width 0.3s'
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton onClick={() => handleNavigation(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        {recentFiles.length > 0 && (
          <>
            <Divider />
            <List>
              <ListItem>
                <ListItemText primary="Recent Files" secondary={`${recentFiles.length} files`} />
              </ListItem>
              {recentFiles.map((file) => (
                <ListItem key={file.id} disablePadding>
                  <ListItemButton onClick={() => handleNavigation(`/editor/${file.id}`)}>
                    <ListItemIcon>
                      <FolderIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={file.title} 
                      secondary={file.contentType}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  )
}