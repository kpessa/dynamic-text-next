import React from 'react'
import { render, screen, renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LoadingOverlay } from './LoadingOverlay'
import { LoadingProvider, useLoading } from './LoadingContext'

describe('LoadingOverlay', () => {
  it('renders when open is true', () => {
    render(<LoadingOverlay open={true} />)
    const progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(<LoadingOverlay open={false} />)
    const progressBar = screen.queryByRole('progressbar')
    expect(progressBar).not.toBeInTheDocument()
  })

  it('displays message when provided', () => {
    render(<LoadingOverlay open={true} message="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('renders circular progress by default', () => {
    const { container } = render(<LoadingOverlay open={true} />)
    const circularProgress = container.querySelector('.MuiCircularProgress-root')
    expect(circularProgress).toBeInTheDocument()
  })

  it('renders linear progress when variant is linear', () => {
    const { container } = render(<LoadingOverlay open={true} variant="linear" />)
    const linearProgress = container.querySelector('.MuiLinearProgress-root')
    expect(linearProgress).toBeInTheDocument()
  })

  it('applies custom size to circular progress', () => {
    const { container } = render(<LoadingOverlay open={true} size={60} />)
    const circularProgress = container.querySelector('.MuiCircularProgress-root')
    expect(circularProgress).toHaveStyle({ width: '60px', height: '60px' })
  })
})

describe('LoadingContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LoadingProvider>{children}</LoadingProvider>
  )

  it('provides loading functions', () => {
    const { result } = renderHook(() => useLoading(), { wrapper })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.showLoading).toBeDefined()
    expect(result.current.hideLoading).toBeDefined()
  })

  it('shows and hides loading', () => {
    const { result } = renderHook(() => useLoading(), { wrapper })
    
    expect(result.current.isLoading).toBe(false)
    
    act(() => {
      result.current.showLoading('Processing...')
    })
    
    expect(result.current.isLoading).toBe(true)
    
    act(() => {
      result.current.hideLoading()
    })
    
    expect(result.current.isLoading).toBe(false)
  })

  it('renders loading overlay when loading is shown', () => {
    const TestComponent = () => {
      const { showLoading, hideLoading } = useLoading()
      return (
        <div>
          <button onClick={() => showLoading('Test message')}>Show</button>
          <button onClick={hideLoading}>Hide</button>
        </div>
      )
    }

    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    )

    const showButton = screen.getByText('Show')
    
    act(() => {
      showButton.click()
    })

    expect(screen.getByText('Test message')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument()
  })

  it('throws error when useLoading is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error
    console.error = () => {}

    expect(() => {
      renderHook(() => useLoading())
    }).toThrow('useLoading must be used within LoadingProvider')

    console.error = originalError
  })
})