import React from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack
} from '@mui/material'
import {
  Inbox as InboxIcon,
  SearchOff as SearchOffIcon,
  Error as ErrorIcon,
  Lock as LockIcon,
  Construction as ConstructionIcon,
  CloudOff as CloudOffIcon
} from '@mui/icons-material'
import { EmptyStateProps, EmptyStateVariant } from './EmptyState.types'

const getDefaultIcon = (variant: EmptyStateVariant) => {
  const iconProps = { sx: { fontSize: 'inherit' } }
  
  switch (variant) {
    case 'error':
      return <ErrorIcon {...iconProps} />
    case 'no-results':
      return <SearchOffIcon {...iconProps} />
    case 'no-data':
      return <CloudOffIcon {...iconProps} />
    case 'no-permission':
      return <LockIcon {...iconProps} />
    case 'coming-soon':
      return <ConstructionIcon {...iconProps} />
    default:
      return <InboxIcon {...iconProps} />
  }
}

const getDefaultContent = (variant: EmptyStateVariant) => {
  switch (variant) {
    case 'error':
      return {
        title: 'Something went wrong',
        description: 'An error occurred while loading the content. Please try again.'
      }
    case 'no-results':
      return {
        title: 'No results found',
        description: 'Try adjusting your search or filter criteria.'
      }
    case 'no-data':
      return {
        title: 'No data available',
        description: 'There is no data to display at the moment.'
      }
    case 'no-permission':
      return {
        title: 'Access denied',
        description: 'You do not have permission to view this content.'
      }
    case 'coming-soon':
      return {
        title: 'Coming soon',
        description: 'This feature is under development and will be available soon.'
      }
    default:
      return {
        title: 'Empty',
        description: 'No content to display.'
      }
  }
}

const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        iconSize: 48,
        titleVariant: 'h6' as const,
        descriptionVariant: 'body2' as const,
        spacing: 1,
        padding: 2
      }
    case 'large':
      return {
        iconSize: 96,
        titleVariant: 'h4' as const,
        descriptionVariant: 'body1' as const,
        spacing: 3,
        padding: 6
      }
    default: // medium
      return {
        iconSize: 64,
        titleVariant: 'h5' as const,
        descriptionVariant: 'body1' as const,
        spacing: 2,
        padding: 4
      }
  }
}

export function EmptyState({
  title,
  description,
  icon,
  image,
  imageAlt,
  
  variant = 'default',
  
  primaryAction,
  secondaryAction,
  customActions,
  
  orientation = 'vertical',
  size = 'medium',
  fullHeight = false,
  minHeight = 300,
  
  sx,
  iconColor = 'disabled',
  backgroundColor,
  bordered = false,
  rounded = false,
  elevation = 0,
  
  children,
  footer
}: EmptyStateProps) {
  const defaultContent = getDefaultContent(variant)
  const sizeStyles = getSizeStyles(size)
  
  const displayTitle = title ?? defaultContent.title
  const displayDescription = description ?? defaultContent.description
  const displayIcon = icon ?? (image ? null : getDefaultIcon(variant))
  
  const content = (
    <Stack
      direction={orientation === 'horizontal' ? 'row' : 'column'}
      spacing={sizeStyles.spacing}
      alignItems="center"
      justifyContent="center"
      sx={{
        textAlign: orientation === 'horizontal' ? 'left' : 'center',
        width: '100%',
        maxWidth: orientation === 'horizontal' ? 800 : 600,
        mx: 'auto'
      }}
    >
      {/* Icon or Image */}
      {(displayIcon || image) && (
        <Box
          sx={{
            color: `${iconColor}.main`,
            fontSize: sizeStyles.iconSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {image ? (
            <Box
              component="img"
              src={image}
              alt={imageAlt || displayTitle}
              sx={{
                width: sizeStyles.iconSize * 2,
                height: 'auto',
                maxHeight: sizeStyles.iconSize * 2,
                objectFit: 'contain'
              }}
            />
          ) : (
            displayIcon
          )}
        </Box>
      )}
      
      {/* Text Content */}
      <Stack spacing={1} alignItems={orientation === 'horizontal' ? 'flex-start' : 'center'}>
        {displayTitle && (
          <Typography
            variant={sizeStyles.titleVariant}
            color="text.primary"
            fontWeight={500}
          >
            {displayTitle}
          </Typography>
        )}
        
        {displayDescription && (
          <Typography
            variant={sizeStyles.descriptionVariant}
            color="text.secondary"
            sx={{
              maxWidth: 400,
              mx: orientation === 'horizontal' ? 0 : 'auto'
            }}
          >
            {displayDescription}
          </Typography>
        )}
        
        {/* Actions */}
        {(primaryAction || secondaryAction || customActions) && (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              mt: sizeStyles.spacing,
              justifyContent: orientation === 'horizontal' ? 'flex-start' : 'center'
            }}
          >
            {customActions || (
              <>
                {primaryAction && (
                  <Button
                    variant="contained"
                    onClick={primaryAction.onClick}
                    startIcon={primaryAction.startIcon}
                    size={size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium'}
                  >
                    {primaryAction.label}
                  </Button>
                )}
                {secondaryAction && (
                  <Button
                    variant="outlined"
                    onClick={secondaryAction.onClick}
                    startIcon={secondaryAction.startIcon}
                    size={size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium'}
                  >
                    {secondaryAction.label}
                  </Button>
                )}
              </>
            )}
          </Stack>
        )}
        
        {/* Additional Content */}
        {children && (
          <Box sx={{ mt: sizeStyles.spacing }}>
            {children}
          </Box>
        )}
      </Stack>
    </Stack>
  )
  
  const containerProps = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    p: sizeStyles.padding,
    minHeight: fullHeight ? '100vh' : minHeight,
    backgroundColor,
    borderRadius: rounded ? 2 : 0,
    ...sx
  }
  
  if (bordered || elevation > 0) {
    return (
      <Paper
        elevation={elevation}
        variant={bordered && elevation === 0 ? 'outlined' : 'elevation'}
        sx={containerProps}
      >
        {content}
        {footer && (
          <Box sx={{ mt: sizeStyles.spacing, width: '100%' }}>
            {footer}
          </Box>
        )}
      </Paper>
    )
  }
  
  return (
    <Box sx={containerProps}>
      {content}
      {footer && (
        <Box sx={{ mt: sizeStyles.spacing, width: '100%' }}>
          {footer}
        </Box>
      )}
    </Box>
  )
}