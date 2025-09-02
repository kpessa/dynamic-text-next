/**
 * Header Widget
 * Composition of navigation features and user controls
 */

import React from 'react'
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { ThemeToggle } from '@/features/theme-toggle'
import { useAppSelector } from '@/app/hooks'
import { UserModel } from '@/entities/user'
import type { User } from '@/entities/user'

interface HeaderWidgetProps {
  onMenuClick?: () => void
  title?: string
}

export const HeaderWidget: React.FC<HeaderWidgetProps> = ({ 
  onMenuClick,
  title = 'Dynamic Text Editor' 
}) => {
  // Mock user for now - will be connected to auth later
  const mockUser: User | null = null

  const userModel = mockUser ? new UserModel(mockUser) : null

  return (
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
          {userModel && (
            <Typography variant="body2">
              {userModel.displayName}
            </Typography>
          )}
          <ThemeToggle />
        </Box>
      </Toolbar>
    </AppBar>
  )
}