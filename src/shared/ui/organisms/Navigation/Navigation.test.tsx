import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigation } from './Navigation'
import { NavigationItem } from './Navigation.types'
import { Home, Settings } from '@mui/icons-material'

describe('Navigation', () => {
  const mockItemClick = vi.fn()
  const mockSearchChange = vi.fn()
  const mockSearchSubmit = vi.fn()

  const basicItems: NavigationItem[] = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'about', label: 'About', href: '/about' },
    { id: 'contact', label: 'Contact', href: '/contact' }
  ]

  const itemsWithDropdown: NavigationItem[] = [
    { id: 'home', label: 'Home', href: '/' },
    {
      id: 'products',
      label: 'Products',
      children: [
        { id: 'product1', label: 'Product 1', href: '/products/1' },
        { id: 'product2', label: 'Product 2', href: '/products/2' }
      ]
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render navigation items', () => {
      render(
        <Navigation items={basicItems} />
      )

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Contact')).toBeInTheDocument()
    })

    it('should render brand name', () => {
      render(
        <Navigation items={basicItems} brand="Test Brand" />
      )

      expect(screen.getByText('Test Brand')).toBeInTheDocument()
    })

    it('should render logo', () => {
      render(
        <Navigation 
          items={basicItems} 
          logo={<div data-testid="logo">Logo</div>}
        />
      )

      expect(screen.getByTestId('logo')).toBeInTheDocument()
    })

    it('should render right actions', () => {
      render(
        <Navigation 
          items={basicItems}
          rightActions={<button>Sign In</button>}
        />
      )

      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })
  })

  describe('Active State', () => {
    it('should highlight active item', () => {
      render(
        <Navigation items={basicItems} activeId="about" />
      )

      const aboutButton = screen.getByText('About').closest('button')
      expect(aboutButton).toHaveStyle({ fontWeight: 'bold' })
    })
  })

  describe('Dropdown Menus', () => {
    it('should show dropdown on click', async () => {
      render(
        <Navigation items={itemsWithDropdown} />
      )

      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument()
        expect(screen.getByText('Product 2')).toBeInTheDocument()
      })
    })

    it('should close dropdown when item is clicked', async () => {
      render(
        <Navigation items={itemsWithDropdown} onItemClick={mockItemClick} />
      )

      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument()
      })

      const product1 = screen.getByText('Product 1')
      fireEvent.click(product1)

      await waitFor(() => {
        expect(mockItemClick).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'product1' })
        )
      })
    })
  })

  describe('Search Functionality', () => {
    it('should render search bar when showSearch is true', () => {
      render(
        <Navigation 
          items={basicItems} 
          showSearch={true}
          searchPlaceholder="Search here..."
        />
      )

      expect(screen.getByPlaceholderText('Search here...')).toBeInTheDocument()
    })

    it('should call onSearchChange when typing', async () => {
      render(
        <Navigation
          items={basicItems}
          showSearch={true}
          onSearchChange={mockSearchChange}
        />
      )

      const searchInput = screen.getByPlaceholderText('Search...')
      await userEvent.type(searchInput, 'test')

      expect(mockSearchChange).toHaveBeenCalled()
    })

    it('should call onSearchSubmit when form is submitted', async () => {
      render(
        <Navigation
          items={basicItems}
          showSearch={true}
          searchValue="test query"
          onSearchSubmit={mockSearchSubmit}
        />
      )

      const searchForm = screen.getByPlaceholderText('Search...').closest('form')
      if (searchForm) {
        fireEvent.submit(searchForm)
      }

      await waitFor(() => {
        expect(mockSearchSubmit).toHaveBeenCalledWith('test query')
      })
    })
  })

  describe('Item Click', () => {
    it('should call onItemClick when item is clicked', () => {
      render(
        <Navigation items={basicItems} onItemClick={mockItemClick} />
      )

      const homeButton = screen.getByText('Home')
      fireEvent.click(homeButton)

      expect(mockItemClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'home', label: 'Home' })
      )
    })

    it('should not trigger click on disabled items', () => {
      const itemsWithDisabled = [
        ...basicItems,
        { id: 'disabled', label: 'Disabled', href: '/disabled', disabled: true }
      ]

      render(
        <Navigation items={itemsWithDisabled} onItemClick={mockItemClick} />
      )

      const disabledButton = screen.getByText('Disabled').closest('button')
      expect(disabledButton).toBeDisabled()
    })
  })

  describe('Badges', () => {
    it('should render badge on items', () => {
      const itemsWithBadge = [
        { id: 'messages', label: 'Messages', href: '/messages', badge: 5 }
      ]

      render(
        <Navigation items={itemsWithBadge} />
      )

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should render string badge', () => {
      const itemsWithBadge = [
        { id: 'new', label: 'New Features', href: '/new', badge: 'NEW' }
      ]

      render(
        <Navigation items={itemsWithBadge} />
      )

      expect(screen.getByText('NEW')).toBeInTheDocument()
    })
  })

  describe('Icons', () => {
    it('should render icons with items', () => {
      const itemsWithIcons = [
        { id: 'home', label: 'Home', href: '/', icon: <Home data-testid="home-icon" /> },
        { id: 'settings', label: 'Settings', href: '/settings', icon: <Settings data-testid="settings-icon" /> }
      ]

      render(
        <Navigation items={itemsWithIcons} />
      )

      expect(screen.getByTestId('home-icon')).toBeInTheDocument()
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
    })
  })

  describe('External Links', () => {
    it('should add target and rel attributes for external links', () => {
      const itemsWithExternal = [
        { id: 'docs', label: 'Docs', href: 'https://docs.example.com', external: true }
      ]

      render(
        <Navigation items={itemsWithExternal} />
      )

      const docsButton = screen.getByText('Docs').closest('a')
      expect(docsButton).toHaveAttribute('target', '_blank')
      expect(docsButton).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('Variants', () => {
    it('should apply transparent variant', () => {
      const { container } = render(
        <Navigation items={basicItems} variant="transparent" />
      )

      const appBar = container.querySelector('.MuiAppBar-root')
      expect(appBar).toHaveStyle({ backgroundColor: 'transparent' })
    })

    it('should apply dark variant', () => {
      const { container } = render(
        <Navigation items={basicItems} variant="dark" />
      )

      const appBar = container.querySelector('.MuiAppBar-root')
      expect(appBar).toBeTruthy()
    })
  })

  describe('Position', () => {
    it('should apply fixed position', () => {
      const { container } = render(
        <Navigation items={basicItems} position="fixed" />
      )

      const appBar = container.querySelector('.MuiAppBar-positionFixed')
      expect(appBar).toBeInTheDocument()
    })

    it('should apply sticky position', () => {
      const { container } = render(
        <Navigation items={basicItems} position="sticky" />
      )

      const appBar = container.querySelector('.MuiAppBar-positionSticky')
      expect(appBar).toBeInTheDocument()
    })
  })

  describe('Mobile Menu', () => {
    it('should show mobile menu button on small screens', () => {
      // Mock small screen
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      render(
        <Navigation items={basicItems} mobileBreakpoint="md" />
      )

      const menuButton = screen.getByLabelText('open drawer')
      expect(menuButton).toBeInTheDocument()
    })
  })

  describe('Dividers', () => {
    it('should render dividers between items', () => {
      const itemsWithDivider = [
        { id: 'home', label: 'Home', href: '/' },
        { id: 'about', label: 'About', href: '/about', divider: true }
      ]

      const { container } = render(
        <Navigation items={itemsWithDivider} />
      )

      const dividers = container.querySelectorAll('.MuiDivider-root')
      expect(dividers.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <Navigation items={basicItems} showSearch={true} />
      )

      expect(screen.getByLabelText('search')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      render(
        <Navigation items={basicItems} />
      )

      const homeButton = screen.getByText('Home')
      homeButton.focus()
      expect(document.activeElement).toBe(homeButton)
    })
  })
})