import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Footer } from './Footer'
import { FooterSection, SocialLink } from '../Navigation/Navigation.types'
import { TextField, Button, Box } from '@mui/material'
import { Business } from '@mui/icons-material'

const meta = {
  title: 'Organisms/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen'
  },
  tags: ['autodocs']
} satisfies Meta<typeof Footer>

export default meta
type Story = StoryObj<typeof meta>

const basicSections: FooterSection[] = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Contact', href: '/contact' }
    ]
  },
  {
    title: 'Products',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Enterprise', href: '/enterprise' },
      { label: 'Customers', href: '/customers' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api' },
      { label: 'Guides', href: '/guides' },
      { label: 'Blog', href: '/blog' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'License', href: '/license' }
    ]
  }
]

const socialLinks: SocialLink[] = [
  { platform: 'facebook', url: 'https://facebook.com' },
  { platform: 'twitter', url: 'https://twitter.com' },
  { platform: 'linkedin', url: 'https://linkedin.com' },
  { platform: 'instagram', url: 'https://instagram.com' },
  { platform: 'youtube', url: 'https://youtube.com' },
  { platform: 'github', url: 'https://github.com' }
]

const bottomLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Sitemap', href: '/sitemap' }
]

const newsletter = (
  <Box sx={{ maxWidth: 300 }}>
    <TextField
      size="small"
      placeholder="Enter your email"
      fullWidth
      sx={{ mb: 1, backgroundColor: 'white' }}
    />
    <Button variant="contained" fullWidth size="small">
      Subscribe
    </Button>
  </Box>
)

export const Default: Story = {
  args: {
    sections: basicSections,
    socialLinks,
    companyName: 'My Company',
    showYear: true
  }
}

export const WithLogo: Story = {
  args: {
    logo: <Business sx={{ fontSize: 40 }} />,
    sections: basicSections,
    socialLinks,
    companyName: 'Business Inc.',
    description: 'We build amazing products that help businesses grow and succeed.',
    showYear: true
  }
}

export const WithNewsletter: Story = {
  args: {
    sections: basicSections.slice(0, 3),
    socialLinks,
    companyName: 'Newsletter Co.',
    description: 'Stay updated with our latest news and updates.',
    newsletter,
    showYear: true
  }
}

export const MinimalVariant: Story = {
  args: {
    variant: 'minimal',
    companyName: 'Minimal Corp',
    bottomLinks,
    showYear: true
  }
}

export const CenteredVariant: Story = {
  args: {
    variant: 'centered',
    logo: <Business sx={{ fontSize: 40 }} />,
    companyName: 'Centered Brand',
    description: 'A beautifully centered footer design for modern websites.',
    sections: [
      {
        title: '',
        links: [
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Services', href: '/services' },
          { label: 'Contact', href: '/contact' }
        ]
      }
    ],
    socialLinks,
    showYear: true
  }
}

export const DarkVariant: Story = {
  args: {
    variant: 'dark',
    sections: basicSections,
    socialLinks,
    companyName: 'Dark Theme Co.',
    description: 'Professional dark themed footer for modern applications.',
    bottomLinks,
    showYear: true
  }
}

export const CustomColors: Story = {
  args: {
    sections: basicSections,
    socialLinks,
    companyName: 'Custom Colors',
    backgroundColor: '#2c3e50',
    textColor: '#ecf0f1',
    bottomLinks,
    showYear: true
  }
}

export const CompactSections: Story = {
  args: {
    sections: [
      {
        title: 'Quick Links',
        links: [
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' }
        ]
      },
      {
        title: 'Support',
        links: [
          { label: 'Help Center', href: '/help' },
          { label: 'FAQ', href: '/faq' },
          { label: 'Contact Us', href: '/contact' }
        ]
      }
    ],
    companyName: 'Compact Footer',
    socialLinks: socialLinks.slice(0, 3),
    showYear: true
  }
}

export const WithExternalLinks: Story = {
  args: {
    sections: [
      {
        title: 'Resources',
        links: [
          { label: 'Documentation', href: 'https://docs.example.com', external: true },
          { label: 'GitHub', href: 'https://github.com/example', external: true },
          { label: 'Stack Overflow', href: 'https://stackoverflow.com', external: true }
        ]
      },
      {
        title: 'Community',
        links: [
          { label: 'Discord', href: 'https://discord.com', external: true },
          { label: 'Twitter', href: 'https://twitter.com', external: true },
          { label: 'YouTube', href: 'https://youtube.com', external: true }
        ]
      }
    ],
    companyName: 'External Links Demo',
    showYear: true
  }
}

export const OnlySocial: Story = {
  args: {
    variant: 'centered',
    socialLinks,
    companyName: 'Social Media Co.',
    showYear: true
  }
}

export const CustomCopyright: Story = {
  args: {
    sections: basicSections.slice(0, 2),
    companyName: 'Custom Copyright',
    copyright: '© 2024 Custom Copyright Text. All rights reserved. Made with ❤️',
    socialLinks: socialLinks.slice(0, 3),
    showYear: false
  }
}

export const WithMaxWidth: Story = {
  args: {
    sections: basicSections,
    socialLinks,
    companyName: 'Max Width Demo',
    maxWidth: 'sm',
    description: 'This footer has a small max width container.',
    showYear: true
  }
}

export const FullExample: Story = {
  args: {
    logo: <Business sx={{ fontSize: 40 }} />,
    sections: basicSections,
    socialLinks,
    companyName: 'Complete Footer Inc.',
    description: 'Building the future of web applications with modern technologies and best practices.',
    newsletter: (
      <Box>
        <Box sx={{ mb: 1 }}>
          <strong style={{ color: 'white' }}>Subscribe to our newsletter</strong>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Your email"
            sx={{ backgroundColor: 'white', borderRadius: 1, flex: 1 }}
          />
          <Button variant="contained" color="primary" size="small">
            Subscribe
          </Button>
        </Box>
      </Box>
    ),
    bottomLinks: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Settings', href: '/cookies' },
      { label: 'Accessibility', href: '/accessibility' }
    ],
    showYear: true,
    variant: 'default'
  }
}

export const ResponsiveFooter: Story = {
  args: {
    sections: [
      {
        title: 'Products',
        links: [
          { label: 'Features', href: '/features' },
          { label: 'Pricing', href: '/pricing' }
        ]
      },
      {
        title: 'Company',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Blog', href: '/blog' }
        ]
      }
    ],
    socialLinks: socialLinks.slice(0, 4),
    companyName: 'Responsive Co.',
    description: 'Responsive footer that adapts to different screen sizes.',
    bottomLinks,
    showYear: true
  },
  parameters: {
    viewport: {
      defaultViewport: 'responsive'
    }
  }
}

export const MobileView: Story = {
  args: {
    sections: basicSections.slice(0, 2),
    socialLinks: socialLinks.slice(0, 3),
    companyName: 'Mobile Footer',
    description: 'Optimized for mobile devices.',
    showYear: true
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
}

export const NoSections: Story = {
  args: {
    logo: <Business sx={{ fontSize: 40 }} />,
    companyName: 'Simple Footer',
    description: 'Sometimes less is more. A simple footer with just the essentials.',
    socialLinks,
    bottomLinks,
    showYear: true
  }
}

export const Interactive: Story = {
  args: {
    sections: [
      {
        title: 'Navigation',
        links: [
          { label: 'Home', onClick: () => console.log('Home clicked') },
          { label: 'About', onClick: () => console.log('About clicked') },
          { label: 'Services', onClick: () => console.log('Services clicked') },
          { label: 'Contact', onClick: () => console.log('Contact clicked') }
        ]
      }
    ],
    socialLinks,
    companyName: 'Interactive Footer',
    description: 'Click the links to see console output.',
    bottomLinks: [
      { label: 'Privacy', onClick: () => console.log('Privacy clicked') },
      { label: 'Terms', onClick: () => console.log('Terms clicked') }
    ],
    showYear: true
  }
}