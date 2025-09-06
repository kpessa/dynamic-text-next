import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Navigation } from './Navigation'
import { NavigationItem } from './Navigation.types'
import {
  Home,
  Info,
  ContactMail,
  Settings,
  Dashboard,
  ShoppingCart,
  Person,
  Notifications,
  Language,
  Help
} from '@mui/icons-material'
import { Button, IconButton, Badge, Avatar } from '@mui/material'

const meta = {
  title: 'Organisms/Navigation',
  component: Navigation,
  parameters: {
    layout: 'fullscreen'
  },
  tags: ['autodocs']
} satisfies Meta<typeof Navigation>

export default meta
type Story = StoryObj<typeof meta>

const basicItems: NavigationItem[] = [
  { id: 'home', label: 'Home', href: '/', icon: <Home /> },
  { id: 'about', label: 'About', href: '/about', icon: <Info /> },
  { id: 'services', label: 'Services', href: '/services' },
  { id: 'contact', label: 'Contact', href: '/contact', icon: <ContactMail /> }
]

const itemsWithDropdown: NavigationItem[] = [
  { id: 'home', label: 'Home', href: '/' },
  {
    id: 'products',
    label: 'Products',
    children: [
      { id: 'product1', label: 'Product 1', href: '/products/1' },
      { id: 'product2', label: 'Product 2', href: '/products/2' },
      { id: 'product3', label: 'Product 3', href: '/products/3', divider: true },
      { id: 'all-products', label: 'View All Products', href: '/products' }
    ]
  },
  {
    id: 'services',
    label: 'Services',
    children: [
      { id: 'consulting', label: 'Consulting', href: '/services/consulting', icon: <Dashboard /> },
      { id: 'development', label: 'Development', href: '/services/development' },
      { id: 'support', label: 'Support', href: '/services/support', icon: <Help /> }
    ]
  },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'contact', label: 'Contact', href: '/contact' }
]

const nestedItems: NavigationItem[] = [
  { id: 'home', label: 'Home', href: '/' },
  {
    id: 'shop',
    label: 'Shop',
    icon: <ShoppingCart />,
    children: [
      {
        id: 'electronics',
        label: 'Electronics',
        children: [
          { id: 'phones', label: 'Phones', href: '/shop/electronics/phones' },
          { id: 'laptops', label: 'Laptops', href: '/shop/electronics/laptops' },
          { id: 'tablets', label: 'Tablets', href: '/shop/electronics/tablets' }
        ]
      },
      {
        id: 'clothing',
        label: 'Clothing',
        children: [
          { id: 'mens', label: "Men's", href: '/shop/clothing/mens' },
          { id: 'womens', label: "Women's", href: '/shop/clothing/womens' },
          { id: 'kids', label: "Kids", href: '/shop/clothing/kids' }
        ]
      }
    ]
  },
  { id: 'contact', label: 'Contact', href: '/contact' }
]

const rightActions = (
  <>
    <IconButton color="inherit">
      <Badge badgeContent={4} color="error">
        <Notifications />
      </Badge>
    </IconButton>
    <IconButton color="inherit">
      <Language />
    </IconButton>
    <IconButton color="inherit">
      <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
    </IconButton>
  </>
)

export const Default: Story = {
  args: {
    items: basicItems,
    brand: 'My Brand',
    activeId: 'home'
  }
}

export const WithLogo: Story = {
  args: {
    items: basicItems,
    logo: <Dashboard sx={{ fontSize: 32 }} />,
    brand: 'Dashboard',
    activeId: 'home'
  }
}

export const WithDropdowns: Story = {
  args: {
    items: itemsWithDropdown,
    brand: 'Company',
    activeId: 'products'
  }
}

export const NestedMenus: Story = {
  args: {
    items: nestedItems,
    brand: 'E-Commerce',
    maxDepth: 2,
    activeId: 'shop'
  }
}

export const WithSearch: Story = {
  args: {
    items: basicItems,
    brand: 'Search App',
    showSearch: true,
    searchPlaceholder: 'Search products...',
    onSearchSubmit: (value) => console.log('Search:', value)
  }
}

export const WithRightActions: Story = {
  args: {
    items: basicItems,
    brand: 'Social App',
    rightActions,
    activeId: 'home'
  }
}

export const TransparentVariant: Story = {
  args: {
    items: basicItems,
    brand: 'Transparent Nav',
    variant: 'transparent',
    elevation: 0
  }
}

export const DarkVariant: Story = {
  args: {
    items: basicItems,
    brand: 'Dark Theme',
    variant: 'dark',
    rightActions
  }
}

export const FixedPosition: Story = {
  args: {
    items: basicItems,
    brand: 'Fixed Nav',
    position: 'fixed',
    activeId: 'home'
  },
  decorators: [
    (Story) => (
      <div style={{ paddingTop: 80, height: '200vh' }}>
        <Story />
        <div style={{ padding: 20 }}>
          <h2>Page Content</h2>
          <p>Scroll down to see the fixed navigation stay in place.</p>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          ))}
        </div>
      </div>
    )
  ]
}

export const HideOnScroll: Story = {
  args: {
    items: basicItems,
    brand: 'Hide on Scroll',
    hideOnScroll: true,
    position: 'sticky'
  },
  decorators: [
    (Story) => (
      <div style={{ height: '200vh' }}>
        <Story />
        <div style={{ padding: 20 }}>
          <h2>Page Content</h2>
          <p>Scroll down to see the navigation hide, scroll up to see it reappear.</p>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          ))}
        </div>
      </div>
    )
  ]
}

export const WithBadges: Story = {
  args: {
    items: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'messages', label: 'Messages', href: '/messages', badge: 5 },
      { id: 'notifications', label: 'Notifications', href: '/notifications', badge: 'New' },
      { id: 'settings', label: 'Settings', href: '/settings' }
    ],
    brand: 'Badge Demo'
  }
}

export const MobileView: Story = {
  args: {
    items: itemsWithDropdown,
    brand: 'Mobile Nav',
    showBrandOnMobile: true,
    rightActions,
    showSearch: true
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
}

export const WithToolbarContent: Story = {
  args: {
    items: basicItems,
    brand: 'Extended Nav',
    toolbarContent: (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button size="small" variant="outlined">Quick Action 1</Button>
        <Button size="small" variant="outlined">Quick Action 2</Button>
        <Button size="small" variant="outlined">Quick Action 3</Button>
      </div>
    )
  }
}

export const DisabledItems: Story = {
  args: {
    items: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'premium', label: 'Premium', href: '/premium', disabled: true },
      { id: 'beta', label: 'Beta Features', href: '/beta', disabled: true },
      { id: 'contact', label: 'Contact', href: '/contact' }
    ],
    brand: 'Disabled Demo'
  }
}

export const ExternalLinks: Story = {
  args: {
    items: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'docs', label: 'Documentation', href: 'https://docs.example.com', external: true },
      { id: 'github', label: 'GitHub', href: 'https://github.com', external: true },
      { id: 'contact', label: 'Contact', href: '/contact' }
    ],
    brand: 'External Links'
  }
}

export const CustomMobileBreakpoint: Story = {
  args: {
    items: basicItems,
    brand: 'Custom Breakpoint',
    mobileBreakpoint: 'lg',
    rightActions
  }
}

export const DrawerVariant: Story = {
  args: {
    items: itemsWithDropdown,
    brand: 'Drawer Menu',
    mobileMenuVariant: 'drawer',
    showBrandOnMobile: true
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
}

export const Interactive: Story = {
  args: {
    items: itemsWithDropdown,
    brand: 'Interactive Nav',
    showSearch: true,
    rightActions,
    activeId: 'home',
    onItemClick: (item) => console.log('Clicked:', item),
    onSearchSubmit: (value) => console.log('Search:', value)
  }
}

export const CompleteExample: Story = {
  args: {
    items: itemsWithDropdown,
    logo: <Dashboard sx={{ fontSize: 32 }} />,
    brand: 'Complete App',
    showSearch: true,
    searchPlaceholder: 'Search anything...',
    rightActions: (
      <>
        <Button variant="outlined" color="inherit" size="small" sx={{ mr: 1 }}>
          Sign In
        </Button>
        <Button variant="contained" size="small">
          Get Started
        </Button>
      </>
    ),
    activeId: 'home',
    position: 'sticky',
    hideOnScroll: false,
    showBrandOnMobile: true,
    elevation: 2
  }
}