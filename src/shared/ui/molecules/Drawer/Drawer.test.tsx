import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Drawer, MiniDrawer, NavigationDrawer } from './Drawer'
import { Button } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import SettingsIcon from '@mui/icons-material/Settings'

describe('Drawer', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    title: 'Test Drawer',
    children: <div>Drawer Content</div>,
  }

  it('should render correctly', () => {
    render(<Drawer {...defaultProps} />)
    expect(screen.getByText('Test Drawer')).toBeInTheDocument()
    expect(screen.getByText('Drawer Content')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<Drawer {...defaultProps} onClose={onClose} />)
    
    const closeButton = screen.getByLabelText('close drawer')
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalled()
  })

  it('should render without title', () => {
    render(<Drawer {...defaultProps} title={undefined} />)
    expect(screen.queryByText('Test Drawer')).not.toBeInTheDocument()
    expect(screen.getByText('Drawer Content')).toBeInTheDocument()
  })

  it('should render with actions', () => {
    render(
      <Drawer
        {...defaultProps}
        actions={
          <>
            <Button>Cancel</Button>
            <Button>Apply</Button>
          </>
        }
      />
    )
    
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Apply')).toBeInTheDocument()
  })

  it('should hide close button when showCloseButton is false', () => {
    render(<Drawer {...defaultProps} showCloseButton={false} />)
    expect(screen.queryByLabelText('close drawer')).not.toBeInTheDocument()
  })

  it('should handle different anchors', () => {
    const anchors = ['left', 'right', 'top', 'bottom'] as const
    anchors.forEach(anchor => {
      const { rerender } = render(<Drawer {...defaultProps} anchor={anchor} />)
      expect(screen.getByText('Drawer Content')).toBeInTheDocument()
      rerender(<div />)
    })
  })

  it('should handle different variants', () => {
    const variants = ['temporary', 'persistent', 'permanent'] as const
    variants.forEach(variant => {
      const { rerender } = render(<Drawer {...defaultProps} variant={variant} />)
      expect(screen.getByText('Drawer Content')).toBeInTheDocument()
      rerender(<div />)
    })
  })

  it('should handle custom width', () => {
    render(<Drawer {...defaultProps} width={400} />)
    expect(screen.getByText('Drawer Content')).toBeInTheDocument()
  })
})

describe('MiniDrawer', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    title: 'Mini Drawer',
    children: <div>Mini Drawer Content</div>,
  }

  it('should render correctly', () => {
    render(<MiniDrawer {...defaultProps} />)
    expect(screen.getByLabelText('toggle drawer')).toBeInTheDocument()
  })

  it('should toggle expansion when button is clicked', () => {
    const onExpand = vi.fn()
    render(<MiniDrawer {...defaultProps} onExpand={onExpand} expanded={false} />)
    
    const toggleButton = screen.getByLabelText('toggle drawer')
    fireEvent.click(toggleButton)
    
    expect(onExpand).toHaveBeenCalledWith(true)
  })

  it('should handle expandOnHover', async () => {
    const { container } = render(
      <MiniDrawer {...defaultProps} expandOnHover expanded={false} />
    )
    
    const drawer = container.firstChild
    if (drawer) {
      fireEvent.mouseEnter(drawer)
      await waitFor(() => {
        expect(screen.getByText('Mini Drawer Content')).toBeInTheDocument()
      })
      
      fireEvent.mouseLeave(drawer)
    }
  })

  it('should handle custom miniWidth and expandedWidth', () => {
    render(
      <MiniDrawer
        {...defaultProps}
        miniWidth={80}
        expandedWidth={320}
        expanded={false}
      />
    )
    expect(screen.getByLabelText('toggle drawer')).toBeInTheDocument()
  })

  it('should show title when expanded', () => {
    render(<MiniDrawer {...defaultProps} expanded={true} />)
    expect(screen.getByText('Mini Drawer')).toBeInTheDocument()
  })

  it('should show actions when expanded', () => {
    render(
      <MiniDrawer
        {...defaultProps}
        expanded={true}
        actions={<Button>Action</Button>}
      />
    )
    expect(screen.getByText('Action')).toBeInTheDocument()
  })
})

describe('NavigationDrawer', () => {
  const items = [
    { text: 'Home', icon: <HomeIcon />, selected: true },
    { text: 'Settings', icon: <SettingsIcon /> },
    { text: 'Disabled Item', disabled: true },
  ]

  const defaultProps = {
    items,
    open: true,
    onClose: vi.fn(),
    title: 'Navigation',
  }

  it('should render navigation items', () => {
    render(<NavigationDrawer {...defaultProps} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Disabled Item')).toBeInTheDocument()
  })

  it('should call onItemClick when item is clicked', () => {
    const onItemClick = vi.fn()
    render(<NavigationDrawer {...defaultProps} onItemClick={onItemClick} />)
    
    fireEvent.click(screen.getByText('Settings'))
    expect(onItemClick).toHaveBeenCalledWith(1)
  })

  it('should call item onClick handler', () => {
    const onClick = vi.fn()
    const customItems = [
      { text: 'Clickable', onClick },
    ]
    
    render(<NavigationDrawer {...defaultProps} items={customItems} />)
    fireEvent.click(screen.getByText('Clickable'))
    expect(onClick).toHaveBeenCalled()
  })

  it('should close temporary drawer after item click', () => {
    const onClose = vi.fn()
    render(
      <NavigationDrawer
        {...defaultProps}
        variant="temporary"
        onClose={onClose}
      />
    )
    
    fireEvent.click(screen.getByText('Settings'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should not close persistent drawer after item click', () => {
    const onClose = vi.fn()
    render(
      <NavigationDrawer
        {...defaultProps}
        variant="persistent"
        onClose={onClose}
      />
    )
    
    fireEvent.click(screen.getByText('Settings'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should disable clicking on disabled items', () => {
    const onItemClick = vi.fn()
    render(<NavigationDrawer {...defaultProps} onItemClick={onItemClick} />)
    
    const disabledItem = screen.getByText('Disabled Item').closest('[role="button"]')
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true')
  })

  it('should show selected state', () => {
    render(<NavigationDrawer {...defaultProps} />)
    
    const homeItem = screen.getByText('Home').closest('[role="button"]')
    expect(homeItem).toHaveClass('Mui-selected')
  })
})