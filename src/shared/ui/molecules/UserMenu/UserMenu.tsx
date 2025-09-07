'use client'

import React, { useState } from 'react'
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
} from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import type { UserMenuProps } from './UserMenu.types'

export const UserMenu: React.FC<UserMenuProps> = ({
  userName = 'User',
  userEmail,
  userAvatar,
  onLogout,
  onProfile,
  onSettings,
  className,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  transformOrigin = { vertical: 'top', horizontal: 'right' },
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleProfile = () => {
    handleClose()
    onProfile?.()
  }

  const handleSettings = () => {
    handleClose()
    onSettings?.()
  }

  const handleLogout = () => {
    handleClose()
    onLogout?.()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        className={className}
        aria-label="user menu"
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar
          src={userAvatar}
          alt={userName}
          sx={{ width: 32, height: 32 }}
        >
          {!userAvatar && (userName ? getInitials(userName) : <AccountCircleIcon />)}
        </Avatar>
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 220,
            mt: 1,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
      >
        {(userName || userEmail) && (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {userName}
            </Typography>
            {userEmail && (
              <Typography variant="body2" color="text.secondary">
                {userEmail}
              </Typography>
            )}
          </Box>
        )}
        
        {(userName || userEmail) && <Divider />}
        
        {onProfile && (
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
        )}
        
        {onSettings && (
          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
        )}
        
        {(onProfile || onSettings) && onLogout && <Divider />}
        
        {onLogout && (
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  )
}