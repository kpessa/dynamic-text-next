import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Tabs, ScrollableTabs, VerticalTabs, IconTabs, BadgeTabs } from './Tabs'
import HomeIcon from '@mui/icons-material/Home'
import SettingsIcon from '@mui/icons-material/Settings'

describe('Tabs', () => {
  const defaultTabs = [
    { label: 'Tab 1', value: 'tab1', content: <div>Content 1</div> },
    { label: 'Tab 2', value: 'tab2', content: <div>Content 2</div> },
    { label: 'Tab 3', value: 'tab3', content: <div>Content 3</div>, disabled: true },
  ]

  const defaultProps = {
    value: 'tab1',
    onChange: vi.fn(),
    tabs: defaultTabs,
  }

  it('should render tabs correctly', () => {
    render(<Tabs {...defaultProps} />)
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
    expect(screen.getByText('Tab 3')).toBeInTheDocument()
  })

  it('should show active tab content', () => {
    render(<Tabs {...defaultProps} />)
    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
  })

  it('should call onChange when tab is clicked', () => {
    const onChange = vi.fn()
    render(<Tabs {...defaultProps} onChange={onChange} />)
    
    fireEvent.click(screen.getByText('Tab 2'))
    expect(onChange).toHaveBeenCalledWith('tab2')
  })

  it('should disable tabs when disabled prop is true', () => {
    render(<Tabs {...defaultProps} />)
    const disabledTab = screen.getByText('Tab 3').closest('button')
    expect(disabledTab).toBeDisabled()
  })

  it('should not show content when showContent is false', () => {
    render(<Tabs {...defaultProps} showContent={false} />)
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
  })

  it('should render with icons', () => {
    const tabsWithIcons = [
      { label: 'Home', value: 'home', icon: <HomeIcon />, content: <div>Home Content</div> },
      { label: 'Settings', value: 'settings', icon: <SettingsIcon />, content: <div>Settings Content</div> },
    ]
    
    render(
      <Tabs
        value="home"
        onChange={vi.fn()}
        tabs={tabsWithIcons}
      />
    )
    
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should handle different variants', () => {
    const variants = ['standard', 'scrollable', 'fullWidth'] as const
    variants.forEach(variant => {
      const { rerender } = render(<Tabs {...defaultProps} variant={variant} />)
      expect(screen.getByText('Tab 1')).toBeInTheDocument()
      rerender(<div />)
    })
  })

  it('should handle vertical orientation', () => {
    render(<Tabs {...defaultProps} orientation="vertical" />)
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })

  it('should handle centered tabs', () => {
    render(<Tabs {...defaultProps} centered />)
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
  })

  it('should apply custom classNames', () => {
    const { container } = render(
      <Tabs
        {...defaultProps}
        className="custom-tabs"
        tabClassName="custom-tab"
        contentClassName="custom-content"
      />
    )
    
    expect(container.querySelector('.custom-tabs')).toBeInTheDocument()
  })
})

describe('ScrollableTabs', () => {
  const tabs = Array.from({ length: 10 }, (_, i) => ({
    label: `Tab ${i + 1}`,
    value: `tab${i + 1}`,
    content: <div>Content {i + 1}</div>,
  }))

  it('should render scrollable tabs', () => {
    render(
      <ScrollableTabs
        value="tab1"
        onChange={vi.fn()}
        tabs={tabs}
        maxWidth={300}
      />
    )
    
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 10')).toBeInTheDocument()
  })
})

describe('VerticalTabs', () => {
  const tabs = [
    { label: 'Tab 1', value: 'tab1', content: <div>Content 1</div> },
    { label: 'Tab 2', value: 'tab2', content: <div>Content 2</div> },
  ]

  it('should render vertical tabs', () => {
    render(
      <VerticalTabs
        value="tab1"
        onChange={vi.fn()}
        tabs={tabs}
        minHeight={300}
      />
    )
    
    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Content 1')).toBeInTheDocument()
  })
})

describe('IconTabs', () => {
  const tabs = [
    { label: 'Home', value: 'home', icon: <HomeIcon />, content: <div>Home Content</div> },
    { label: 'Settings', value: 'settings', icon: <SettingsIcon />, content: <div>Settings Content</div> },
  ]

  it('should render tabs with icons on top', () => {
    render(
      <IconTabs
        value="home"
        onChange={vi.fn()}
        tabs={tabs}
      />
    )
    
    // Check for tab labels (not content)
    const homeTab = screen.getByRole('tab', { name: /home/i })
    const settingsTab = screen.getByRole('tab', { name: /settings/i })
    expect(homeTab).toBeInTheDocument()
    expect(settingsTab).toBeInTheDocument()
  })
})

describe('BadgeTabs', () => {
  const tabs = [
    { label: 'Messages', value: 'messages', content: <div>Messages Content</div> },
    { label: 'Notifications', value: 'notifications', content: <div>Notifications Content</div> },
  ]

  const badges = {
    messages: 5,
    notifications: 12,
  }

  it('should render tabs with badges', () => {
    render(
      <BadgeTabs
        value="messages"
        onChange={vi.fn()}
        tabs={tabs}
        badges={badges}
      />
    )
    
    // Check for badges
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    // Check tabs are rendered
    const messagesTab = screen.getByRole('tab', { name: /messages/i })
    const notificationsTab = screen.getByRole('tab', { name: /notifications/i })
    expect(messagesTab).toBeInTheDocument()
    expect(notificationsTab).toBeInTheDocument()
  })
})