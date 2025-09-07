import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: string
}

interface NavigationState {
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  activeRoute: string
  breadcrumbs: BreadcrumbItem[]
  isNavigating: boolean
}

const initialState: NavigationState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  activeRoute: '/',
  breadcrumbs: [],
  isNavigating: false,
}

export const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload
    },
    setActiveRoute: (state, action: PayloadAction<string>) => {
      state.activeRoute = action.payload
      // Auto-generate breadcrumbs from route
      state.breadcrumbs = generateBreadcrumbs(action.payload)
    },
    setBreadcrumbs: (state, action: PayloadAction<BreadcrumbItem[]>) => {
      state.breadcrumbs = action.payload
    },
    setNavigating: (state, action: PayloadAction<boolean>) => {
      state.isNavigating = action.payload
    },
    resetNavigation: (state) => {
      return initialState
    },
  },
})

// Helper function to generate breadcrumbs from route
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ]

  if (pathname === '/') {
    return breadcrumbs
  }

  const segments = pathname.split('/').filter(Boolean)
  let currentPath = ''

  const routeLabels: Record<string, string> = {
    'tpn': 'TPN',
    'calculator': 'Calculator',
    'history': 'History',
    'compare': 'Population Comparison',
    'ingredients': 'Ingredients',
    'manage': 'Manage',
    'shared': 'Shared Ingredients',
    'import': 'Import Wizard',
    'editor': 'Editor',
    'new': 'New Document',
    'edit': 'Edit Document',
    'settings': 'Settings',
    'preferences': 'Preferences',
    'profile': 'Profile',
    'auth': 'Authentication',
    'login': 'Login',
    'register': 'Register',
  }

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // Skip route groups (e.g., (dashboard), (auth))
    if (segment.startsWith('(') && segment.endsWith(')')) {
      return
    }

    // Handle dynamic segments (e.g., [id])
    if (segment.startsWith('[') && segment.endsWith(']')) {
      breadcrumbs.push({
        label: 'Details',
        href: currentPath,
      })
    } else {
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      breadcrumbs.push({
        label,
        href: index === segments.length - 1 ? undefined : currentPath,
      })
    }
  })

  return breadcrumbs
}

// Actions
export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setActiveRoute,
  setBreadcrumbs,
  setNavigating,
  resetNavigation,
} = navigationSlice.actions

// Selectors
export const selectSidebarOpen = (state: RootState) => state.navigation.sidebarOpen
export const selectMobileMenuOpen = (state: RootState) => state.navigation.mobileMenuOpen
export const selectActiveRoute = (state: RootState) => state.navigation.activeRoute
export const selectBreadcrumbs = (state: RootState) => state.navigation.breadcrumbs
export const selectIsNavigating = (state: RootState) => state.navigation.isNavigating

export default navigationSlice.reducer