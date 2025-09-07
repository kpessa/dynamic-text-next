import { describe, it, expect } from 'vitest'
import navigationReducer, {
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
} from '../navigationSlice'
import type { BreadcrumbItem } from '../navigationSlice'

describe('navigationSlice', () => {
  const initialState = {
    sidebarOpen: true,
    mobileMenuOpen: false,
    activeRoute: '/',
    breadcrumbs: [],
    isNavigating: false,
  }

  it('should handle toggleSidebar', () => {
    const state = navigationReducer(initialState, toggleSidebar())
    expect(state.sidebarOpen).toBe(false)
    
    const state2 = navigationReducer(state, toggleSidebar())
    expect(state2.sidebarOpen).toBe(true)
  })

  it('should handle setSidebarOpen', () => {
    const state = navigationReducer(initialState, setSidebarOpen(false))
    expect(state.sidebarOpen).toBe(false)
  })

  it('should handle toggleMobileMenu', () => {
    const state = navigationReducer(initialState, toggleMobileMenu())
    expect(state.mobileMenuOpen).toBe(true)
    
    const state2 = navigationReducer(state, toggleMobileMenu())
    expect(state2.mobileMenuOpen).toBe(false)
  })

  it('should handle setMobileMenuOpen', () => {
    const state = navigationReducer(initialState, setMobileMenuOpen(true))
    expect(state.mobileMenuOpen).toBe(true)
  })

  it('should handle setActiveRoute and generate breadcrumbs', () => {
    const state = navigationReducer(initialState, setActiveRoute('/tpn/calculator'))
    expect(state.activeRoute).toBe('/tpn/calculator')
    expect(state.breadcrumbs).toHaveLength(3)
    expect(state.breadcrumbs[0]).toEqual({ label: 'Home', href: '/' })
    expect(state.breadcrumbs[1]).toEqual({ label: 'TPN', href: '/tpn' })
    expect(state.breadcrumbs[2]).toEqual({ label: 'Calculator', href: undefined })
  })

  it('should handle complex routes with breadcrumbs', () => {
    const state = navigationReducer(initialState, setActiveRoute('/ingredients/shared'))
    expect(state.breadcrumbs).toHaveLength(3)
    expect(state.breadcrumbs[0]).toEqual({ label: 'Home', href: '/' })
    expect(state.breadcrumbs[1]).toEqual({ label: 'Ingredients', href: '/ingredients' })
    expect(state.breadcrumbs[2]).toEqual({ label: 'Shared Ingredients', href: undefined })
  })

  it('should handle setBreadcrumbs manually', () => {
    const customBreadcrumbs: BreadcrumbItem[] = [
      { label: 'Custom', href: '/custom' },
      { label: 'Path', href: undefined },
    ]
    const state = navigationReducer(initialState, setBreadcrumbs(customBreadcrumbs))
    expect(state.breadcrumbs).toEqual(customBreadcrumbs)
  })

  it('should handle setNavigating', () => {
    const state = navigationReducer(initialState, setNavigating(true))
    expect(state.isNavigating).toBe(true)
  })

  it('should handle resetNavigation', () => {
    const modifiedState = {
      sidebarOpen: false,
      mobileMenuOpen: true,
      activeRoute: '/test',
      breadcrumbs: [{ label: 'Test', href: '/test' }],
      isNavigating: true,
    }
    const state = navigationReducer(modifiedState, resetNavigation())
    expect(state).toEqual(initialState)
  })

  describe('selectors', () => {
    const mockState = {
      navigation: {
        sidebarOpen: false,
        mobileMenuOpen: true,
        activeRoute: '/test',
        breadcrumbs: [{ label: 'Test', href: '/test' }],
        isNavigating: true,
      }
    }

    it('should select sidebarOpen', () => {
      expect(selectSidebarOpen(mockState as any)).toBe(false)
    })

    it('should select mobileMenuOpen', () => {
      expect(selectMobileMenuOpen(mockState as any)).toBe(true)
    })

    it('should select activeRoute', () => {
      expect(selectActiveRoute(mockState as any)).toBe('/test')
    })

    it('should select breadcrumbs', () => {
      expect(selectBreadcrumbs(mockState as any)).toEqual([{ label: 'Test', href: '/test' }])
    })

    it('should select isNavigating', () => {
      expect(selectIsNavigating(mockState as any)).toBe(true)
    })
  })
})