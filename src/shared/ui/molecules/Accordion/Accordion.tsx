import React, { useState } from 'react'
import {
  Accordion as MuiAccordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { cn } from '@/shared/lib/utils'
import type { AccordionProps, AccordionItem } from './Accordion.types'

const StyledAccordion = styled(MuiAccordion, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant?: string }>(({ theme, variant }) => ({
  ...(variant === 'outlined' && {
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&::before': {
      display: 'none',
    },
  }),
  ...(variant === 'filled' && {
    backgroundColor: theme.palette.grey[50],
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[900],
    }),
    '&.Mui-expanded': {
      backgroundColor: theme.palette.background.paper,
    },
  }),
}))

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      items,
      expanded: expandedProp,
      onChange,
      multiple = false,
      variant = 'standard',
      showIcon = true,
      className,
      ...props
    },
    ref
  ) => {
    const [expandedState, setExpandedState] = useState<string | string[] | false>(
      expandedProp !== undefined ? expandedProp : multiple ? [] : false
    )

    const expanded = expandedProp !== undefined ? expandedProp : expandedState

    const isExpanded = (id: string): boolean => {
      if (expanded === false) return false
      if (typeof expanded === 'string') return expanded === id
      return Array.isArray(expanded) && expanded.includes(id)
    }

    const handleChange = (id: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      if (onChange) {
        onChange(id, newExpanded)
      }

      if (expandedProp === undefined) {
        if (multiple) {
          const currentExpanded = Array.isArray(expandedState) ? expandedState : []
          if (newExpanded) {
            setExpandedState([...currentExpanded, id])
          } else {
            setExpandedState(currentExpanded.filter(item => item !== id))
          }
        } else {
          setExpandedState(newExpanded ? id : false)
        }
      }
    }

    return (
      <div ref={ref} className={className}>
        {items.map((item) => (
          <StyledAccordion
            key={item.id}
            expanded={isExpanded(item.id)}
            onChange={handleChange(item.id)}
            disabled={item.disabled}
            variant={variant}
            {...props}
          >
            <AccordionSummary
              expandIcon={showIcon ? <ExpandMoreIcon /> : null}
              aria-controls={`${item.id}-content`}
              id={`${item.id}-header`}
            >
              <Box display="flex" alignItems="center" gap={2} width="100%">
                {item.icon && <Box display="flex">{item.icon}</Box>}
                <Typography sx={{ flexGrow: 1 }}>{item.title}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>{item.content}</AccordionDetails>
          </StyledAccordion>
        ))}
      </div>
    )
  }
)

Accordion.displayName = 'Accordion'

export const ControlledAccordion: React.FC<
  Omit<AccordionProps, 'expanded' | 'onChange'> & {
    defaultExpanded?: string | string[]
    onExpandedChange?: (expanded: string | string[]) => void
  }
> = ({ defaultExpanded, onExpandedChange, multiple = false, ...props }) => {
  const [expanded, setExpanded] = useState<string | string[] | false>(
    defaultExpanded || (multiple ? [] : false)
  )

  const handleChange = (id: string, isExpanded: boolean) => {
    let newExpanded: string | string[] | false
    
    if (multiple) {
      const currentExpanded = Array.isArray(expanded) ? expanded : []
      newExpanded = isExpanded
        ? [...currentExpanded, id]
        : currentExpanded.filter(item => item !== id)
    } else {
      newExpanded = isExpanded ? id : false
    }
    
    setExpanded(newExpanded)
    if (onExpandedChange && newExpanded !== false) {
      onExpandedChange(Array.isArray(newExpanded) ? newExpanded : newExpanded)
    }
  }

  return <Accordion {...props} expanded={expanded} onChange={handleChange} multiple={multiple} />
}

export const SingleExpansionAccordion: React.FC<Omit<AccordionProps, 'multiple'>> = (props) => {
  return <Accordion {...props} multiple={false} />
}

export const MultiExpansionAccordion: React.FC<Omit<AccordionProps, 'multiple'>> = (props) => {
  return <Accordion {...props} multiple={true} />
}

export const AccordionGroup: React.FC<{
  sections: Array<{
    title: string
    items: AccordionItem[]
    variant?: 'standard' | 'outlined' | 'filled'
  }>
  defaultExpanded?: Record<string, string | string[]>
}> = ({ sections, defaultExpanded = {} }) => {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {sections.map((section, index) => (
        <Box key={index}>
          <Typography variant="h6" gutterBottom sx={{ px: 1 }}>
            {section.title}
          </Typography>
          <ControlledAccordion
            items={section.items}
            variant={section.variant}
            defaultExpanded={defaultExpanded[section.title]}
          />
        </Box>
      ))}
    </Box>
  )
}

export const AccordionWithBadges: React.FC<
  AccordionProps & {
    badges?: { [key: string]: string | number }
  }
> = ({ items, badges = {}, ...props }) => {
  const enhancedItems = items.map((item) => ({
    ...item,
    title: (
      <Box display="flex" alignItems="center" gap={1}>
        <span>{item.title}</span>
        {badges[item.id] && (
          <Chip label={badges[item.id]} size="small" color="primary" />
        )}
      </Box>
    ),
  }))

  return <Accordion items={enhancedItems} {...props} />
}