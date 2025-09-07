'use client'

import React, { useState } from 'react'
import { 
  Box, 
  CircularProgress, 
  Backdrop, 
  useTheme, 
  useMediaQuery,
  SwipeableDrawer
} from '@mui/material'
import { HeaderWidget } from '@/widgets/header'
import { SidebarWidget } from '@/widgets/sidebar'
import { IngredientSidebar } from '@/widgets/ingredient-sidebar'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { 
  selectSidebarOpen, 
  selectMobileMenuOpen,
  setSidebarOpen,
  setMobileMenuOpen 
} from '@/features/ui'

const drawerWidth = 240

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const dispatch = useAppDispatch()
  const sidebarOpen = useAppSelector(selectSidebarOpen)
  const mobileMenuOpen = useAppSelector(selectMobileMenuOpen)
  const [loading] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null)
  const [showIngredientSidebar, setShowIngredientSidebar] = useState(true)
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))

  // Auto-adjust sidebar on screen size change
  React.useEffect(() => {
    if (isMobile) {
      dispatch(setSidebarOpen(false))
    } else if (!isTablet) {
      dispatch(setSidebarOpen(true))
    }
  }, [isMobile, isTablet, dispatch])

  const handleMenuClick = () => {
    if (isMobile) {
      dispatch(setMobileMenuOpen(!mobileMenuOpen))
    } else {
      dispatch(setSidebarOpen(!sidebarOpen))
    }
  }

  const handleNavigate = (path: string) => {
    router.push(path)
    // Close mobile menu after navigation
    if (isMobile) {
      dispatch(setMobileMenuOpen(false))
    }
  }

  const handleIngredientClick = (ingredient: any) => {
    setSelectedIngredient(ingredient)
    console.log('Selected ingredient:', ingredient)
  }


  // Mock recent files for now - will be connected to session state later
  const recentFiles = []

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <HeaderWidget 
        onMenuClick={handleMenuClick}
        title="Dynamic Text Editor"
      />
      
      {/* Desktop Sidebar - Use IngredientSidebar for now */}
      {!isMobile && showIngredientSidebar && (
        <IngredientSidebar
          open={sidebarOpen}
          width={320}
          onIngredientClick={handleIngredientClick}
          selectedIngredientId={selectedIngredient?.id}
        />
      )}
      
      {/* Regular Sidebar - Hidden for now */}
      {!isMobile && !showIngredientSidebar && (
        <SidebarWidget
          open={sidebarOpen}
          width={drawerWidth}
          recentFiles={recentFiles}
          onNavigate={handleNavigate}
        />
      )}
      
      {/* Mobile Drawer with Swipe Support */}
      {isMobile && (
        <SwipeableDrawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => dispatch(setMobileMenuOpen(false))}
          onOpen={() => dispatch(setMobileMenuOpen(true))}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              pt: 8, // Account for AppBar height
            },
          }}
        >
          <Box sx={{ overflow: 'auto' }}>
            <SidebarWidget
              open={true}
              width={drawerWidth}
              recentFiles={recentFiles}
              onNavigate={handleNavigate}
            />
          </Box>
        </SwipeableDrawer>
      )}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 }, // Responsive padding
          width: { 
            xs: '100%', // Full width on mobile
            sm: `calc(100% - ${!isMobile && sidebarOpen ? 320 : 0}px)` 
          },
          mt: { xs: 7, sm: 8 }, // Responsive top margin for AppBar
          ml: { 
            xs: 0, // No margin on mobile
            sm: !isMobile && sidebarOpen ? `320px` : 0 
          },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          // Ensure content doesn't overflow on mobile
          overflowX: 'hidden',
          // Minimum touch target size for mobile
          '& button, & a': {
            minHeight: { xs: 44, sm: 'auto' },
            minWidth: { xs: 44, sm: 'auto' },
          },
        }}
      >
        {children}
      </Box>

      {/* Loading Overlay */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 2 
        }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  )
}