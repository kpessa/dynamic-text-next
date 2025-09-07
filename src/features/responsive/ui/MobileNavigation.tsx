import React from 'react'
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Calculate as CalculateIcon,
  Science as IngredientsIcon,
  Compare as CompareIcon,
  Settings as SettingsIcon
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

interface MobileNavigationProps {
  currentPath?: string
  notificationCount?: number
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentPath = '/dashboard',
  notificationCount = 0
}) => {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const navigationItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Calculate', icon: <CalculateIcon />, path: '/tpn/calculator' },
    { label: 'Ingredients', icon: <IngredientsIcon />, path: '/ingredients/manage' },
    { label: 'Compare', icon: <CompareIcon />, path: '/comparison' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  if (!isMobile) {
    return null
  }

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        borderTop: 1,
        borderColor: 'divider'
      }}
      elevation={3}
    >
      <BottomNavigation
        value={currentPath}
        onChange={(event, newValue) => handleNavigation(newValue)}
        sx={{
          height: 56,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 0',
            '&.Mui-selected': {
              fontSize: '0.75rem'
            }
          }
        }}
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={
              item.path === '/dashboard' && notificationCount > 0 ? (
                <Badge badgeContent={notificationCount} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )
            }
            value={item.path}
            sx={{
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
                marginTop: '2px'
              }
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  )
}