import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { 
  Breadcrumbs, 
  CollapsibleBreadcrumbs,
  IconBreadcrumbs,
  ChipBreadcrumbs,
  CustomSeparatorBreadcrumbs
} from './Breadcrumbs'
import HomeIcon from '@mui/icons-material/Home'
import FolderIcon from '@mui/icons-material/Folder'

describe('Breadcrumbs', () => {
  const defaultItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Electronics', href: '/products/electronics' },
    { label: 'Laptop' },
  ]

  const defaultProps = {
    items: defaultItems,
  }

  it('should render breadcrumb items', () => {
    render(<Breadcrumbs {...defaultProps} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Electronics')).toBeInTheDocument()
    expect(screen.getByText('Laptop')).toBeInTheDocument()
  })

  it('should render last item as text (not link)', () => {
    render(<Breadcrumbs {...defaultProps} />)
    const lastItem = screen.getByText('Laptop')
    expect(lastItem.tagName).not.toBe('A')
  })

  it('should handle onClick for items', () => {
    const onClick = vi.fn()
    const items = [
      { label: 'Clickable', onClick },
      { label: 'Last' },
    ]
    
    render(<Breadcrumbs items={items} />)
    fireEvent.click(screen.getByText('Clickable'))
    expect(onClick).toHaveBeenCalled()
  })

  it('should render disabled items', () => {
    const onClick = vi.fn()
    const items = [
      { label: 'Disabled', disabled: true, onClick },
      { label: 'Active' },
    ]
    
    render(<Breadcrumbs items={items} />)
    const disabledItem = screen.getByText('Disabled')
    // Disabled item should not be clickable
    fireEvent.click(disabledItem)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('should render with icons', () => {
    const items = [
      { label: 'Home', icon: <HomeIcon data-testid="home-icon" /> },
      { label: 'Folder', icon: <FolderIcon data-testid="folder-icon" /> },
      { label: 'File' },
    ]
    
    render(<Breadcrumbs items={items} />)
    expect(screen.getByTestId('home-icon')).toBeInTheDocument()
    expect(screen.getByTestId('folder-icon')).toBeInTheDocument()
  })

  it('should show home when showHome is true', () => {
    render(<Breadcrumbs items={[{ label: 'Page' }]} showHome />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Page')).toBeInTheDocument()
  })

  it('should handle custom separators', () => {
    const { container } = render(
      <Breadcrumbs 
        items={defaultItems} 
        separator={<span data-testid="separator">•</span>} 
      />
    )
    const separators = screen.getAllByTestId('separator')
    expect(separators.length).toBeGreaterThan(0)
  })

  it('should handle maxItems for collapsing', () => {
    const manyItems = Array.from({ length: 10 }, (_, i) => ({
      label: `Item ${i + 1}`,
    }))
    
    render(<Breadcrumbs items={manyItems} maxItems={4} />)
    // Should show collapsed button with MoreHorizIcon
    const collapseButton = screen.getByLabelText('Show path')
    expect(collapseButton).toBeInTheDocument()
  })
})

describe('CollapsibleBreadcrumbs', () => {
  it('should collapse long breadcrumbs', () => {
    const items = Array.from({ length: 8 }, (_, i) => ({
      label: `Item ${i + 1}`,
    }))
    
    render(<CollapsibleBreadcrumbs items={items} collapseThreshold={4} />)
    // Should show collapsed button
    const collapseButton = screen.getByLabelText('Show path')
    expect(collapseButton).toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 8')).toBeInTheDocument()
  })
})

describe('IconBreadcrumbs', () => {
  it('should add home icon to first item if not present', () => {
    const items = [
      { label: 'First' },
      { label: 'Second' },
    ]
    
    const { container } = render(<IconBreadcrumbs items={items} />)
    const homeIcon = container.querySelector('[data-testid="HomeIcon"]')
    expect(homeIcon).toBeInTheDocument()
  })
})

describe('ChipBreadcrumbs', () => {
  it('should render items as chips', () => {
    const items = [
      { label: 'Chip 1' },
      { label: 'Chip 2' },
    ]
    
    render(<ChipBreadcrumbs items={items} />)
    const chips = document.querySelectorAll('.MuiChip-root')
    expect(chips).toHaveLength(2)
  })

  it('should make last chip primary color', () => {
    const items = [
      { label: 'First' },
      { label: 'Last' },
    ]
    
    render(<ChipBreadcrumbs items={items} />)
    const chips = document.querySelectorAll('.MuiChip-root')
    const lastChip = chips[chips.length - 1]
    expect(lastChip).toHaveClass('MuiChip-colorPrimary')
  })
})

describe('CustomSeparatorBreadcrumbs', () => {
  it('should use custom separator', () => {
    const items = [
      { label: 'First' },
      { label: 'Second' },
      { label: 'Third' },
    ]
    
    render(
      <CustomSeparatorBreadcrumbs 
        items={items} 
        customSeparator={<span data-testid="custom-sep">|</span>} 
      />
    )
    
    const separators = screen.getAllByTestId('custom-sep')
    expect(separators.length).toBeGreaterThan(0)
  })
})