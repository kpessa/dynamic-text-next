import React from 'react'
import {
  Tabs as MuiTabs,
  Tab as MuiTab,
  Box,
  Paper,
  Typography,
  Badge,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { cn } from '@/shared/lib/utils'
import type { TabsProps, TabItem } from './Tabs.types'

interface TabPanelProps {
  children?: React.ReactNode
  value: string | number
  index: string | number
  className?: string
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, className, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }} className={className}>
          {children}
        </Box>
      )}
    </div>
  )
}

const StyledTabs = styled(MuiTabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&.MuiTabs-vertical': {
    borderBottom: 'none',
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}))

const StyledTab = styled(MuiTab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 72,
  fontWeight: theme.typography.fontWeightMedium,
  marginRight: theme.spacing(4),
  '&:hover': {
    color: theme.palette.primary.main,
    opacity: 1,
  },
  '&.Mui-selected': {
    fontWeight: theme.typography.fontWeightBold,
  },
  '&.Mui-disabled': {
    color: theme.palette.text.disabled,
  },
  '&.MuiTab-fullWidth': {
    marginRight: 0,
  },
}))

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value,
      onChange,
      tabs,
      variant = 'standard',
      orientation = 'horizontal',
      centered = false,
      showContent = true,
      contentClassName,
      tabClassName,
      iconPosition = 'start',
      className,
      ...props
    },
    ref
  ) => {
    const handleChange = (event: React.SyntheticEvent, newValue: string | number) => {
      onChange(newValue)
    }

    const tabsVariant = variant === 'fullWidth' ? 'fullWidth' : variant === 'scrollable' ? 'scrollable' : 'standard'
    const scrollButtons = variant === 'scrollable' ? 'auto' : false

    const a11yProps = (index: string | number) => {
      return {
        id: `tab-${index}`,
        'aria-controls': `tabpanel-${index}`,
      }
    }

    return (
      <div ref={ref} className={className}>
        <Box
          sx={{
            display: orientation === 'vertical' ? 'flex' : 'block',
            height: orientation === 'vertical' ? '100%' : 'auto',
          }}
        >
          <StyledTabs
            value={value}
            onChange={handleChange}
            variant={tabsVariant}
            orientation={orientation}
            centered={centered && variant !== 'scrollable' && variant !== 'fullWidth'}
            scrollButtons={scrollButtons}
            allowScrollButtonsMobile
            {...props}
          >
            {tabs.map((tab) => (
              <StyledTab
                key={tab.value}
                label={tab.label}
                value={tab.value}
                icon={tab.icon}
                iconPosition={iconPosition}
                disabled={tab.disabled}
                className={tabClassName}
                {...a11yProps(tab.value)}
              />
            ))}
          </StyledTabs>

          {showContent && (
            <Box sx={{ flexGrow: 1 }}>
              {tabs.map((tab) => (
                <TabPanel
                  key={tab.value}
                  value={value}
                  index={tab.value}
                  className={contentClassName}
                >
                  {tab.content}
                </TabPanel>
              ))}
            </Box>
          )}
        </Box>
      </div>
    )
  }
)

Tabs.displayName = 'Tabs'

export const ScrollableTabs: React.FC<
  Omit<TabsProps, 'variant'> & {
    maxWidth?: number | string
  }
> = ({ maxWidth = '100%', ...props }) => {
  return (
    <Box sx={{ maxWidth, bgcolor: 'background.paper' }}>
      <Tabs variant="scrollable" {...props} />
    </Box>
  )
}

export const VerticalTabs: React.FC<
  Omit<TabsProps, 'orientation'> & {
    minHeight?: number | string
  }
> = ({ minHeight = 400, ...props }) => {
  return (
    <Box sx={{ minHeight, display: 'flex', bgcolor: 'background.paper' }}>
      <Tabs orientation="vertical" {...props} />
    </Box>
  )
}

export const IconTabs: React.FC<TabsProps> = (props) => {
  return <Tabs iconPosition="top" {...props} />
}

export const BadgeTabs: React.FC<
  TabsProps & {
    badges?: { [key: string | number]: number | string }
  }
> = ({ tabs, badges = {}, ...props }) => {
  const enhancedTabs = tabs.map((tab) => ({
    ...tab,
    label: badges[tab.value] ? (
      <Badge badgeContent={badges[tab.value]} color="primary">
        {tab.label}
      </Badge>
    ) : (
      tab.label
    ),
  }))

  return <Tabs tabs={enhancedTabs} {...props} />
}