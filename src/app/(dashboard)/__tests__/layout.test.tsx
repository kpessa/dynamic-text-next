import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import DashboardLayout from '../layout'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Provider } from 'react-redux'
import { store } from '@/app/store'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock widgets
vi.mock('@/widgets/header', () => ({
  HeaderWidget: ({ onMenuClick, title }: { onMenuClick?: () => void; title?: string }) => (
    <div data-testid="header-widget">
      <button onClick={onMenuClick} data-testid="menu-button">Menu</button>
      <span>{title}</span>
    </div>
  ),
}))

vi.mock('@/widgets/sidebar', () => ({
  SidebarWidget: ({ open, onNavigate }: { open?: boolean; onNavigate?: (path: string) => void }) => (
    <div data-testid="sidebar-widget" data-open={open}>
      <button onClick={() => onNavigate('/test')} data-testid="nav-button">Navigate</button>
    </div>
  ),
}))

const theme = createTheme()

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </Provider>
  )
}

describe('DashboardLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders header, sidebar, and content area', () => {
    renderWithProviders(
      <DashboardLayout>
        <div data-testid="content">Test Content</div>
      </DashboardLayout>
    )

    expect(screen.getByTestId('header-widget')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-widget')).toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('renders with correct title', () => {
    renderWithProviders(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    )

    expect(screen.getByText('Dynamic Text Editor')).toBeInTheDocument()
  })

  it('toggles sidebar when menu button is clicked', () => {
    renderWithProviders(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    )

    const sidebar = screen.getByTestId('sidebar-widget')
    const menuButton = screen.getByTestId('menu-button')

    // Initial state - sidebar should be open
    expect(sidebar).toHaveAttribute('data-open', 'true')

    // Click menu button to close sidebar
    fireEvent.click(menuButton)
    expect(sidebar).toHaveAttribute('data-open', 'false')

    // Click again to open sidebar
    fireEvent.click(menuButton)
    expect(sidebar).toHaveAttribute('data-open', 'true')
  })

  it('renders loading overlay when loading state is active', () => {
    const { container } = renderWithProviders(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    )

    // Check that backdrop exists in DOM (initially hidden)
    const backdrop = container.querySelector('.MuiBackdrop-root')
    expect(backdrop).toBeInTheDocument()
  })

  it('applies correct spacing for main content area', () => {
    const { container } = renderWithProviders(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    )

    const mainContent = container.querySelector('main')
    expect(mainContent).toBeInTheDocument()
    expect(mainContent).toHaveStyle({ flexGrow: '1' })
  })
})