// UI Feature Public API

// Navigation slice
export {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setActiveRoute,
  setBreadcrumbs,
  setNavigating,
  resetNavigation,
  selectSidebarOpen,
  selectMobileMenuOpen,
  selectActiveRoute,
  selectBreadcrumbs,
  selectIsNavigating,
} from './model/navigationSlice'

// Hooks
export { useBreadcrumbs } from './hooks/useBreadcrumbs'