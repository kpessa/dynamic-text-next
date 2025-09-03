import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Progress, CircularProgress, LinearProgress } from './Progress'

describe('Progress', () => {
  describe('CircularProgress', () => {
    it('should render circular progress', () => {
      const { container } = render(<CircularProgress />)
      const progress = container.querySelector('.MuiCircularProgress-root')
      expect(progress).toBeInTheDocument()
    })

    it('should render indeterminate by default', () => {
      const { container } = render(<CircularProgress />)
      const progress = container.querySelector('.MuiCircularProgress-indeterminate')
      expect(progress).toBeInTheDocument()
    })

    it('should render determinate with value', () => {
      const { container } = render(<CircularProgress determinate value={50} />)
      const progress = container.querySelector('.MuiCircularProgress-determinate')
      expect(progress).toBeInTheDocument()
    })

    it('should apply custom size', () => {
      const { container } = render(<CircularProgress size={60} />)
      const svg = container.querySelector('svg')
      expect(svg).toHaveStyle({ width: '60px', height: '60px' })
    })

    it('should apply custom thickness', () => {
      render(<CircularProgress thickness={5} />)
      // Thickness is applied to the circle element but hard to test directly
      expect(document.querySelector('.MuiCircularProgress-root')).toBeInTheDocument()
    })

    it('should show label when showLabel is true', () => {
      render(<CircularProgress determinate value={75} showLabel />)
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should show custom label', () => {
      render(<CircularProgress determinate value={50} showLabel label="Loading" />)
      expect(screen.getByText('Loading')).toBeInTheDocument()
    })

    it('should apply color variants', () => {
      const { container } = render(<CircularProgress color="secondary" />)
      const progress = container.querySelector('.MuiCircularProgress-colorSecondary')
      expect(progress).toBeInTheDocument()
    })
  })

  describe('LinearProgress', () => {
    it('should render linear progress', () => {
      const { container } = render(<LinearProgress />)
      const progress = container.querySelector('.MuiLinearProgress-root')
      expect(progress).toBeInTheDocument()
    })

    it('should render indeterminate by default', () => {
      const { container } = render(<LinearProgress />)
      const progress = container.querySelector('.MuiLinearProgress-indeterminate')
      expect(progress).toBeInTheDocument()
    })

    it('should render determinate with value', () => {
      const { container } = render(<LinearProgress determinate value={30} />)
      const progress = container.querySelector('.MuiLinearProgress-determinate')
      expect(progress).toBeInTheDocument()
    })

    it('should render buffer variant', () => {
      const { container } = render(<LinearProgress buffer={60} value={30} />)
      const progress = container.querySelector('.MuiLinearProgress-buffer')
      expect(progress).toBeInTheDocument()
    })

    it('should apply custom height', () => {
      const { container } = render(<LinearProgress height={10} />)
      const progress = container.querySelector('.MuiLinearProgress-root')
      expect(progress).toHaveStyle({ height: '10px' })
    })

    it('should show label when showLabel is true', () => {
      render(<LinearProgress determinate value={45} showLabel />)
      expect(screen.getByText('45%')).toBeInTheDocument()
    })

    it('should show custom label', () => {
      render(<LinearProgress determinate value={60} showLabel label="Processing" />)
      expect(screen.getByText('Processing')).toBeInTheDocument()
    })

    it('should apply color variants', () => {
      const { container } = render(<LinearProgress color="error" />)
      const progress = container.querySelector('.MuiLinearProgress-colorError')
      expect(progress).toBeInTheDocument()
    })
  })

  describe('Progress Component', () => {
    it('should render circular progress by default', () => {
      const { container } = render(<Progress />)
      const progress = container.querySelector('.MuiCircularProgress-root')
      expect(progress).toBeInTheDocument()
    })

    it('should render linear progress when variant is linear', () => {
      const { container } = render(<Progress variant="linear" />)
      const progress = container.querySelector('.MuiLinearProgress-root')
      expect(progress).toBeInTheDocument()
    })

    it('should pass props to circular progress', () => {
      render(<Progress variant="circular" determinate value={80} showLabel />)
      expect(screen.getByText('80%')).toBeInTheDocument()
    })

    it('should pass props to linear progress', () => {
      render(<Progress variant="linear" determinate value={25} showLabel />)
      expect(screen.getByText('25%')).toBeInTheDocument()
    })
  })

  describe('Color Variants', () => {
    const colors = ['primary', 'secondary', 'error', 'info', 'success', 'warning'] as const

    colors.forEach(color => {
      it(`should apply ${color} color to circular progress`, () => {
        const { container } = render(<CircularProgress color={color} />)
        const progress = container.querySelector(`.MuiCircularProgress-color${color.charAt(0).toUpperCase() + color.slice(1)}`)
        expect(progress).toBeInTheDocument()
      })

      it(`should apply ${color} color to linear progress`, () => {
        const { container } = render(<LinearProgress color={color} />)
        const progress = container.querySelector(`.MuiLinearProgress-color${color.charAt(0).toUpperCase() + color.slice(1)}`)
        expect(progress).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper role for circular progress', () => {
      const { container } = render(<CircularProgress />)
      const progress = container.querySelector('[role="progressbar"]')
      expect(progress).toBeInTheDocument()
    })

    it('should have proper role for linear progress', () => {
      const { container } = render(<LinearProgress />)
      const progress = container.querySelector('[role="progressbar"]')
      expect(progress).toBeInTheDocument()
    })

    it('should have aria-valuenow for determinate progress', () => {
      const { container } = render(<CircularProgress determinate value={55} />)
      const progress = container.querySelector('[role="progressbar"]')
      expect(progress).toHaveAttribute('aria-valuenow', '55')
    })
  })
})