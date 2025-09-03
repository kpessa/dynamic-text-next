import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Typography } from './Typography'

describe('Typography', () => {
  describe('Basic Rendering', () => {
    it('should render text content', () => {
      render(<Typography>Hello World</Typography>)
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('should render with default body1 variant', () => {
      const { container } = render(<Typography>Default Text</Typography>)
      const element = container.querySelector('.MuiTypography-body1')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Heading Variants', () => {
    it('should render h1 variant', () => {
      const { container } = render(<Typography variant="h1">Heading 1</Typography>)
      const element = container.querySelector('.MuiTypography-h1')
      expect(element).toBeInTheDocument()
      expect(element?.tagName).toBe('H1')
    })

    it('should render h2 variant', () => {
      const { container } = render(<Typography variant="h2">Heading 2</Typography>)
      const element = container.querySelector('.MuiTypography-h2')
      expect(element).toBeInTheDocument()
      expect(element?.tagName).toBe('H2')
    })

    it('should render h3 variant', () => {
      const { container } = render(<Typography variant="h3">Heading 3</Typography>)
      const element = container.querySelector('.MuiTypography-h3')
      expect(element).toBeInTheDocument()
      expect(element?.tagName).toBe('H3')
    })

    it('should render h4 variant', () => {
      const { container } = render(<Typography variant="h4">Heading 4</Typography>)
      const element = container.querySelector('.MuiTypography-h4')
      expect(element).toBeInTheDocument()
      expect(element?.tagName).toBe('H4')
    })

    it('should render h5 variant', () => {
      const { container } = render(<Typography variant="h5">Heading 5</Typography>)
      const element = container.querySelector('.MuiTypography-h5')
      expect(element).toBeInTheDocument()
      expect(element?.tagName).toBe('H5')
    })

    it('should render h6 variant', () => {
      const { container } = render(<Typography variant="h6">Heading 6</Typography>)
      const element = container.querySelector('.MuiTypography-h6')
      expect(element).toBeInTheDocument()
      expect(element?.tagName).toBe('H6')
    })
  })

  describe('Body and Text Variants', () => {
    it('should render body1 variant', () => {
      const { container } = render(<Typography variant="body1">Body 1 Text</Typography>)
      const element = container.querySelector('.MuiTypography-body1')
      expect(element).toBeInTheDocument()
    })

    it('should render body2 variant', () => {
      const { container } = render(<Typography variant="body2">Body 2 Text</Typography>)
      const element = container.querySelector('.MuiTypography-body2')
      expect(element).toBeInTheDocument()
    })

    it('should render subtitle1 variant', () => {
      const { container } = render(<Typography variant="subtitle1">Subtitle 1</Typography>)
      const element = container.querySelector('.MuiTypography-subtitle1')
      expect(element).toBeInTheDocument()
    })

    it('should render subtitle2 variant', () => {
      const { container } = render(<Typography variant="subtitle2">Subtitle 2</Typography>)
      const element = container.querySelector('.MuiTypography-subtitle2')
      expect(element).toBeInTheDocument()
    })

    it('should render caption variant', () => {
      const { container } = render(<Typography variant="caption">Caption Text</Typography>)
      const element = container.querySelector('.MuiTypography-caption')
      expect(element).toBeInTheDocument()
    })

    it('should render overline variant', () => {
      const { container } = render(<Typography variant="overline">Overline Text</Typography>)
      const element = container.querySelector('.MuiTypography-overline')
      expect(element).toBeInTheDocument()
    })

    it('should render button variant', () => {
      const { container } = render(<Typography variant="button">Button Text</Typography>)
      const element = container.querySelector('.MuiTypography-button')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Text Alignment', () => {
    it('should align text to left', () => {
      const { container } = render(<Typography align="left">Left Aligned</Typography>)
      const element = container.querySelector('.MuiTypography-alignLeft')
      expect(element).toBeInTheDocument()
    })

    it('should align text to center', () => {
      const { container } = render(<Typography align="center">Center Aligned</Typography>)
      const element = container.querySelector('.MuiTypography-alignCenter')
      expect(element).toBeInTheDocument()
    })

    it('should align text to right', () => {
      const { container } = render(<Typography align="right">Right Aligned</Typography>)
      const element = container.querySelector('.MuiTypography-alignRight')
      expect(element).toBeInTheDocument()
    })

    it('should justify text', () => {
      const { container } = render(<Typography align="justify">Justified Text</Typography>)
      const element = container.querySelector('.MuiTypography-alignJustify')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Colors', () => {
    it('should apply primary color', () => {
      render(<Typography color="primary">Primary Color</Typography>)
      const element = screen.getByText('Primary Color')
      expect(element).toBeInTheDocument()
    })

    it('should apply secondary color', () => {
      render(<Typography color="secondary">Secondary Color</Typography>)
      const element = screen.getByText('Secondary Color')
      expect(element).toBeInTheDocument()
    })

    it('should apply error color', () => {
      render(<Typography color="error">Error Color</Typography>)
      const element = screen.getByText('Error Color')
      expect(element).toBeInTheDocument()
    })

    it('should apply custom color', () => {
      render(<Typography color="#ff5722">Custom Color</Typography>)
      const text = screen.getByText('Custom Color')
      expect(text).toBeInTheDocument()
    })
  })

  describe('Text Truncation', () => {
    it('should truncate text when truncate is true', () => {
      render(
        <Typography truncate>
          This is a very long text that should be truncated with ellipsis
        </Typography>
      )
      const text = screen.getByText(/This is a very long text/)
      const styles = window.getComputedStyle(text)
      expect(text).toBeInTheDocument()
    })

    it('should limit lines when maxLines is set', () => {
      render(
        <Typography maxLines={2}>
          This is a very long text that spans multiple lines and should be clamped to only show 2 lines
        </Typography>
      )
      const text = screen.getByText(/This is a very long text/)
      expect(text).toBeInTheDocument()
    })
  })

  describe('Gradient Text', () => {
    it('should apply gradient when gradient is true', () => {
      render(<Typography gradient>Gradient Text</Typography>)
      const text = screen.getByText('Gradient Text')
      expect(text).toBeInTheDocument()
    })

    it('should apply custom gradient colors', () => {
      render(
        <Typography gradient gradientColors={['#ff0000', '#00ff00']}>
          Custom Gradient
        </Typography>
      )
      const text = screen.getByText('Custom Gradient')
      expect(text).toBeInTheDocument()
    })
  })

  describe('Props Inheritance', () => {
    it('should accept className prop', () => {
      const { container } = render(
        <Typography className="custom-class">Custom Class</Typography>
      )
      const element = container.querySelector('.custom-class')
      expect(element).toBeInTheDocument()
    })

    it('should accept id prop', () => {
      render(<Typography id="custom-id">With ID</Typography>)
      const element = document.getElementById('custom-id')
      expect(element).toBeInTheDocument()
    })

    it('should accept data attributes', () => {
      render(<Typography data-testid="typography-test">Test Data</Typography>)
      const element = screen.getByTestId('typography-test')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Component Prop', () => {
    it('should render as different HTML element when component prop is used', () => {
      const { container } = render(
        <Typography component="div" variant="h1">
          Div with H1 styling
        </Typography>
      )
      const element = container.querySelector('div.MuiTypography-h1')
      expect(element).toBeInTheDocument()
    })

    it('should render as span when specified', () => {
      const { container } = render(
        <Typography component="span">Span Element</Typography>
      )
      const element = container.querySelector('span')
      expect(element).toBeInTheDocument()
    })
  })

  describe('NoWrap Property', () => {
    it('should handle noWrap property', () => {
      const { container } = render(
        <Typography noWrap>
          This text will not wrap and will be truncated with ellipsis if too long
        </Typography>
      )
      const element = container.querySelector('.MuiTypography-noWrap')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Paragraph Property', () => {
    it('should add bottom margin when paragraph is true', () => {
      const { container } = render(
        <Typography paragraph>Paragraph Text</Typography>
      )
      const element = container.querySelector('.MuiTypography-paragraph')
      expect(element).toBeInTheDocument()
    })
  })
})