import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { UserMenu } from './UserMenu'

describe('UserMenu', () => {
  it('renders user avatar button', () => {
    render(<UserMenu />)
    const button = screen.getByLabelText('user menu')
    expect(button).toBeInTheDocument()
  })

  it('displays user initials when no avatar provided', () => {
    render(<UserMenu userName="John Doe" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('displays user avatar when provided', () => {
    const avatarUrl = 'https://example.com/avatar.jpg'
    render(<UserMenu userName="John Doe" userAvatar={avatarUrl} />)
    const avatar = screen.getByAltText('John Doe')
    expect(avatar).toHaveAttribute('src', avatarUrl)
  })

  it('opens menu when avatar is clicked', async () => {
    render(<UserMenu userName="John Doe" userEmail="john@example.com" />)
    
    const button = screen.getByLabelText('user menu')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })
  })

  it('shows all menu items when handlers are provided', async () => {
    const onProfile = vi.fn()
    const onSettings = vi.fn()
    const onLogout = vi.fn()
    
    render(
      <UserMenu
        userName="John Doe"
        onProfile={onProfile}
        onSettings={onSettings}
        onLogout={onLogout}
      />
    )
    
    const button = screen.getByLabelText('user menu')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })
  })

  it('calls onProfile when profile is clicked', async () => {
    const onProfile = vi.fn()
    
    render(<UserMenu userName="John Doe" onProfile={onProfile} />)
    
    const button = screen.getByLabelText('user menu')
    fireEvent.click(button)
    
    await waitFor(() => {
      const profileItem = screen.getByText('Profile')
      fireEvent.click(profileItem)
    })
    
    expect(onProfile).toHaveBeenCalledOnce()
  })

  it('calls onSettings when settings is clicked', async () => {
    const onSettings = vi.fn()
    
    render(<UserMenu userName="John Doe" onSettings={onSettings} />)
    
    const button = screen.getByLabelText('user menu')
    fireEvent.click(button)
    
    await waitFor(() => {
      const settingsItem = screen.getByText('Settings')
      fireEvent.click(settingsItem)
    })
    
    expect(onSettings).toHaveBeenCalledOnce()
  })

  it('calls onLogout when logout is clicked', async () => {
    const onLogout = vi.fn()
    
    render(<UserMenu userName="John Doe" onLogout={onLogout} />)
    
    const button = screen.getByLabelText('user menu')
    fireEvent.click(button)
    
    await waitFor(() => {
      const logoutItem = screen.getByText('Logout')
      fireEvent.click(logoutItem)
    })
    
    expect(onLogout).toHaveBeenCalledOnce()
  })

  it('closes menu after clicking an item', async () => {
    const onLogout = vi.fn()
    
    render(<UserMenu userName="John Doe" onLogout={onLogout} />)
    
    const button = screen.getByLabelText('user menu')
    fireEvent.click(button)
    
    await waitFor(() => {
      const logoutItem = screen.getByText('Logout')
      fireEvent.click(logoutItem)
    })
    
    await waitFor(() => {
      expect(screen.queryByText('Logout')).not.toBeInTheDocument()
    })
  })

  it('handles long user names gracefully', () => {
    const longName = 'Alexander Maximillian Rodriguez'
    render(<UserMenu userName={longName} />)
    
    // Should show first two initials
    expect(screen.getByText('AM')).toBeInTheDocument()
  })

  it('shows default text when no user name provided', () => {
    render(<UserMenu />)
    const button = screen.getByLabelText('user menu')
    fireEvent.click(button)
    
    // The default "User" text should be shown
    waitFor(() => {
      expect(screen.getByText('User')).toBeInTheDocument()
    })
  })
})