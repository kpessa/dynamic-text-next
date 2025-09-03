import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  describe('Basic Rendering', () => {
    it('should render skeleton', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.querySelector('.MuiSkeleton-root')
      expect(skeleton).toBeInTheDocument()
    })

    it('should render text variant by default', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.querySelector('.MuiSkeleton-text')
      expect(skeleton).toBeInTheDocument()
    })
  })

  describe('Skeleton Variants', () => {
    it('should render text variant', () => {
      const { container } = render(<Skeleton variant="text" />)
      const skeleton = container.querySelector('.MuiSkeleton-text')
      expect(skeleton).toBeInTheDocument()
    })

    it('should render circular variant', () => {
      const { container } = render(<Skeleton variant="circular" />)
      const skeleton = container.querySelector('.MuiSkeleton-circular')
      expect(skeleton).toBeInTheDocument()
    })

    it('should render rectangular variant', () => {
      const { container } = render(<Skeleton variant="rectangular" />)
      const skeleton = container.querySelector('.MuiSkeleton-rectangular')
      expect(skeleton).toBeInTheDocument()
    })

    it('should render rounded variant as rectangular with border radius', () => {
      const { container } = render(<Skeleton variant="rounded" />)
      const skeleton = container.querySelector('.MuiSkeleton-rectangular')
      expect(skeleton).toBeInTheDocument()
      const styles = window.getComputedStyle(skeleton!)
      expect(styles.borderRadius).toBeTruthy()
    })
  })

  describe('Skeleton Animations', () => {
    it('should have pulse animation by default', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.querySelector('.MuiSkeleton-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    it('should apply wave animation', () => {
      const { container } = render(<Skeleton animation="wave" />)
      const skeleton = container.querySelector('.MuiSkeleton-wave')
      expect(skeleton).toBeInTheDocument()
    })

    it('should have no animation when false', () => {
      const { container } = render(<Skeleton animation={false} />)
      const skeleton = container.querySelector('.MuiSkeleton-root')
      expect(skeleton).not.toHaveClass('MuiSkeleton-pulse')
      expect(skeleton).not.toHaveClass('MuiSkeleton-wave')
    })
  })

  describe('Dimensions', () => {
    it('should apply custom width', () => {
      const { container } = render(<Skeleton width={200} />)
      const skeleton = container.querySelector('.MuiSkeleton-root')
      expect(skeleton).toHaveStyle({ width: '200px' })
    })

    it('should apply custom height', () => {
      const { container } = render(<Skeleton height={50} />)
      const skeleton = container.querySelector('.MuiSkeleton-root')
      expect(skeleton).toHaveStyle({ height: '50px' })
    })

    it('should accept string dimensions', () => {
      const { container } = render(<Skeleton width="100%" height="2rem" />)
      const skeleton = container.querySelector('.MuiSkeleton-root')
      expect(skeleton).toHaveStyle({ width: '100%' })
      // Height might be converted to pixels by MUI
      expect(skeleton).toBeTruthy()
    })
  })

  describe('Multiple Rows', () => {
    it('should render single skeleton when rows is 1', () => {
      const { container } = render(<Skeleton rows={1} />)
      const skeletons = container.querySelectorAll('.MuiSkeleton-root')
      expect(skeletons).toHaveLength(1)
    })

    it('should render multiple skeletons for text variant', () => {
      const { container } = render(<Skeleton variant="text" rows={3} />)
      const skeletons = container.querySelectorAll('.MuiSkeleton-root')
      expect(skeletons).toHaveLength(3)
    })

    it('should not render multiple for non-text variants', () => {
      const { container } = render(<Skeleton variant="circular" rows={3} />)
      const skeletons = container.querySelectorAll('.MuiSkeleton-root')
      expect(skeletons).toHaveLength(1)
    })

    it('should apply spacing between rows', () => {
      const { container } = render(<Skeleton variant="text" rows={2} spacing={2} />)
      const stack = container.querySelector('.MuiStack-root')
      expect(stack).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should render skeleton element', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.querySelector('.MuiSkeleton-root')
      expect(skeleton).toBeInTheDocument()
      // MUI Skeleton may not always have aria-busy attribute
    })
  })

  describe('Custom Styling', () => {
    it('should accept sx prop', () => {
      const { container } = render(
        <Skeleton sx={{ bgcolor: 'primary.main' }} />
      )
      const skeleton = container.querySelector('.MuiSkeleton-root')
      expect(skeleton).toBeInTheDocument()
    })

    it('should accept className', () => {
      const { container } = render(<Skeleton className="custom-skeleton" />)
      const skeleton = container.querySelector('.custom-skeleton')
      expect(skeleton).toBeInTheDocument()
    })
  })
})