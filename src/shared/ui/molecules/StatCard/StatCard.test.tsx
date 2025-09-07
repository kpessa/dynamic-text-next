import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StatCard } from './StatCard'
import { Calculate as CalculateIcon } from '@mui/icons-material'

describe('StatCard', () => {
  const defaultProps = {
    title: 'Total Calculations',
    value: 156,
    icon: <CalculateIcon data-testid="calc-icon" />,
  }

  it('renders title and value', () => {
    render(<StatCard {...defaultProps} />)
    
    expect(screen.getByText('Total Calculations')).toBeInTheDocument()
    expect(screen.getByText('156')).toBeInTheDocument()
  })

  it('renders icon', () => {
    render(<StatCard {...defaultProps} />)
    
    expect(screen.getByTestId('calc-icon')).toBeInTheDocument()
  })

  it('formats large numbers with commas', () => {
    render(<StatCard {...defaultProps} value={1234567} />)
    
    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })

  it('renders string values as-is', () => {
    render(<StatCard {...defaultProps} value="42%" />)
    
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('renders trend when provided', () => {
    render(
      <StatCard
        {...defaultProps}
        trend={{ value: '+12% this week', direction: 'up' }}
      />
    )
    
    expect(screen.getByText('+12% this week')).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    const { container } = render(<StatCard {...defaultProps} loading />)
    
    const skeletons = container.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('handles click event when onClick provided', () => {
    const handleClick = vi.fn()
    render(<StatCard {...defaultProps} onClick={handleClick} />)
    
    // Click on the CardActionArea when onClick is provided
    const cardActionArea = screen.getByText('Total Calculations').closest('.MuiCardActionArea-root')
    fireEvent.click(cardActionArea!)
    
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('renders with different trend directions', () => {
    const { rerender, container } = render(
      <StatCard
        {...defaultProps}
        trend={{ value: 'Up trend', direction: 'up' }}
      />
    )
    
    expect(container.querySelector('[data-testid="TrendingUpIcon"]')).toBeInTheDocument()
    
    rerender(
      <StatCard
        {...defaultProps}
        trend={{ value: 'Down trend', direction: 'down' }}
      />
    )
    
    expect(container.querySelector('[data-testid="TrendingDownIcon"]')).toBeInTheDocument()
    
    rerender(
      <StatCard
        {...defaultProps}
        trend={{ value: 'Flat trend', direction: 'neutral' }}
      />
    )
    
    expect(container.querySelector('[data-testid="TrendingFlatIcon"]')).toBeInTheDocument()
  })
})