import { ReactNode } from 'react'
import { SxProps, Theme } from '@mui/material'

export interface NavigationItem {
  id: string
  label: string
  href?: string
  onClick?: () => void
  icon?: ReactNode
  disabled?: boolean
  badge?: string | number
  children?: NavigationItem[]
  divider?: boolean
  external?: boolean
  description?: string
}

export interface NavigationProps {
  /**
   * Navigation items
   */
  items: NavigationItem[]
  
  /**
   * Current active item ID
   */
  activeId?: string
  
  /**
   * Callback when item is clicked
   */
  onItemClick?: (item: NavigationItem) => void
  
  /**
   * Logo element or text
   */
  logo?: ReactNode
  
  /**
   * Brand/company name
   */
  brand?: string
  
  /**
   * Show brand name on mobile
   */
  showBrandOnMobile?: boolean
  
  /**
   * Right side actions (e.g., login, profile)
   */
  rightActions?: ReactNode
  
  /**
   * Navigation variant
   */
  variant?: 'default' | 'transparent' | 'dark'
  
  /**
   * Position of navigation
   */
  position?: 'static' | 'fixed' | 'sticky' | 'absolute'
  
  /**
   * Elevation (shadow depth)
   */
  elevation?: number
  
  /**
   * Hide navigation on scroll down
   */
  hideOnScroll?: boolean
  
  /**
   * Mobile breakpoint
   */
  mobileBreakpoint?: 'xs' | 'sm' | 'md' | 'lg'
  
  /**
   * Mobile menu variant
   */
  mobileMenuVariant?: 'drawer' | 'dropdown'
  
  /**
   * Custom styles
   */
  sx?: SxProps<Theme>
  
  /**
   * Show search bar
   */
  showSearch?: boolean
  
  /**
   * Search placeholder
   */
  searchPlaceholder?: string
  
  /**
   * Search value
   */
  searchValue?: string
  
  /**
   * On search change
   */
  onSearchChange?: (value: string) => void
  
  /**
   * On search submit
   */
  onSearchSubmit?: (value: string) => void
  
  /**
   * Max depth for nested items (dropdown)
   */
  maxDepth?: number
  
  /**
   * Custom mobile menu button
   */
  customMobileMenuButton?: ReactNode
  
  /**
   * Additional toolbar content
   */
  toolbarContent?: ReactNode
  
  /**
   * Sticky offset from top
   */
  stickyOffset?: number
}

export interface FooterLink {
  label: string
  href?: string
  onClick?: () => void
  external?: boolean
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'youtube' | 'github' | 'custom'
  url: string
  icon?: ReactNode
  label?: string
}

export interface FooterProps {
  /**
   * Footer sections with links
   */
  sections?: FooterSection[]
  
  /**
   * Social media links
   */
  socialLinks?: SocialLink[]
  
  /**
   * Company/brand name
   */
  companyName?: string
  
  /**
   * Copyright text
   */
  copyright?: string
  
  /**
   * Show current year in copyright
   */
  showYear?: boolean
  
  /**
   * Logo element
   */
  logo?: ReactNode
  
  /**
   * Description/tagline
   */
  description?: string
  
  /**
   * Newsletter signup component
   */
  newsletter?: ReactNode
  
  /**
   * Additional bottom links (Privacy, Terms, etc.)
   */
  bottomLinks?: FooterLink[]
  
  /**
   * Footer variant
   */
  variant?: 'default' | 'minimal' | 'centered' | 'dark'
  
  /**
   * Custom styles
   */
  sx?: SxProps<Theme>
  
  /**
   * Background color
   */
  backgroundColor?: string
  
  /**
   * Text color
   */
  textColor?: string
  
  /**
   * Container max width
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
}