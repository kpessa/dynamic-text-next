import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Chip } from './Chip'
import Avatar from '@mui/material/Avatar'
import FaceIcon from '@mui/icons-material/Face'
import DoneIcon from '@mui/icons-material/Done'

describe('Chip', () => {
  describe('Basic Rendering', () => {
    it('should render chip with label', () => {
      render(<Chip label="Basic Chip" />)
      expect(screen.getByText('Basic Chip')).toBeInTheDocument()
    })

    it('should render with default variant and color', () => {
      const { container } = render(<Chip label="Default" />)
      const chip = container.querySelector('.MuiChip-filled')
      expect(chip).toBeInTheDocument()
    })
  })

  describe('Chip Variants', () => {
    it('should render filled variant', () => {
      const { container } = render(<Chip label="Filled" variant="filled" />)
      const chip = container.querySelector('.MuiChip-filled')
      expect(chip).toBeInTheDocument()
    })

    it('should render outlined variant', () => {
      const { container } = render(<Chip label="Outlined" variant="outlined" />)
      const chip = container.querySelector('.MuiChip-outlined')
      expect(chip).toBeInTheDocument()
    })
  })

  describe('Chip Colors', () => {
    it('should apply primary color', () => {
      const { container } = render(<Chip label="Primary" color="primary" />)
      const chip = container.querySelector('.MuiChip-colorPrimary')
      expect(chip).toBeInTheDocument()
    })

    it('should apply secondary color', () => {
      const { container } = render(<Chip label="Secondary" color="secondary" />)
      const chip = container.querySelector('.MuiChip-colorSecondary')
      expect(chip).toBeInTheDocument()
    })

    it('should apply error color', () => {
      const { container } = render(<Chip label="Error" color="error" />)
      const chip = container.querySelector('.MuiChip-colorError')
      expect(chip).toBeInTheDocument()
    })

    it('should apply success color', () => {
      const { container } = render(<Chip label="Success" color="success" />)
      const chip = container.querySelector('.MuiChip-colorSuccess')
      expect(chip).toBeInTheDocument()
    })

    it('should apply warning color', () => {
      const { container } = render(<Chip label="Warning" color="warning" />)
      const chip = container.querySelector('.MuiChip-colorWarning')
      expect(chip).toBeInTheDocument()
    })

    it('should apply info color', () => {
      const { container } = render(<Chip label="Info" color="info" />)
      const chip = container.querySelector('.MuiChip-colorInfo')
      expect(chip).toBeInTheDocument()
    })
  })

  describe('Chip Sizes', () => {
    it('should render small size', () => {
      const { container } = render(<Chip label="Small" size="small" />)
      const chip = container.querySelector('.MuiChip-sizeSmall')
      expect(chip).toBeInTheDocument()
    })

    it('should render medium size', () => {
      const { container } = render(<Chip label="Medium" size="medium" />)
      const chip = container.querySelector('.MuiChip-sizeMedium')
      expect(chip).toBeInTheDocument()
    })
  })

  describe('Clickable Chips', () => {
    it('should be clickable when clickable prop is true', () => {
      const { container } = render(<Chip label="Clickable" clickable />)
      const chip = container.querySelector('.MuiChip-clickable')
      expect(chip).toBeInTheDocument()
    })

    it('should handle click event', () => {
      const handleClick = vi.fn()
      render(<Chip label="Click Me" clickable onClick={handleClick} />)
      
      const chip = screen.getByText('Click Me').closest('.MuiChip-root')
      fireEvent.click(chip!)
      
      expect(handleClick).toHaveBeenCalled()
    })

    it('should be clickable when onClick is provided', () => {
      const handleClick = vi.fn()
      const { container } = render(<Chip label="Click" onClick={handleClick} />)
      
      const chip = container.querySelector('.MuiChip-clickable')
      expect(chip).toBeInTheDocument()
    })

    it('should not be clickable by default', () => {
      const { container } = render(<Chip label="Non-clickable" />)
      const chip = container.querySelector('.MuiChip-clickable')
      expect(chip).not.toBeInTheDocument()
    })
  })

  describe('Deletable Chips', () => {
    it('should show delete icon when deletable', () => {
      render(<Chip label="Deletable" deletable onDelete={() => {}} />)
      const deleteButton = screen.getByTestId('CancelIcon')
      expect(deleteButton).toBeInTheDocument()
    })

    it('should handle delete event', () => {
      const handleDelete = vi.fn()
      render(<Chip label="Delete Me" onDelete={handleDelete} />)
      
      const deleteButton = screen.getByTestId('CancelIcon')
      fireEvent.click(deleteButton)
      
      expect(handleDelete).toHaveBeenCalled()
    })

    it('should use custom delete icon', () => {
      render(
        <Chip 
          label="Custom Delete" 
          onDelete={() => {}}
          deleteIcon={<DoneIcon data-testid="custom-delete" />}
        />
      )
      expect(screen.getByTestId('custom-delete')).toBeInTheDocument()
    })

    it('should not show delete icon when not deletable', () => {
      render(<Chip label="Not Deletable" />)
      expect(screen.queryByTestId('CancelIcon')).not.toBeInTheDocument()
    })
  })

  describe('Chips with Avatar', () => {
    it('should render with avatar', () => {
      render(
        <Chip 
          label="Avatar Chip"
          avatar={<Avatar>A</Avatar>}
        />
      )
      expect(screen.getByText('A')).toBeInTheDocument()
    })

    it('should render with avatar image', () => {
      render(
        <Chip 
          label="Avatar Image"
          avatar={<Avatar src="/test.jpg" alt="Test" />}
        />
      )
      const avatar = screen.getByRole('img', { name: 'Test' })
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('Chips with Icons', () => {
    it('should render with icon', () => {
      render(
        <Chip 
          label="Icon Chip"
          icon={<FaceIcon data-testid="face-icon" />}
        />
      )
      expect(screen.getByTestId('face-icon')).toBeInTheDocument()
    })

    it('should not show icon when avatar is present', () => {
      render(
        <Chip 
          label="Both"
          avatar={<Avatar>A</Avatar>}
          icon={<FaceIcon data-testid="face-icon" />}
        />
      )
      expect(screen.queryByTestId('face-icon')).not.toBeInTheDocument()
      expect(screen.getByText('A')).toBeInTheDocument()
    })
  })

  describe('Combined Features', () => {
    it('should be both clickable and deletable', () => {
      const handleClick = vi.fn()
      const handleDelete = vi.fn()
      
      render(
        <Chip 
          label="Both"
          clickable
          onClick={handleClick}
          onDelete={handleDelete}
        />
      )
      
      const chip = screen.getByText('Both').closest('.MuiChip-root')
      fireEvent.click(chip!)
      expect(handleClick).toHaveBeenCalled()
      
      const deleteButton = screen.getByTestId('CancelIcon')
      fireEvent.click(deleteButton)
      expect(handleDelete).toHaveBeenCalled()
    })

    it('should work with all props combined', () => {
      const { container } = render(
        <Chip 
          label="Full Featured"
          variant="outlined"
          color="primary"
          size="small"
          avatar={<Avatar>F</Avatar>}
          clickable
          onDelete={() => {}}
        />
      )
      
      const chip = container.querySelector('.MuiChip-root')
      expect(chip).toHaveClass('MuiChip-outlined')
      expect(chip).toHaveClass('MuiChip-colorPrimary')
      expect(chip).toHaveClass('MuiChip-sizeSmall')
      expect(chip).toHaveClass('MuiChip-clickable')
      expect(chip).toHaveClass('MuiChip-deletable')
    })
  })

  describe('Disabled State', () => {
    it('should handle disabled state', () => {
      const { container } = render(<Chip label="Disabled" disabled />)
      const chip = container.querySelector('.MuiChip-root')
      expect(chip).toHaveClass('Mui-disabled')
    })

    it('should not trigger click when disabled', () => {
      const handleClick = vi.fn()
      render(
        <Chip 
          label="Disabled Click"
          clickable
          disabled
          onClick={handleClick}
        />
      )
      
      const chip = screen.getByText('Disabled Click').closest('.MuiChip-root')
      fireEvent.click(chip!)
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })
})