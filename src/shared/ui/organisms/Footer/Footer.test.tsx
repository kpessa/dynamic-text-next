import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Footer } from './Footer'
import { FooterSection, SocialLink } from '../Navigation/Navigation.types'
import { Business } from '@mui/icons-material'

describe('Footer', () => {
  const mockLinkClick = vi.fn()

  const basicSections: FooterSection[] = [
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Careers', href: '/careers' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help', href: '/help' },
        { label: 'Contact', href: '/contact' }
      ]
    }
  ]

  const socialLinks: SocialLink[] = [
    { platform: 'facebook', url: 'https://facebook.com' },
    { platform: 'twitter', url: 'https://twitter.com' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render footer sections', () => {
      render(
        <Footer sections={basicSections} />
      )

      expect(screen.getByText('Company')).toBeInTheDocument()
      expect(screen.getByText('Support')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Help')).toBeInTheDocument()
    })

    it('should render company name', () => {
      render(
        <Footer companyName="Test Company" />
      )

      expect(screen.getByText('Test Company')).toBeInTheDocument()
    })

    it('should render logo', () => {
      render(
        <Footer logo={<div data-testid="logo">Logo</div>} />
      )

      expect(screen.getByTestId('logo')).toBeInTheDocument()
    })

    it('should render description', () => {
      render(
        <Footer 
          companyName="Test Co"
          description="We build amazing products"
        />
      )

      expect(screen.getByText('We build amazing products')).toBeInTheDocument()
    })
  })

  describe('Social Links', () => {
    it('should render social media icons', () => {
      render(
        <Footer socialLinks={socialLinks} />
      )

      const facebookLink = screen.getByLabelText('facebook')
      const twitterLink = screen.getByLabelText('twitter')

      expect(facebookLink).toBeInTheDocument()
      expect(twitterLink).toBeInTheDocument()
    })

    it('should have correct href for social links', () => {
      render(
        <Footer socialLinks={socialLinks} />
      )

      const facebookLink = screen.getByLabelText('facebook')
      expect(facebookLink).toHaveAttribute('href', 'https://facebook.com')
    })

    it('should open social links in new tab', () => {
      render(
        <Footer socialLinks={socialLinks} />
      )

      const facebookLink = screen.getByLabelText('facebook')
      expect(facebookLink).toHaveAttribute('target', '_blank')
      expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('should render custom social icon', () => {
      const customSocial: SocialLink[] = [
        { 
          platform: 'custom', 
          url: 'https://custom.com',
          icon: <div data-testid="custom-icon">Custom</div>,
          label: 'Custom Platform'
        }
      ]

      render(
        <Footer socialLinks={customSocial} />
      )

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })
  })

  describe('Copyright', () => {
    it('should render default copyright with current year', () => {
      const currentYear = new Date().getFullYear()
      
      render(
        <Footer companyName="Test Co" showYear={true} />
      )

      expect(screen.getByText(`© ${currentYear} Test Co. All rights reserved.`)).toBeInTheDocument()
    })

    it('should render custom copyright text', () => {
      render(
        <Footer copyright="Custom copyright text" />
      )

      expect(screen.getByText('Custom copyright text')).toBeInTheDocument()
    })

    it('should not show year when showYear is false', () => {
      render(
        <Footer companyName="Test Co" showYear={false} />
      )

      expect(screen.getByText('© Test Co. All rights reserved.')).toBeInTheDocument()
    })
  })

  describe('Bottom Links', () => {
    it('should render bottom links', () => {
      const bottomLinks = [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' }
      ]

      render(
        <Footer bottomLinks={bottomLinks} />
      )

      expect(screen.getByText('Privacy')).toBeInTheDocument()
      expect(screen.getByText('Terms')).toBeInTheDocument()
    })

    it('should call onClick handler for bottom links', () => {
      const bottomLinks = [
        { label: 'Privacy', onClick: mockLinkClick }
      ]

      render(
        <Footer bottomLinks={bottomLinks} />
      )

      const privacyLink = screen.getByText('Privacy')
      fireEvent.click(privacyLink)

      expect(mockLinkClick).toHaveBeenCalled()
    })
  })

  describe('Newsletter', () => {
    it('should render newsletter component', () => {
      const newsletter = <div data-testid="newsletter">Newsletter Form</div>

      render(
        <Footer newsletter={newsletter} />
      )

      expect(screen.getByTestId('newsletter')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('should render default variant', () => {
      const { container } = render(
        <Footer 
          variant="default"
          sections={basicSections}
          companyName="Default Footer"
        />
      )

      // Default variant should have sections
      expect(screen.getByText('Company')).toBeInTheDocument()
      expect(container.querySelector('.MuiDivider-root')).toBeInTheDocument()
    })

    it('should render minimal variant', () => {
      render(
        <Footer 
          variant="minimal"
          companyName="Minimal Footer"
        />
      )

      expect(screen.getByText(/Minimal Footer/)).toBeInTheDocument()
    })

    it('should render centered variant', () => {
      render(
        <Footer 
          variant="centered"
          companyName="Centered Footer"
          sections={[{ title: '', links: [{ label: 'Home', href: '/' }] }]}
        />
      )

      expect(screen.getByText('Centered Footer')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
    })

    it('should render dark variant', () => {
      const { container } = render(
        <Footer 
          variant="dark"
          companyName="Dark Footer"
        />
      )

      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })
  })

  describe('External Links', () => {
    it('should handle external links in sections', () => {
      const sectionsWithExternal: FooterSection[] = [
        {
          title: 'Resources',
          links: [
            { label: 'GitHub', href: 'https://github.com', external: true }
          ]
        }
      ]

      render(
        <Footer sections={sectionsWithExternal} />
      )

      const githubLink = screen.getByText('GitHub')
      expect(githubLink).toHaveAttribute('target', '_blank')
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('Custom Colors', () => {
    it('should apply custom background color', () => {
      const { container } = render(
        <Footer 
          backgroundColor="#123456"
          companyName="Custom Colors"
        />
      )

      const footer = container.querySelector('footer')
      expect(footer).toHaveStyle({ backgroundColor: '#123456' })
    })

    it('should apply custom text color', () => {
      const { container } = render(
        <Footer 
          textColor="#abcdef"
          companyName="Custom Text"
        />
      )

      const footer = container.querySelector('footer')
      expect(footer).toHaveStyle({ color: '#abcdef' })
    })
  })

  describe('Max Width', () => {
    it('should apply max width to container', () => {
      const { container } = render(
        <Footer 
          maxWidth="sm"
          companyName="Small Container"
        />
      )

      const muiContainer = container.querySelector('.MuiContainer-maxWidthSm')
      expect(muiContainer).toBeInTheDocument()
    })

    it('should handle false max width', () => {
      const { container } = render(
        <Footer 
          maxWidth={false}
          companyName="No Max Width"
        />
      )

      const muiContainer = container.querySelector('.MuiContainer-root')
      expect(muiContainer).toBeInTheDocument()
    })
  })

  describe('Interactive Links', () => {
    it('should call onClick handler for section links', () => {
      const sectionsWithClick: FooterSection[] = [
        {
          title: 'Navigation',
          links: [
            { label: 'Home', onClick: mockLinkClick }
          ]
        }
      ]

      render(
        <Footer sections={sectionsWithClick} />
      )

      const homeLink = screen.getByText('Home')
      fireEvent.click(homeLink)

      expect(mockLinkClick).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for social links', () => {
      render(
        <Footer socialLinks={socialLinks} />
      )

      expect(screen.getByLabelText('facebook')).toBeInTheDocument()
      expect(screen.getByLabelText('twitter')).toBeInTheDocument()
    })

    it('should have semantic footer element', () => {
      const { container } = render(
        <Footer companyName="Semantic Footer" />
      )

      const footer = container.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should render without sections', () => {
      render(
        <Footer companyName="No Sections" />
      )

      expect(screen.getByText(/No Sections/)).toBeInTheDocument()
    })

    it('should render without social links', () => {
      render(
        <Footer 
          sections={basicSections}
          companyName="No Social"
        />
      )

      expect(screen.getByText('No Social')).toBeInTheDocument()
    })
  })
})