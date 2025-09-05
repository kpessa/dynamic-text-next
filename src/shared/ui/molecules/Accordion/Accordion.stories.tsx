import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { 
  Accordion, 
  ControlledAccordion, 
  SingleExpansionAccordion,
  MultiExpansionAccordion,
  AccordionGroup,
  AccordionWithBadges
} from './Accordion'
import { Box, Typography, TextField, Button, List, ListItem, ListItemText } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import SettingsIcon from '@mui/icons-material/Settings'
import SecurityIcon from '@mui/icons-material/Security'
import PersonIcon from '@mui/icons-material/Person'
import HelpIcon from '@mui/icons-material/Help'

const meta = {
  title: 'Shared/UI/Molecules/Accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible accordion component built on Material UI Accordion with multiple expansion modes and variants.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const items = [
      {
        id: 'panel1',
        title: 'General Settings',
        content: (
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        ),
      },
      {
        id: 'panel2',
        title: 'Advanced Settings',
        content: (
          <Typography>
            Advanced configuration options go here. You can customize various
            aspects of the application behavior and performance.
          </Typography>
        ),
      },
      {
        id: 'panel3',
        title: 'Privacy & Security',
        content: (
          <Typography>
            Manage your privacy settings and security preferences. Control who can
            see your information and how it's used.
          </Typography>
        ),
      },
    ]

    return <Accordion items={items} />
  },
}

export const SingleExpansion: Story = {
  render: () => {
    const items = [
      {
        id: 'faq1',
        title: 'What is this component?',
        content: (
          <Typography>
            This is an accordion component that allows only one panel to be expanded at a time.
            When you open a new panel, the previously opened panel will automatically close.
          </Typography>
        ),
      },
      {
        id: 'faq2',
        title: 'How do I use it?',
        content: (
          <Typography>
            Simply click on any panel header to expand it. The component will handle
            the expansion state automatically.
          </Typography>
        ),
      },
      {
        id: 'faq3',
        title: 'Can I customize it?',
        content: (
          <Typography>
            Yes! You can customize the appearance using variants, add icons,
            control the expansion state, and much more.
          </Typography>
        ),
      },
    ]

    return <SingleExpansionAccordion items={items} />
  },
}

export const MultipleExpansion: Story = {
  render: () => {
    const items = [
      {
        id: 'feature1',
        title: 'Feature One',
        content: (
          <Typography>
            This accordion allows multiple panels to be expanded simultaneously.
            Try opening multiple panels!
          </Typography>
        ),
      },
      {
        id: 'feature2',
        title: 'Feature Two',
        content: (
          <Typography>
            Each panel maintains its own expansion state independently of others.
          </Typography>
        ),
      },
      {
        id: 'feature3',
        title: 'Feature Three',
        content: (
          <Typography>
            This is useful when users might want to compare content across different sections.
          </Typography>
        ),
      },
    ]

    return <MultiExpansionAccordion items={items} />
  },
}

export const WithIcons: Story = {
  render: () => {
    const items = [
      {
        id: 'info',
        title: 'Information',
        icon: <InfoIcon color="info" />,
        content: (
          <Typography>
            General information and guidelines about the application.
          </Typography>
        ),
      },
      {
        id: 'settings',
        title: 'Settings',
        icon: <SettingsIcon color="action" />,
        content: (
          <Typography>
            Configure your preferences and application settings here.
          </Typography>
        ),
      },
      {
        id: 'security',
        title: 'Security',
        icon: <SecurityIcon color="error" />,
        content: (
          <Typography>
            Manage security settings, passwords, and two-factor authentication.
          </Typography>
        ),
      },
    ]

    return <Accordion items={items} showIcon />
  },
}

export const Variants: Story = {
  render: () => {
    const items = [
      {
        id: 'item1',
        title: 'Panel One',
        content: <Typography>Content for panel one</Typography>,
      },
      {
        id: 'item2',
        title: 'Panel Two',
        content: <Typography>Content for panel two</Typography>,
      },
    ]

    return (
      <Box display="flex" flexDirection="column" gap={3}>
        <Box>
          <Typography variant="h6" gutterBottom>Standard Variant</Typography>
          <Accordion items={items} variant="standard" />
        </Box>
        
        <Box>
          <Typography variant="h6" gutterBottom>Outlined Variant</Typography>
          <Accordion items={items} variant="outlined" />
        </Box>
        
        <Box>
          <Typography variant="h6" gutterBottom>Filled Variant</Typography>
          <Accordion items={items} variant="filled" />
        </Box>
      </Box>
    )
  },
}

export const Controlled: Story = {
  render: () => {
    const [expanded, setExpanded] = useState<string | false>('panel1')
    
    const items = [
      {
        id: 'panel1',
        title: 'Controlled Panel 1',
        content: <Typography>This accordion's state is controlled externally.</Typography>,
      },
      {
        id: 'panel2',
        title: 'Controlled Panel 2',
        content: <Typography>The expansion state is managed by the parent component.</Typography>,
      },
      {
        id: 'panel3',
        title: 'Controlled Panel 3',
        content: <Typography>You can programmatically control which panel is open.</Typography>,
      },
    ]

    const handleChange = (id: string, isExpanded: boolean) => {
      setExpanded(isExpanded ? id : false)
    }

    return (
      <Box>
        <Box mb={2}>
          <Button onClick={() => setExpanded('panel1')} sx={{ mr: 1 }}>
            Open Panel 1
          </Button>
          <Button onClick={() => setExpanded('panel2')} sx={{ mr: 1 }}>
            Open Panel 2
          </Button>
          <Button onClick={() => setExpanded('panel3')} sx={{ mr: 1 }}>
            Open Panel 3
          </Button>
          <Button onClick={() => setExpanded(false)} color="secondary">
            Close All
          </Button>
        </Box>
        <Accordion items={items} expanded={expanded} onChange={handleChange} />
        <Typography mt={2} color="text.secondary">
          Currently expanded: {expanded || 'None'}
        </Typography>
      </Box>
    )
  },
}

export const WithBadges: Story = {
  render: () => {
    const items = [
      {
        id: 'messages',
        title: 'Messages',
        content: (
          <List>
            <ListItem>
              <ListItemText primary="New message from John" secondary="Hey, how are you?" />
            </ListItem>
            <ListItem>
              <ListItemText primary="New message from Sarah" secondary="Meeting at 3 PM" />
            </ListItem>
          </List>
        ),
      },
      {
        id: 'notifications',
        title: 'Notifications',
        content: (
          <List>
            <ListItem>
              <ListItemText primary="System Update" secondary="A new update is available" />
            </ListItem>
          </List>
        ),
      },
      {
        id: 'updates',
        title: 'Updates',
        content: (
          <Typography>
            No new updates available at this time.
          </Typography>
        ),
      },
    ]

    const badges = {
      messages: 5,
      notifications: 'New',
      updates: 0,
    }

    return <AccordionWithBadges items={items} badges={badges} />
  },
}

export const DisabledItems: Story = {
  render: () => {
    const items = [
      {
        id: 'active1',
        title: 'Active Panel',
        content: <Typography>This panel is active and can be expanded.</Typography>,
      },
      {
        id: 'disabled1',
        title: 'Disabled Panel',
        content: <Typography>This content is not accessible.</Typography>,
        disabled: true,
      },
      {
        id: 'active2',
        title: 'Another Active Panel',
        content: <Typography>This panel is also active.</Typography>,
      },
      {
        id: 'disabled2',
        title: 'Another Disabled Panel',
        content: <Typography>This content is also not accessible.</Typography>,
        disabled: true,
      },
    ]

    return <Accordion items={items} />
  },
}

export const ComplexContent: Story = {
  render: () => {
    const items = [
      {
        id: 'form',
        title: 'User Registration',
        icon: <PersonIcon />,
        content: (
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="First Name" fullWidth size="small" />
            <TextField label="Last Name" fullWidth size="small" />
            <TextField label="Email" type="email" fullWidth size="small" />
            <TextField label="Password" type="password" fullWidth size="small" />
            <Button variant="contained">Register</Button>
          </Box>
        ),
      },
      {
        id: 'info',
        title: 'Account Information',
        icon: <InfoIcon />,
        content: (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Account Details</Typography>
            <Typography variant="body2" paragraph>
              Username: john.doe@example.com
            </Typography>
            <Typography variant="body2" paragraph>
              Account Type: Premium
            </Typography>
            <Typography variant="body2" paragraph>
              Member Since: January 2024
            </Typography>
            <Button variant="outlined" size="small">Edit Profile</Button>
          </Box>
        ),
      },
      {
        id: 'help',
        title: 'Help & Support',
        icon: <HelpIcon />,
        content: (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Common Questions</Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="How do I reset my password?" />
              </ListItem>
              <ListItem>
                <ListItemText primary="How do I update my payment method?" />
              </ListItem>
              <ListItem>
                <ListItemText primary="How do I cancel my subscription?" />
              </ListItem>
            </List>
            <Button variant="text" size="small">View All FAQs</Button>
          </Box>
        ),
      },
    ]

    return <Accordion items={items} variant="outlined" />
  },
}

export const GroupedAccordions: Story = {
  render: () => {
    const sections = [
      {
        title: 'General Settings',
        variant: 'standard' as const,
        items: [
          {
            id: 'profile',
            title: 'Profile Settings',
            content: <Typography>Manage your profile information</Typography>,
          },
          {
            id: 'preferences',
            title: 'Preferences',
            content: <Typography>Customize your experience</Typography>,
          },
        ],
      },
      {
        title: 'Advanced Settings',
        variant: 'outlined' as const,
        items: [
          {
            id: 'api',
            title: 'API Configuration',
            content: <Typography>Configure API settings and keys</Typography>,
          },
          {
            id: 'integrations',
            title: 'Integrations',
            content: <Typography>Manage third-party integrations</Typography>,
          },
        ],
      },
    ]

    return <AccordionGroup sections={sections} />
  },
}

export const NoExpandIcon: Story = {
  render: () => {
    const items = [
      {
        id: 'panel1',
        title: 'Panel without expand icon',
        content: (
          <Typography>
            This accordion doesn't show the expand/collapse icon.
            You can still click the header to toggle.
          </Typography>
        ),
      },
      {
        id: 'panel2',
        title: 'Another panel',
        content: (
          <Typography>
            The entire header area is clickable for expansion.
          </Typography>
        ),
      },
    ]

    return <Accordion items={items} showIcon={false} />
  },
}