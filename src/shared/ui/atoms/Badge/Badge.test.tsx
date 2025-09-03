import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'
import MailIcon from '@mui/icons-material/Mail'

describe('Badge', () => {
  describe('Basic Rendering', () => {
    it('should render badge with content', () => {
      render(
        <Badge badgeContent={4}>
          <MailIcon />
        </Badge>
      )
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('should render child element', () => {
      render(
        <Badge badgeContent={1}>
          <div data-testid="child">Child Element</div>
        </Badge>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should render without badge content', () => {
      const { container } = render(
        <Badge>
          <MailIcon />
        </Badge>
      )
      const badge = container.querySelector('.MuiBadge-root')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Badge Variants', () => {
    it('should render standard variant', () => {
      const { container } = render(
        <Badge badgeContent={5} variant="standard">
          <MailIcon />
        </Badge>
      )
      const badge = container.querySelector('.MuiBadge-standard')
      expect(badge).toBeInTheDocument()
    })

    it('should render dot variant', () => {
      const { container } = render(
        <Badge variant="dot">
          <MailIcon />
        </Badge>
      )
      const badge = container.querySelector('.MuiBadge-dot')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Badge Colors', () => {
    it('should apply primary color', () => {
      const { container } = render(
        <Badge badgeContent={1} color="primary">
          <MailIcon />
        </Badge>
      )
      const badge = container.querySelector('.MuiBadge-colorPrimary')
      expect(badge).toBeInTheDocument()
    })

    it('should apply secondary color', () => {
      const { container } = render(
        <Badge badgeContent={2} color="secondary">
          <MailIcon />
        </Badge>
      )
      const badge = container.querySelector('.MuiBadge-colorSecondary')
      expect(badge).toBeInTheDocument()
    })

    it('should apply error color', () => {
      const { container } = render(
        <Badge badgeContent={3} color="error">
          <MailIcon />
        </Badge>
      )
      const badge = container.querySelector('.MuiBadge-colorError')
      expect(badge).toBeInTheDocument()
    })

    it('should apply success color', () => {
      const { container } = render(
        <Badge badgeContent={4} color="success">
          <MailIcon />
        </Badge>
      )
      const badge = container.querySelector('.MuiBadge-colorSuccess')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Number Badge Features', () => {
    it('should display number correctly', () => {
      render(
        <Badge badgeContent={42}>
          <MailIcon />
        </Badge>
      )
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should respect max value', () => {
      render(
        <Badge badgeContent={150} max={99}>
          <MailIcon />
        </Badge>
      )
      expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('should use custom max value', () => {
      render(
        <Badge badgeContent={1500} max={999}>
          <MailIcon />
        </Badge>
      )
      expect(screen.getByText('999+')).toBeInTheDocument()
    })

    it('should not show zero by default', () => {
      render(
        <Badge badgeContent={0}>
          <MailIcon />
        </Badge>
      )
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('should show zero when showZero is true', () => {
      render(
        <Badge badgeContent={0} showZero>
          <MailIcon />
        </Badge>
      )
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('Badge Visibility', () => {
    it('should be visible by default', () => {
      const { container } = render(
        <Badge badgeContent={1}>
          <MailIcon />
        </Badge>
      )
      const badge = container.querySelector('.MuiBadge-badge')
      expect(badge).not.toHaveClass('MuiBadge-invisible')
    })

    it('should be invisible when invisible prop is true', () => {
      const { container } = render(
        <Badge badgeContent={1} invisible>
          <MailIcon />
        </Badge>
      )
      const badge = container.querySelector('.MuiBadge-invisible')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Badge Positioning', () => {
    it('should position badge at top-right by default', () => {
      const { container } = render(
        <Badge badgeContent={1}>
          <MailIcon />
        </Badge>
      )
      const badge = container.querySelector('.MuiBadge-anchorOriginTopRight')
      expect(badge).toBeInTheDocument()
    })

    it('should position badge at top-left', () => {
      const { container } = render(
        <Badge 
          badgeContent={1}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
        >
          <MailIcon />
        </Badge>
      )
      const badge = container.querySelector('.MuiBadge-anchorOriginTopLeft')
      expect(badge).toBeInTheDocument()
    })

    it('should position badge at bottom-right', () => {
      const { container } = render(
        <Badge 
          badgeContent={1}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
        >
          <MailIcon />
        </Badge>
      )
      const badge = container.querySelector('.MuiBadge-anchorOriginBottomRight')
      expect(badge).toBeInTheDocument()
    })

    it('should position badge at bottom-left', () => {
      const { container } = render(
        <Badge 
          badgeContent={1}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
        >
          <MailIcon />
        </Badge>
      )
      const badge = container.querySelector('.MuiBadge-anchorOriginBottomLeft')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Badge Overlap', () => {
    it('should use rectangular overlap by default', () => {
      const { container } = render(
        <Badge badgeContent={1} overlap="rectangular">
          <div>Rectangle</div>
        </Badge>
      )
      const badge = container.querySelector('.MuiBadge-overlapRectangular')
      expect(badge).toBeInTheDocument()
    })

    it('should use circular overlap', () => {
      const { container } = render(
        <Badge badgeContent={1} overlap="circular">
          <div>Circle</div>
        </Badge>
      )
      const badge = container.querySelector('.MuiBadge-overlapCircular')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('String Content', () => {
    it('should display string content', () => {
      render(
        <Badge badgeContent="NEW">
          <MailIcon />
        </Badge>
      )
      expect(screen.getByText('NEW')).toBeInTheDocument()
    })

    it('should display emoji content', () => {
      render(
        <Badge badgeContent="🔥">
          <MailIcon />
        </Badge>
      )
      expect(screen.getByText('🔥')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle negative numbers', () => {
      render(
        <Badge badgeContent={-5}>
          <MailIcon />
        </Badge>
      )
      expect(screen.getByText('-5')).toBeInTheDocument()
    })

    it('should handle very large numbers with max', () => {
      render(
        <Badge badgeContent={9999999} max={9999}>
          <MailIcon />
        </Badge>
      )
      expect(screen.getByText('9999+')).toBeInTheDocument()
    })

    it('should render with multiple children', () => {
      render(
        <Badge badgeContent={3}>
          <div>
            <span data-testid="child1">Child 1</span>
            <span data-testid="child2">Child 2</span>
          </div>
        </Badge>
      )
      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
    })
  })
})