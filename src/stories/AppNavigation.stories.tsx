import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Box, List, ListItem, ListItemText, ListItemIcon, Paper, Typography, Divider, Chip } from '@mui/material'
import {
  Home as HomeIcon,
  Calculate as CalculateIcon,
  Restaurant as IngredientsIcon,
  Description as DocumentIcon,
  Compare as CompareIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Login as LoginIcon,
} from '@mui/icons-material'

// Component to display all available routes
const AppNavigation = () => {
  const routes = [
    {
      path: '/',
      name: 'Home Page',
      icon: <HomeIcon />,
      status: 'working',
      description: 'Landing page with welcome message and quick actions',
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <DashboardIcon />,
      status: 'partial',
      description: 'Main dashboard with statistics and recent activity',
    },
    {
      path: '/tpn/calculator',
      name: 'TPN Calculator',
      icon: <CalculateIcon />,
      status: 'working',
      description: 'Full TPN calculation with input, results, and validation tabs',
    },
    {
      path: '/ingredients/manage',
      name: 'Ingredients Manager',
      icon: <IngredientsIcon />,
      status: 'partial',
      description: 'Manage ingredients, import/export, duplicate detection',
    },
    {
      path: '/documents/editor',
      name: 'Document Editor',
      icon: <DocumentIcon />,
      status: 'missing',
      description: 'Create and edit dynamic documents with formulas',
    },
    {
      path: '/comparison',
      name: 'Comparison Tool',
      icon: <CompareIcon />,
      status: 'missing',
      description: 'Compare ingredient values across populations',
    },
    {
      path: '/settings',
      name: 'Settings',
      icon: <SettingsIcon />,
      status: 'working',
      description: 'Application preferences and configuration',
    },
    {
      path: '/login',
      name: 'Login',
      icon: <LoginIcon />,
      status: 'partial',
      description: 'Authentication page (Firebase not configured)',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return 'success'
      case 'partial':
        return 'warning'
      case 'missing':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'working':
        return '✅ Working'
      case 'partial':
        return '⚠️ Partial'
      case 'missing':
        return '❌ Missing'
      default:
        return status
    }
  }

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Application Routes & Pages
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Overview of all available routes in the application and their current implementation status.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <List>
          {routes.map((route, index) => (
            <React.Fragment key={route.path}>
              <ListItem>
                <ListItemIcon>{route.icon}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">{route.name}</Typography>
                      <Chip
                        label={getStatusLabel(route.status)}
                        color={getStatusColor(route.status) as any}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
                        {route.path}
                      </Typography>
                      <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                        {route.description}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < routes.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
        
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Status Legend:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label="✅ Working - Fully functional" color="success" size="small" />
            <Chip label="⚠️ Partial - Basic implementation" color="warning" size="small" />
            <Chip label="❌ Missing - Not implemented" color="error" size="small" />
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

const meta = {
  title: 'Pages/Navigation Overview',
  component: AppNavigation,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Overview of all application routes and their implementation status',
      },
    },
  },
} satisfies Meta<typeof AppNavigation>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: 'All Routes',
  parameters: {
    docs: {
      description: {
        story: 'Complete list of all application routes with their current status',
      },
    },
  },
}

export const DarkMode: Story = {
  name: 'Dark Mode',
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'Navigation overview in dark mode',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#121212', minHeight: '100vh' }}>
        <Story />
      </div>
    ),
  ],
}