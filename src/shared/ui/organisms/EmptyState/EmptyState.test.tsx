import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from './EmptyState'
import { Add as AddIcon } from '@mui/icons-material'

describe('EmptyState', () => {
  describe('Rendering', () => {
    it('should render with title and description', () => {
      render(
        <EmptyState
          title="No items"
          description="Add some items to get started"
        />
      )
      
      expect(screen.getByText('No items')).toBeInTheDocument()
      expect(screen.getByText('Add some items to get started')).toBeInTheDocument()
    })

    it('should render default content for variant', () => {
      render(<EmptyState variant="error" />)
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('An error occurred while loading the content. Please try again.')).toBeInTheDocument()
    })

    it('should render custom icon', () => {
      render(
        <EmptyState
          title="Test"
          icon={<div data-testid="custom-icon">Custom Icon</div>}
        />
      )
      
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })

    it('should render image instead of icon', () => {
      render(
        <EmptyState
          title="Test"
          image="test-image.png"
          imageAlt="Test Image"
        />
      )
      
      const img = screen.getByRole('img', { name: 'Test Image' })
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'test-image.png')
    })

    it('should render children content', () => {
      render(
        <EmptyState title="Test">
          <div data-testid="child-content">Additional content</div>
        </EmptyState>
      )
      
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
    })

    it('should render footer content', () => {
      render(
        <EmptyState
          title="Test"
          footer={<div data-testid="footer">Footer content</div>}
        />
      )
      
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('should render error variant with correct icon', () => {
      render(<EmptyState variant="error" />)
      
      expect(document.querySelector('[data-testid="ErrorIcon"]')).toBeInTheDocument()
    })

    it('should render no-results variant', () => {
      render(<EmptyState variant="no-results" />)
      
      expect(screen.getByText('No results found')).toBeInTheDocument()
      expect(document.querySelector('[data-testid="SearchOffIcon"]')).toBeInTheDocument()
    })

    it('should render no-data variant', () => {
      render(<EmptyState variant="no-data" />)
      
      expect(screen.getByText('No data available')).toBeInTheDocument()
      expect(document.querySelector('[data-testid="CloudOffIcon"]')).toBeInTheDocument()
    })

    it('should render no-permission variant', () => {
      render(<EmptyState variant="no-permission" />)
      
      expect(screen.getByText('Access denied')).toBeInTheDocument()
      expect(document.querySelector('[data-testid="LockIcon"]')).toBeInTheDocument()
    })

    it('should render coming-soon variant', () => {
      render(<EmptyState variant="coming-soon" />)
      
      expect(screen.getByText('Coming soon')).toBeInTheDocument()
      expect(document.querySelector('[data-testid="ConstructionIcon"]')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('should render primary action button', () => {
      const onClick = vi.fn()
      render(
        <EmptyState
          title="Test"
          primaryAction={{
            label: 'Primary Action',
            onClick,
            startIcon: <AddIcon />
          }}
        />
      )
      
      const button = screen.getByRole('button', { name: /Primary Action/i })
      expect(button).toBeInTheDocument()
      
      fireEvent.click(button)
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should render secondary action button', () => {
      const onClick = vi.fn()
      render(
        <EmptyState
          title="Test"
          secondaryAction={{
            label: 'Secondary Action',
            onClick
          }}
        />
      )
      
      const button = screen.getByRole('button', { name: 'Secondary Action' })
      expect(button).toBeInTheDocument()
      
      fireEvent.click(button)
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should render both action buttons', () => {
      const primaryClick = vi.fn()
      const secondaryClick = vi.fn()
      
      render(
        <EmptyState
          title="Test"
          primaryAction={{
            label: 'Primary',
            onClick: primaryClick
          }}
          secondaryAction={{
            label: 'Secondary',
            onClick: secondaryClick
          }}
        />
      )
      
      expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Secondary' })).toBeInTheDocument()
    })

    it('should render custom actions instead of default buttons', () => {
      render(
        <EmptyState
          title="Test"
          primaryAction={{
            label: 'Primary',
            onClick: vi.fn()
          }}
          customActions={<div data-testid="custom-actions">Custom Actions</div>}
        />
      )
      
      expect(screen.getByTestId('custom-actions')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Primary' })).not.toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render in vertical orientation by default', () => {
      render(<EmptyState title="Test" description="Description" />)
      
      // In vertical orientation, text should be center-aligned
      const title = screen.getByText('Test')
      const container = title.closest('div')
      expect(container).toHaveStyle({ textAlign: 'center' })
    })

    it('should render in horizontal orientation', () => {
      render(
        <EmptyState
          title="Test"
          description="Description"
          orientation="horizontal"
        />
      )
      
      // In horizontal orientation, text should be left-aligned
      const title = screen.getByText('Test')
      const container = title.closest('div')
      expect(container).toHaveStyle({ textAlign: 'left' })
    })

    it('should apply small size styling', () => {
      render(<EmptyState title="Test" size="small" />)
      
      const title = screen.getByText('Test')
      expect(title).toHaveClass('MuiTypography-h6')
    })

    it('should apply large size styling', () => {
      render(<EmptyState title="Test" size="large" />)
      
      const title = screen.getByText('Test')
      expect(title).toHaveClass('MuiTypography-h4')
    })

    it('should apply full height when specified', () => {
      render(<EmptyState title="Test" fullHeight />)
      
      const container = screen.getByText('Test').closest('div')?.parentElement
      expect(container).toHaveStyle({ minHeight: '100vh' })
    })

    it('should apply custom minHeight', () => {
      render(<EmptyState title="Test" minHeight={500} />)
      
      const container = screen.getByText('Test').closest('div')?.parentElement
      expect(container).toHaveStyle({ minHeight: '500px' })
    })
  })

  describe('Styling', () => {
    it('should apply bordered style', () => {
      const { container } = render(<EmptyState title="Test" bordered />)
      
      const paper = container.querySelector('.MuiPaper-outlined')
      expect(paper).toBeInTheDocument()
    })

    it('should apply elevation', () => {
      const { container } = render(<EmptyState title="Test" elevation={3} />)
      
      const paper = container.querySelector('.MuiPaper-elevation3')
      expect(paper).toBeInTheDocument()
    })

    it('should apply rounded corners', () => {
      render(<EmptyState title="Test" bordered rounded />)
      
      const container = screen.getByText('Test').closest('.MuiPaper-root')
      expect(container).toHaveStyle({ borderRadius: expect.stringContaining('px') })
    })

    it('should apply background color', () => {
      render(<EmptyState title="Test" backgroundColor="#f5f5f5" />)
      
      const container = screen.getByText('Test').closest('div')?.parentElement
      expect(container).toHaveStyle({ backgroundColor: '#f5f5f5' })
    })

    it('should apply icon color', () => {
      render(<EmptyState title="Test" variant="error" iconColor="primary" />)
      
      const iconContainer = document.querySelector('[data-testid="ErrorIcon"]')?.parentElement
      expect(iconContainer).toHaveStyle({ color: expect.stringContaining('primary.main') })
    })

    it('should apply custom sx prop', () => {
      render(
        <EmptyState
          title="Test"
          sx={{ padding: 10, margin: 5 }}
        />
      )
      
      const container = screen.getByText('Test').closest('div')?.parentElement
      expect(container).toHaveStyle({ padding: expect.stringContaining('80px') })
    })
  })

  describe('Size Variations', () => {
    it('should render small size with correct typography', () => {
      render(
        <EmptyState
          title="Small Title"
          description="Small description"
          size="small"
        />
      )
      
      expect(screen.getByText('Small Title')).toHaveClass('MuiTypography-h6')
      expect(screen.getByText('Small description')).toHaveClass('MuiTypography-body2')
    })

    it('should render medium size with correct typography', () => {
      render(
        <EmptyState
          title="Medium Title"
          description="Medium description"
          size="medium"
        />
      )
      
      expect(screen.getByText('Medium Title')).toHaveClass('MuiTypography-h5')
      expect(screen.getByText('Medium description')).toHaveClass('MuiTypography-body1')
    })

    it('should render large size with correct typography', () => {
      render(
        <EmptyState
          title="Large Title"
          description="Large description"
          size="large"
        />
      )
      
      expect(screen.getByText('Large Title')).toHaveClass('MuiTypography-h4')
      expect(screen.getByText('Large description')).toHaveClass('MuiTypography-body1')
    })

    it('should scale button size with component size', () => {
      const { rerender } = render(
        <EmptyState
          title="Test"
          size="small"
          primaryAction={{ label: 'Action', onClick: vi.fn() }}
        />
      )
      
      let button = screen.getByRole('button')
      expect(button).toHaveClass('MuiButton-sizeSmall')
      
      rerender(
        <EmptyState
          title="Test"
          size="large"
          primaryAction={{ label: 'Action', onClick: vi.fn() }}
        />
      )
      
      button = screen.getByRole('button')
      expect(button).toHaveClass('MuiButton-sizeLarge')
    })
  })

  describe('Content Combinations', () => {
    it('should render all content sections in correct order', () => {
      const { container } = render(
        <EmptyState
          title="Title"
          description="Description"
          primaryAction={{ label: 'Action', onClick: vi.fn() }}
          footer={<div>Footer</div>}
        >
          <div>Children</div>
        </EmptyState>
      )
      
      const content = container.textContent
      const titleIndex = content?.indexOf('Title') || 0
      const descIndex = content?.indexOf('Description') || 0
      const actionIndex = content?.indexOf('Action') || 0
      const childrenIndex = content?.indexOf('Children') || 0
      const footerIndex = content?.indexOf('Footer') || 0
      
      expect(titleIndex).toBeLessThan(descIndex)
      expect(descIndex).toBeLessThan(actionIndex)
      expect(actionIndex).toBeLessThan(childrenIndex)
      expect(childrenIndex).toBeLessThan(footerIndex)
    })

    it('should handle missing optional props gracefully', () => {
      render(<EmptyState />)
      
      // Should render with default content
      expect(screen.getByText('Empty')).toBeInTheDocument()
      expect(screen.getByText('No content to display.')).toBeInTheDocument()
    })

    it('should override default content with custom props', () => {
      render(
        <EmptyState
          variant="error"
          title="Custom Error"
          description="Custom error message"
        />
      )
      
      expect(screen.getByText('Custom Error')).toBeInTheDocument()
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })
  })
})