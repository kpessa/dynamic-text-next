import React, { useState } from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Paper,
  IconButton
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material'

interface CollapsiblePanelProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  defaultExpanded?: boolean
  badge?: string | number
  icon?: React.ReactNode
  alwaysExpanded?: boolean // For desktop
  mobileOnly?: boolean // Only collapsible on mobile
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  subtitle,
  children,
  defaultExpanded = false,
  badge,
  icon,
  alwaysExpanded = false,
  mobileOnly = true
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [expanded, setExpanded] = useState(defaultExpanded)

  // On desktop, show as regular panel if mobileOnly is true
  if (!isMobile && mobileOnly) {
    return (
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          {(title || subtitle) && (
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                {icon}
                <Typography variant="h6">{title}</Typography>
                {badge && <Chip label={badge} size="small" color="primary" />}
              </Stack>
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          )}
          <Box>{children}</Box>
        </Stack>
      </Paper>
    )
  }

  // Always expanded state
  if (alwaysExpanded && !isMobile) {
    return (
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {icon}
            <Typography variant="h6">{title}</Typography>
            {badge && <Chip label={badge} size="small" color="primary" />}
          </Stack>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          <Box>{children}</Box>
        </Stack>
      </Paper>
    )
  }

  // Collapsible accordion
  return (
    <Accordion
      expanded={expanded}
      onChange={(e, isExpanded) => setExpanded(isExpanded)}
      sx={{
        mb: 1,
        '&:before': { display: 'none' },
        boxShadow: theme.shadows[1]
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 56,
          '&.Mui-expanded': {
            minHeight: 56
          }
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ width: '100%', pr: 2 }}
        >
          {icon && <Box sx={{ display: 'flex', alignItems: 'center' }}>{icon}</Box>}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">{title}</Typography>
            {subtitle && !expanded && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {badge && <Chip label={badge} size="small" color="primary" />}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {subtitle && expanded && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </AccordionDetails>
    </Accordion>
  )
}

// Group multiple collapsible panels
interface CollapsiblePanelGroupProps {
  children: React.ReactNode
  allowMultiple?: boolean
}

export const CollapsiblePanelGroup: React.FC<CollapsiblePanelGroupProps> = ({
  children,
  allowMultiple = true
}) => {
  const [expandedPanel, setExpandedPanel] = useState<string | false>(false)

  if (allowMultiple) {
    return <Box>{children}</Box>
  }

  // Single panel expansion logic
  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false)
  }

  return (
    <Box>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            expanded: expandedPanel === `panel${index}`,
            onChange: handleChange(`panel${index}`)
          })
        }
        return child
      })}
    </Box>
  )
}

// Mobile-optimized card that expands
interface ExpandableCardProps {
  title: string
  preview: React.ReactNode
  details: React.ReactNode
  actions?: React.ReactNode
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  preview,
  details,
  actions
}) => {
  const [expanded, setExpanded] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Paper
      elevation={expanded ? 3 : 1}
      sx={{
        mb: 2,
        transition: 'all 0.3s',
        transform: expanded ? 'scale(1.02)' : 'scale(1)',
        cursor: isMobile ? 'pointer' : 'default'
      }}
      onClick={() => isMobile && setExpanded(!expanded)}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          {isMobile && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(!expanded)
              }}
              sx={{
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s'
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          )}
        </Stack>

        {!expanded && (
          <Box sx={{ mt: 1 }}>
            {preview}
          </Box>
        )}

        {(expanded || !isMobile) && (
          <Box sx={{ mt: 2 }}>
            {details}
          </Box>
        )}

        {actions && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            {actions}
          </Box>
        )}
      </Box>
    </Paper>
  )
}