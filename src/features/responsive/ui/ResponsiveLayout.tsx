import React from 'react'
import {
  Box,
  Container,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material'
import {
  Menu as MenuIcon,
  ArrowBack as BackIcon,
  Home as HomeIcon
} from '@mui/icons-material'
import { MobileNavigation } from './MobileNavigation'
import { useRouter } from 'next/navigation'
import { useResponsive } from '../lib/useResponsive'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
  showMobileNav?: boolean
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
  noPadding?: boolean
  fullHeight?: boolean
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  title,
  showBackButton = false,
  showMobileNav = true,
  maxWidth = 'lg',
  noPadding = false,
  fullHeight = false
}) => {
  const theme = useTheme()
  const router = useRouter()
  const { isMobile, isTablet, isTouchDevice } = useResponsive()
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const handleBack = () => {
    router.back()
  }

  const handleHome = () => {
    router.push('/dashboard')
  }

  // Mobile layout with app bar
  if (isMobile) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          pb: showMobileNav ? 7 : 0 // Space for bottom navigation
        }}
      >
        {/* Mobile App Bar */}
        {title && (
          <AppBar position="sticky" elevation={1}>
            <Toolbar>
              {showBackButton ? (
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={handleBack}
                  sx={{ mr: 2 }}
                >
                  <BackIcon />
                </IconButton>
              ) : (
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={() => setDrawerOpen(true)}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} noWrap>
                {title}
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 240,
              paddingTop: 'env(safe-area-inset-top)'
            }
          }}
        >
          <List>
            <ListItem>
              <ListItemButton onClick={handleHome}>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
        </Drawer>

        {/* Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: noPadding ? 0 : 2,
            paddingBottom: noPadding ? 0 : 'env(safe-area-inset-bottom)',
            minHeight: fullHeight ? 'calc(100vh - 56px - 56px)' : 'auto' // Minus app bar and nav
          }}
        >
          {children}
        </Box>

        {/* Mobile Bottom Navigation */}
        {showMobileNav && <MobileNavigation />}
      </Box>
    )
  }

  // Tablet/Desktop layout
  return (
    <Box
      sx={{
        minHeight: fullHeight ? '100vh' : 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Desktop Header (if needed) */}
      {title && !isMobile && (
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            py: 2,
            px: 3,
            bgcolor: 'background.paper'
          }}
        >
          <Container maxWidth={maxWidth}>
            <Typography variant="h4">{title}</Typography>
          </Container>
        </Box>
      )}

      {/* Main Content */}
      <Container
        maxWidth={maxWidth}
        sx={{
          flexGrow: 1,
          py: noPadding ? 0 : { xs: 2, sm: 3, md: 4 },
          px: noPadding ? 0 : undefined
        }}
      >
        {children}
      </Container>
    </Box>
  )
}

// Responsive grid container
interface ResponsiveGridProps {
  children: React.ReactNode
  spacing?: number
  columns?: { xs: number; sm: number; md: number; lg: number }
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  spacing = 2,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 }
}) => {
  const { screenSize } = useResponsive()

  const getColumns = () => {
    switch (screenSize) {
      case 'mobile':
        return columns.xs
      case 'tablet':
        return columns.sm
      case 'desktop':
        return columns.md
      case 'largeDesktop':
        return columns.lg
      default:
        return columns.md
    }
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${getColumns()}, 1fr)`,
        gap: spacing
      }}
    >
      {children}
    </Box>
  )
}

// Responsive section wrapper
interface ResponsiveSectionProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  action?: React.ReactNode
  collapsible?: boolean
  defaultExpanded?: boolean
}

export const ResponsiveSection: React.FC<ResponsiveSectionProps> = ({
  children,
  title,
  subtitle,
  action,
  collapsible = false,
  defaultExpanded = true
}) => {
  const { isMobile } = useResponsive()
  const [expanded, setExpanded] = React.useState(defaultExpanded)

  if (collapsible && isMobile) {
    return (
      <Box sx={{ mb: 2 }}>
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            cursor: 'pointer',
            '&:active': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <Box>
            {title && <Typography variant="h6">{title}</Typography>}
            {subtitle && !expanded && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Box>
        {expanded && (
          <Box sx={{ p: 2, pt: 0 }}>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {subtitle}
              </Typography>
            )}
            {children}
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Box sx={{ mb: 3 }}>
      {(title || subtitle || action) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2
          }}
        >
          <Box>
            {title && <Typography variant="h5">{title}</Typography>}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Box>
      )}
      {children}
    </Box>
  )
}