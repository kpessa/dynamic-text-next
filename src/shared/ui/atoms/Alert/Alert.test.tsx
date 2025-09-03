import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Alert } from './Alert'

describe('Alert', () => {
  describe('Basic Rendering', () => {
    it('should render alert with message', () => {
      render(<Alert>This is an alert message</Alert>)
      expect(screen.getByText('This is an alert message')).toBeInTheDocument()
    })

    it('should render alert with title', () => {
      render(<Alert title="Alert Title">Alert message</Alert>)
      expect(screen.getByText('Alert Title')).toBeInTheDocument()
      expect(screen.getByText('Alert message')).toBeInTheDocument()
    })

    it('should render with default info severity', () => {
      const { container } = render(<Alert>Info alert</Alert>)
      const alert = container.querySelector('.MuiAlert-standardInfo')
      expect(alert).toBeInTheDocument()
    })
  })

  describe('Severity Variants', () => {
    it('should render success alert', () => {
      const { container } = render(<Alert severity="success">Success!</Alert>)
      const alert = container.querySelector('.MuiAlert-standardSuccess')
      expect(alert).toBeInTheDocument()
    })

    it('should render warning alert', () => {
      const { container } = render(<Alert severity="warning">Warning!</Alert>)
      const alert = container.querySelector('.MuiAlert-standardWarning')
      expect(alert).toBeInTheDocument()
    })

    it('should render error alert', () => {
      const { container } = render(<Alert severity="error">Error!</Alert>)
      const alert = container.querySelector('.MuiAlert-standardError')
      expect(alert).toBeInTheDocument()
    })

    it('should render info alert', () => {
      const { container } = render(<Alert severity="info">Info!</Alert>)
      const alert = container.querySelector('.MuiAlert-standardInfo')
      expect(alert).toBeInTheDocument()
    })
  })

  describe('Visual Variants', () => {
    it('should render standard variant', () => {
      const { container } = render(<Alert variant="standard">Standard</Alert>)
      const alert = container.querySelector('.MuiAlert-standard')
      expect(alert).toBeInTheDocument()
    })

    it('should render filled variant', () => {
      const { container } = render(<Alert variant="filled">Filled</Alert>)
      const alert = container.querySelector('.MuiAlert-filled')
      expect(alert).toBeInTheDocument()
    })

    it('should render outlined variant', () => {
      const { container } = render(<Alert variant="outlined">Outlined</Alert>)
      const alert = container.querySelector('.MuiAlert-outlined')
      expect(alert).toBeInTheDocument()
    })
  })

  describe('Dismissible Alert', () => {
    it('should show close button when dismissible', () => {
      render(<Alert dismissible>Dismissible alert</Alert>)
      const closeButton = screen.getByLabelText('close')
      expect(closeButton).toBeInTheDocument()
    })

    it('should hide alert when close button clicked', async () => {
      render(<Alert dismissible>Dismissible alert</Alert>)
      const closeButton = screen.getByLabelText('close')
      
      fireEvent.click(closeButton)
      
      await waitFor(() => {
        const alert = screen.queryByText('Dismissible alert')
        expect(alert).not.toBeVisible()
      })
    })

    it('should call onDismiss when closed', () => {
      const handleDismiss = vi.fn()
      render(<Alert dismissible onDismiss={handleDismiss}>Alert</Alert>)
      
      const closeButton = screen.getByLabelText('close')
      fireEvent.click(closeButton)
      
      expect(handleDismiss).toHaveBeenCalled()
    })

    it('should not show close button when not dismissible', () => {
      render(<Alert>Non-dismissible alert</Alert>)
      const closeButton = screen.queryByLabelText('close')
      expect(closeButton).not.toBeInTheDocument()
    })
  })

  describe('Action Button', () => {
    it('should render action button', () => {
      render(
        <Alert actionButton={{ label: 'UNDO', onClick: () => {} }}>
          Alert with action
        </Alert>
      )
      expect(screen.getByText('UNDO')).toBeInTheDocument()
    })

    it('should call onClick when action button clicked', () => {
      const handleClick = vi.fn()
      render(
        <Alert actionButton={{ label: 'RETRY', onClick: handleClick }}>
          Alert
        </Alert>
      )
      
      const button = screen.getByText('RETRY')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalled()
    })

    it('should render both action button and close button', () => {
      render(
        <Alert 
          dismissible
          actionButton={{ label: 'ACTION', onClick: () => {} }}
        >
          Alert
        </Alert>
      )
      
      expect(screen.getByText('ACTION')).toBeInTheDocument()
      expect(screen.getByLabelText('close')).toBeInTheDocument()
    })
  })

  describe('Auto Hide', () => {
    it.skip('should auto-hide after specified duration', async () => {
      render(<Alert autoHideDuration={100}>Auto-hide alert</Alert>)
      
      expect(screen.getByText('Auto-hide alert')).toBeInTheDocument()
      
      await waitFor(() => {
        const alert = screen.queryByText('Auto-hide alert')
        expect(alert).not.toBeInTheDocument()
      }, { timeout: 300 })
    })

    it('should call onDismiss when auto-hidden', async () => {
      const handleDismiss = vi.fn()
      render(
        <Alert autoHideDuration={100} onDismiss={handleDismiss}>
          Auto-hide
        </Alert>
      )
      
      await waitFor(() => {
        expect(handleDismiss).toHaveBeenCalled()
      }, { timeout: 200 })
    })
  })

  describe('Icons', () => {
    it('should display default icon based on severity', () => {
      const { container } = render(<Alert severity="success">Success</Alert>)
      const icon = container.querySelector('.MuiAlert-icon')
      expect(icon).toBeInTheDocument()
    })

    it('should hide icon when icon prop is false', () => {
      const { container } = render(<Alert icon={false}>No icon</Alert>)
      const icon = container.querySelector('.MuiAlert-icon')
      expect(icon).not.toBeInTheDocument()
    })

    it('should use custom icon when provided', () => {
      render(<Alert icon={<span>🚀</span>}>Custom icon</Alert>)
      expect(screen.getByText('🚀')).toBeInTheDocument()
    })
  })

  describe('Complex Content', () => {
    it('should render with title and message', () => {
      render(
        <Alert title="Error" severity="error">
          Something went wrong. Please try again.
        </Alert>
      )
      
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
    })

    it('should render HTML content', () => {
      render(
        <Alert>
          <strong>Bold text</strong> and <em>italic text</em>
        </Alert>
      )
      
      expect(screen.getByText('Bold text')).toBeInTheDocument()
      expect(screen.getByText('italic text')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have appropriate role', () => {
      const { container } = render(<Alert>Accessible alert</Alert>)
      const alert = container.querySelector('[role="alert"]')
      expect(alert).toBeInTheDocument()
    })

    it('should be keyboard accessible for dismiss button', () => {
      render(<Alert dismissible>Keyboard accessible</Alert>)
      const closeButton = screen.getByLabelText('close')
      
      closeButton.focus()
      expect(document.activeElement).toBe(closeButton)
    })
  })
})