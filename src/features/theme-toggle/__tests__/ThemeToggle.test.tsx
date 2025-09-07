import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ThemeToggle } from '../ui/ThemeToggle'

// Mock useColorScheme hook
const mockSetMode = vi.fn()
const mockMode = vi.fn()

vi.mock('@mui/material/styles', () => ({
  useColorScheme: () => ({
    mode: mockMode(),
    setMode: mockSetMode,
  }),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the toggle button', () => {
    mockMode.mockReturnValue('light')
    render(<ThemeToggle />)
    const button = screen.getByLabelText('toggle theme')
    expect(button).toBeInTheDocument()
  })

  it('shows dark icon when in light mode', () => {
    mockMode.mockReturnValue('light')
    const { container } = render(<ThemeToggle />)
    const darkIcon = container.querySelector('[data-testid="Brightness4Icon"]')
    expect(darkIcon).toBeInTheDocument()
  })

  it('shows light icon when in dark mode', () => {
    mockMode.mockReturnValue('dark')
    const { container } = render(<ThemeToggle />)
    const lightIcon = container.querySelector('[data-testid="Brightness7Icon"]')
    expect(lightIcon).toBeInTheDocument()
  })

  it('toggles from light to dark mode', () => {
    mockMode.mockReturnValue('light')
    render(<ThemeToggle />)
    const button = screen.getByLabelText('toggle theme')
    
    fireEvent.click(button)
    
    expect(mockSetMode).toHaveBeenCalledWith('dark')
  })

  it('toggles from dark to light mode', () => {
    mockMode.mockReturnValue('dark')
    render(<ThemeToggle />)
    const button = screen.getByLabelText('toggle theme')
    
    fireEvent.click(button)
    
    expect(mockSetMode).toHaveBeenCalledWith('light')
  })

  it('renders disabled button when mode is undefined (SSR)', () => {
    mockMode.mockReturnValue(undefined)
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})