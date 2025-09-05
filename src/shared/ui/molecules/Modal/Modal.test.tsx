import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Modal, ConfirmationModal, FormModal } from './Modal'
import { Button } from '@mui/material'

describe('Modal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>,
  }

  it('should render correctly', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    const closeButton = screen.getByLabelText('close')
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalled()
  })

  it('should render without title', () => {
    render(<Modal {...defaultProps} title={undefined} />)
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('should render with actions', () => {
    render(
      <Modal
        {...defaultProps}
        actions={
          <>
            <Button>Cancel</Button>
            <Button>Confirm</Button>
          </>
        }
      />
    )
    
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(<Modal {...defaultProps} loading />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
  })

  it('should not close on backdrop click when closeOnBackdropClick is false', () => {
    const onClose = vi.fn()
    const { baseElement } = render(
      <Modal {...defaultProps} onClose={onClose} closeOnBackdropClick={false} />
    )
    
    const backdrop = baseElement.querySelector('.MuiBackdrop-root')
    if (backdrop) {
      fireEvent.click(backdrop)
    }
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should hide close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />)
    expect(screen.queryByLabelText('close')).not.toBeInTheDocument()
  })

  it('should render with dividers', () => {
    render(<Modal {...defaultProps} dividers />)
    // Just verify the modal renders correctly with dividers prop
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
    // The dividers visual effect is handled by MUI internally
  })

  it('should handle different sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    sizes.forEach(size => {
      const { rerender } = render(<Modal {...defaultProps} size={size} />)
      expect(screen.getByText('Modal Content')).toBeInTheDocument()
      rerender(<div />)
    })
  })
})

describe('ConfirmationModal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    message: 'Are you sure?',
    onConfirm: vi.fn(),
  }

  it('should render confirmation modal correctly', () => {
    render(<ConfirmationModal {...defaultProps} />)
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('should call onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    render(
      <ConfirmationModal
        {...defaultProps}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )
    
    fireEvent.click(screen.getByText('Confirm'))
    
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('should call onClose when cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<ConfirmationModal {...defaultProps} onClose={onClose} />)
    
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should render with custom text', () => {
    render(
      <ConfirmationModal
        {...defaultProps}
        title="Delete Item"
        confirmText="Delete"
        cancelText="Keep"
      />
    )
    
    expect(screen.getByText('Delete Item')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Keep')).toBeInTheDocument()
  })

  it('should render with custom icon', () => {
    render(
      <ConfirmationModal
        {...defaultProps}
        icon={<div data-testid="custom-icon">Custom Icon</div>}
      />
    )
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('should handle async onConfirm', async () => {
    const onConfirm = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    const onClose = vi.fn()
    
    render(
      <ConfirmationModal
        {...defaultProps}
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )
    
    fireEvent.click(screen.getByText('Confirm'))
    
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    }, { timeout: 200 })
  })
})

describe('FormModal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    title: 'Form Modal',
    children: <form><input name="test" /></form>,
  }

  it('should render form modal correctly', () => {
    render(<FormModal {...defaultProps} />)
    expect(screen.getByText('Form Modal')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  it('should call onSubmit when submit button is clicked', async () => {
    const onSubmit = vi.fn()
    const onClose = vi.fn()
    
    render(
      <FormModal
        {...defaultProps}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    )
    
    fireEvent.click(screen.getByText('Submit'))
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('should disable submit button when submitDisabled is true', () => {
    render(<FormModal {...defaultProps} submitDisabled />)
    
    const submitButton = screen.getByText('Submit')
    expect(submitButton).toBeDisabled()
  })

  it('should render with custom button text', () => {
    render(
      <FormModal
        {...defaultProps}
        submitText="Save"
        cancelText="Discard"
      />
    )
    
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Discard')).toBeInTheDocument()
  })

  it('should handle async onSubmit', async () => {
    const onSubmit = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    const onClose = vi.fn()
    
    render(
      <FormModal
        {...defaultProps}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    )
    
    fireEvent.click(screen.getByText('Submit'))
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    }, { timeout: 200 })
  })
})