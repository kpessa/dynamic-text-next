import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, ScrollableTabs, VerticalTabs, IconTabs, BadgeTabs } from './Tabs'
import { Box, Typography, Paper, TextField, Button, Switch, FormControlLabel } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import NotificationsIcon from '@mui/icons-material/Notifications'
import FavoriteIcon from '@mui/icons-material/Favorite'
import SecurityIcon from '@mui/icons-material/Security'
import InfoIcon from '@mui/icons-material/Info'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'

const meta = {
  title: 'Shared/UI/Molecules/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible tabs component built on Material UI Tabs with multiple variants and configurations.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

const TabContent: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <Box>
    <Typography variant="h5" gutterBottom>
      {title}
    </Typography>
    <Typography paragraph color="text.secondary">
      {description}
    </Typography>
  </Box>
)

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('tab1')
    
    const tabs = [
      {
        label: 'Overview',
        value: 'tab1',
        content: <TabContent title="Overview" description="This is the overview tab content. It provides general information about the topic." />,
      },
      {
        label: 'Details',
        value: 'tab2',
        content: <TabContent title="Details" description="Detailed information goes here. You can add forms, lists, or any other components." />,
      },
      {
        label: 'Settings',
        value: 'tab3',
        content: <TabContent title="Settings" description="Configuration and settings options would be displayed in this tab." />,
      },
    ]
    
    return <Tabs value={value} onChange={setValue} tabs={tabs} />
  },
}

export const WithIcons: Story = {
  render: () => {
    const [value, setValue] = useState('home')
    
    const tabs = [
      {
        label: 'Home',
        value: 'home',
        icon: <HomeIcon />,
        content: <TabContent title="Home" description="Welcome to the home tab." />,
      },
      {
        label: 'Profile',
        value: 'profile',
        icon: <PersonIcon />,
        content: <TabContent title="Profile" description="User profile information." />,
      },
      {
        label: 'Settings',
        value: 'settings',
        icon: <SettingsIcon />,
        content: <TabContent title="Settings" description="Application settings." />,
      },
    ]
    
    return <Tabs value={value} onChange={setValue} tabs={tabs} />
  },
}

export const IconPositions: Story = {
  render: () => {
    const positions = ['top', 'start', 'end', 'bottom'] as const
    const [selectedPositions, setSelectedPositions] = useState<Record<string, string>>({
      top: 'home',
      start: 'home',
      end: 'home',
      bottom: 'home',
    })
    
    const tabs = [
      { label: 'Home', value: 'home', icon: <HomeIcon /> },
      { label: 'Profile', value: 'profile', icon: <PersonIcon /> },
      { label: 'Settings', value: 'settings', icon: <SettingsIcon /> },
    ]
    
    return (
      <Box display="flex" flexDirection="column" gap={4}>
        {positions.map((position) => (
          <Paper key={position} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Icon Position: {position}
            </Typography>
            <Tabs
              value={selectedPositions[position]}
              onChange={(value) => setSelectedPositions({ ...selectedPositions, [position]: value as string })}
              tabs={tabs}
              iconPosition={position}
              showContent={false}
            />
          </Paper>
        ))}
      </Box>
    )
  },
}

export const Scrollable: Story = {
  render: () => {
    const [value, setValue] = useState('tab1')
    
    const tabs = Array.from({ length: 20 }, (_, i) => ({
      label: `Tab ${i + 1}`,
      value: `tab${i + 1}`,
      content: <TabContent title={`Tab ${i + 1}`} description={`Content for tab ${i + 1}`} />,
    }))
    
    return (
      <Box sx={{ maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom>
          Scrollable Tabs (Many Items)
        </Typography>
        <ScrollableTabs value={value} onChange={setValue} tabs={tabs} />
      </Box>
    )
  },
}

export const FullWidth: Story = {
  render: () => {
    const [value, setValue] = useState('tab1')
    
    const tabs = [
      {
        label: 'First',
        value: 'tab1',
        content: <TabContent title="First Tab" description="Full width tabs distribute equally across the container." />,
      },
      {
        label: 'Second',
        value: 'tab2',
        content: <TabContent title="Second Tab" description="Each tab takes up an equal amount of space." />,
      },
      {
        label: 'Third',
        value: 'tab3',
        content: <TabContent title="Third Tab" description="This is useful for mobile layouts or when you have few tabs." />,
      },
    ]
    
    return (
      <Box sx={{ width: '100%' }}>
        <Tabs value={value} onChange={setValue} tabs={tabs} variant="fullWidth" />
      </Box>
    )
  },
}

export const Vertical: Story = {
  render: () => {
    const [value, setValue] = useState('general')
    
    const tabs = [
      {
        label: 'General',
        value: 'general',
        icon: <InfoIcon />,
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>General Settings</Typography>
            <FormControlLabel control={<Switch defaultChecked />} label="Enable notifications" />
            <FormControlLabel control={<Switch />} label="Show profile publicly" />
          </Box>
        ),
      },
      {
        label: 'Security',
        value: 'security',
        icon: <SecurityIcon />,
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>Security Settings</Typography>
            <FormControlLabel control={<Switch defaultChecked />} label="Two-factor authentication" />
            <FormControlLabel control={<Switch defaultChecked />} label="Login alerts" />
          </Box>
        ),
      },
      {
        label: 'Notifications',
        value: 'notifications',
        icon: <NotificationsIcon />,
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>Notification Preferences</Typography>
            <FormControlLabel control={<Switch defaultChecked />} label="Email notifications" />
            <FormControlLabel control={<Switch />} label="Push notifications" />
          </Box>
        ),
      },
    ]
    
    return <VerticalTabs value={value} onChange={setValue} tabs={tabs} minHeight={300} />
  },
}

export const Centered: Story = {
  render: () => {
    const [value, setValue] = useState('tab1')
    
    const tabs = [
      {
        label: 'Products',
        value: 'tab1',
        content: <TabContent title="Products" description="Browse our product catalog." />,
      },
      {
        label: 'Services',
        value: 'tab2',
        content: <TabContent title="Services" description="Explore our service offerings." />,
      },
      {
        label: 'About',
        value: 'tab3',
        content: <TabContent title="About" description="Learn more about our company." />,
      },
    ]
    
    return <Tabs value={value} onChange={setValue} tabs={tabs} centered />
  },
}

export const WithBadges: Story = {
  render: () => {
    const [value, setValue] = useState('messages')
    const [badges, setBadges] = useState({
      messages: 5,
      notifications: 12,
      updates: 3,
    })
    
    const tabs = [
      {
        label: 'Messages',
        value: 'messages',
        icon: <EmailIcon />,
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>Messages ({badges.messages})</Typography>
            <Button onClick={() => setBadges({ ...badges, messages: 0 })}>
              Mark all as read
            </Button>
          </Box>
        ),
      },
      {
        label: 'Notifications',
        value: 'notifications',
        icon: <NotificationsIcon />,
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>Notifications ({badges.notifications})</Typography>
            <Button onClick={() => setBadges({ ...badges, notifications: 0 })}>
              Clear all
            </Button>
          </Box>
        ),
      },
      {
        label: 'Updates',
        value: 'updates',
        icon: <InfoIcon />,
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>Updates ({badges.updates})</Typography>
            <Button onClick={() => setBadges({ ...badges, updates: 0 })}>
              Dismiss all
            </Button>
          </Box>
        ),
      },
    ]
    
    return <BadgeTabs value={value} onChange={setValue} tabs={tabs} badges={badges} />
  },
}

export const DisabledTabs: Story = {
  render: () => {
    const [value, setValue] = useState('active1')
    
    const tabs = [
      {
        label: 'Active Tab 1',
        value: 'active1',
        content: <TabContent title="Active Tab 1" description="This tab is active and clickable." />,
      },
      {
        label: 'Disabled Tab',
        value: 'disabled',
        disabled: true,
        content: <TabContent title="Disabled" description="This content should not be visible." />,
      },
      {
        label: 'Active Tab 2',
        value: 'active2',
        content: <TabContent title="Active Tab 2" description="Another active tab." />,
      },
    ]
    
    return <Tabs value={value} onChange={setValue} tabs={tabs} />
  },
}

export const WithoutContent: Story = {
  render: () => {
    const [value, setValue] = useState('tab1')
    
    const tabs = [
      { label: 'Tab 1', value: 'tab1' },
      { label: 'Tab 2', value: 'tab2' },
      { label: 'Tab 3', value: 'tab3' },
      { label: 'Tab 4', value: 'tab4' },
    ]
    
    return (
      <Box>
        <Tabs value={value} onChange={setValue} tabs={tabs} showContent={false} />
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6">
            Selected Tab: {value}
          </Typography>
          <Typography color="text.secondary">
            Content is managed separately when showContent is false
          </Typography>
        </Paper>
      </Box>
    )
  },
}

export const CustomStyling: Story = {
  render: () => {
    const [value, setValue] = useState('tab1')
    
    const tabs = [
      {
        label: 'Primary',
        value: 'tab1',
        content: <TabContent title="Primary Content" description="Custom styled tabs example." />,
      },
      {
        label: 'Secondary',
        value: 'tab2',
        content: <TabContent title="Secondary Content" description="With custom colors and styling." />,
      },
      {
        label: 'Tertiary',
        value: 'tab3',
        content: <TabContent title="Tertiary Content" description="Demonstrating flexibility in design." />,
      },
    ]
    
    return (
      <Paper sx={{ bgcolor: 'primary.dark', color: 'white' }}>
        <Tabs
          value={value}
          onChange={setValue}
          tabs={tabs}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ borderBottom: 1, borderColor: 'primary.light' }}
        />
      </Paper>
    )
  },
}

export const ComplexContent: Story = {
  render: () => {
    const [value, setValue] = useState('form')
    
    const tabs = [
      {
        label: 'Form',
        value: 'form',
        icon: <PersonIcon />,
        content: (
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Name" fullWidth />
            <TextField label="Email" type="email" fullWidth />
            <TextField label="Message" multiline rows={4} fullWidth />
            <Button variant="contained">Submit</Button>
          </Box>
        ),
      },
      {
        label: 'Contact',
        value: 'contact',
        icon: <PhoneIcon />,
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>Contact Information</Typography>
            <Typography paragraph>Phone: +1 234 567 8900</Typography>
            <Typography paragraph>Email: contact@example.com</Typography>
            <Typography paragraph>Address: 123 Main St, City, State 12345</Typography>
          </Box>
        ),
      },
      {
        label: 'Social',
        value: 'social',
        icon: <FavoriteIcon />,
        content: (
          <Box>
            <Typography variant="h6" gutterBottom>Follow Us</Typography>
            <Box display="flex" gap={2}>
              <Button variant="outlined">Facebook</Button>
              <Button variant="outlined">Twitter</Button>
              <Button variant="outlined">LinkedIn</Button>
            </Box>
          </Box>
        ),
      },
    ]
    
    return (
      <Paper sx={{ p: 2 }}>
        <Tabs value={value} onChange={setValue} tabs={tabs} />
      </Paper>
    )
  },
}