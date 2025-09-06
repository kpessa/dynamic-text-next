import React from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  Stack,
  Divider,
  IconButton,
  useTheme
} from '@mui/material'
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  YouTube,
  GitHub
} from '@mui/icons-material'
import { FooterProps, SocialLink } from '../Navigation/Navigation.types'

const getSocialIcon = (platform: SocialLink['platform']) => {
  switch (platform) {
    case 'facebook':
      return <Facebook />
    case 'twitter':
      return <Twitter />
    case 'linkedin':
      return <LinkedIn />
    case 'instagram':
      return <Instagram />
    case 'youtube':
      return <YouTube />
    case 'github':
      return <GitHub />
    default:
      return null
  }
}

export function Footer({
  sections = [],
  socialLinks = [],
  companyName,
  copyright,
  showYear = true,
  logo,
  description,
  newsletter,
  bottomLinks = [],
  variant = 'default',
  sx,
  backgroundColor,
  textColor,
  maxWidth = 'lg'
}: FooterProps) {
  const theme = useTheme()
  const currentYear = new Date().getFullYear()
  
  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor
    switch (variant) {
      case 'dark':
        return theme.palette.grey[900]
      case 'minimal':
        return 'transparent'
      default:
        return theme.palette.grey[100]
    }
  }
  
  const getTextColor = () => {
    if (textColor) return textColor
    switch (variant) {
      case 'dark':
        return theme.palette.common.white
      default:
        return theme.palette.text.primary
    }
  }
  
  const linkColor = variant === 'dark' ? theme.palette.grey[400] : theme.palette.text.secondary
  
  const renderCentered = () => (
    <Stack spacing={3} alignItems="center" sx={{ py: 6 }}>
      {logo && <Box>{logo}</Box>}
      
      {companyName && (
        <Typography variant="h5" fontWeight="bold" color={getTextColor()}>
          {companyName}
        </Typography>
      )}
      
      {description && (
        <Typography variant="body1" color={linkColor} textAlign="center" maxWidth={600}>
          {description}
        </Typography>
      )}
      
      {sections.length > 0 && (
        <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="center">
          {sections[0].links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={link.onClick}
              color={linkColor}
              underline="hover"
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </Stack>
      )}
      
      {socialLinks.length > 0 && (
        <Stack direction="row" spacing={1}>
          {socialLinks.map((social, index) => (
            <IconButton
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label || social.platform}
              sx={{ color: linkColor }}
            >
              {social.icon || getSocialIcon(social.platform)}
            </IconButton>
          ))}
        </Stack>
      )}
      
      <Typography variant="body2" color={linkColor}>
        {copyright || `© ${showYear ? currentYear : ''} ${companyName || ''}. All rights reserved.`}
      </Typography>
    </Stack>
  )
  
  const renderMinimal = () => (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'center', sm: 'center' }}
      spacing={2}
      sx={{ py: 3 }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {logo && <Box>{logo}</Box>}
        <Typography variant="body2" color={linkColor}>
          {copyright || `© ${showYear ? currentYear : ''} ${companyName || ''}. All rights reserved.`}
        </Typography>
      </Stack>
      
      <Stack direction="row" spacing={2}>
        {bottomLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={link.onClick}
            color={linkColor}
            underline="hover"
            variant="body2"
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
          >
            {link.label}
          </Link>
        ))}
      </Stack>
    </Stack>
  )
  
  const renderDefault = () => (
    <Box sx={{ py: 6 }}>
      <Grid container spacing={4}>
        {/* Company Info */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            {logo && <Box>{logo}</Box>}
            
            {companyName && (
              <Typography variant="h6" fontWeight="bold" color={getTextColor()}>
                {companyName}
              </Typography>
            )}
            
            {description && (
              <Typography variant="body2" color={linkColor}>
                {description}
              </Typography>
            )}
            
            {newsletter && (
              <Box sx={{ mt: 2 }}>
                {newsletter}
              </Box>
            )}
            
            {socialLinks.length > 0 && (
              <Stack direction="row" spacing={1}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label || social.platform}
                    size="small"
                    sx={{ color: linkColor }}
                  >
                    {social.icon || getSocialIcon(social.platform)}
                  </IconButton>
                ))}
              </Stack>
            )}
          </Stack>
        </Grid>
        
        {/* Link Sections */}
        {sections.map((section) => (
          <Grid key={section.title} item xs={6} sm={4} md={sections.length > 3 ? 2 : 8 / sections.length}>
            <Typography variant="h6" fontWeight="bold" color={getTextColor()} gutterBottom>
              {section.title}
            </Typography>
            <Stack spacing={1}>
              {section.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={link.onClick}
                  color={linkColor}
                  underline="hover"
                  variant="body2"
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Grid>
        ))}
      </Grid>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Bottom Section */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'center', sm: 'center' }}
        spacing={2}
      >
        <Typography variant="body2" color={linkColor}>
          {copyright || `© ${showYear ? currentYear : ''} ${companyName || ''}. All rights reserved.`}
        </Typography>
        
        {bottomLinks.length > 0 && (
          <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
            {bottomLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={link.onClick}
                color={linkColor}
                underline="hover"
                variant="body2"
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  )
  
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        ...sx
      }}
    >
      <Container maxWidth={maxWidth}>
        {variant === 'centered' && renderCentered()}
        {variant === 'minimal' && renderMinimal()}
        {(variant === 'default' || variant === 'dark') && renderDefault()}
      </Container>
    </Box>
  )
}